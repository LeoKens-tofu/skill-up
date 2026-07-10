import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.config";
import { Student } from "../models/student.model";
import { StudyGroup } from "../models/study-group.model";
import { GroupMessage } from "../models/group-message.model";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://mindmaster.click",
  "https://www.mindmaster.click",
];

const JWT_SECRET = (process.env.JWT_SECRET as string) || "skillup_secret_key_123";

type SocketUser = {
  id: string;
  fullName: string;
  avatar: string;
  studentId: string;
};

const roomOf = (groupId: string) => `group:${groupId}`;

// Parse chuỗi cookie thô từ handshake ("a=1; b=2") thành object
const parseCookies = (raw: string): Record<string, string> => {
  const out: Record<string, string> = {};
  raw.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      if (key) out[key] = decodeURIComponent(val);
    }
  });
  return out;
};

let io: Server | null = null;

export const getIO = (): Server => {
  if (!io) throw new Error("Socket.io chưa được khởi tạo");
  return io;
};

// Đếm & phát số người đang online trong 1 nhóm (theo user, không theo socket)
const emitPresence = async (groupId: string) => {
  if (!io) return;
  const sockets = await io.in(roomOf(groupId)).fetchSockets();
  const userIds = [...new Set(sockets.map((s) => String((s.data.user as SocketUser)?.id)))].filter(Boolean);
  io.to(roomOf(groupId)).emit("presence:update", {
    groupId,
    online: userIds.length,
    userIds,
  });
};

// Kiểm tra user có phải thành viên nhóm không
const isMember = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    const group = await StudyGroup.findOne({
      _id: groupId,
      isDeleted: false,
      "members.studentId": userId,
    }).select("_id");
    return !!group;
  } catch {
    return false;
  }
};

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: ALLOWED_ORIGINS,
      credentials: true,
    },
    maxHttpBufferSize: 5 * 1024 * 1024, // 5MB (phòng payload lớn, file thật đi qua REST)
  });

  // Handshake auth: dùng lại đúng cơ chế JWT cookie + Redis session
  io.use(async (socket: Socket, next) => {
    try {
      const raw = socket.handshake.headers.cookie || "";
      const token = parseCookies(raw).token;
      if (!token) return next(new Error("unauthorized"));

      const decoded: any = jwt.verify(token, JWT_SECRET);

      if (redisClient.isOpen) {
        const activeVersion = await redisClient.get(`auth:session:${decoded.id}`);
        if (!activeVersion || decoded.tokenVersion !== activeVersion) {
          return next(new Error("unauthorized"));
        }
      }

      const student = await Student.findById(decoded.id).select("fullName avatar studentId");
      socket.data.user = {
        id: String(decoded.id),
        fullName: student?.get("fullName") || decoded.email || "Người dùng",
        avatar: student?.get("avatar") || "",
        studentId: student?.get("studentId") || "",
      } as SocketUser;

      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user as SocketUser;
    const joinedGroups = new Set<string>();

    // Tham gia room 1 nhóm (chỉ khi là thành viên)
    socket.on("group:join", async (groupId: string, cb?: (r: any) => void) => {
      if (!groupId || !(await isMember(groupId, user.id))) {
        return cb?.({ ok: false, message: "Bạn không thuộc nhóm này" });
      }
      socket.join(roomOf(groupId));
      joinedGroups.add(groupId);
      await emitPresence(groupId);
      cb?.({ ok: true });
    });

    // Rời room nhóm (khi chuyển nhóm khác)
    socket.on("group:leave", async (groupId: string) => {
      if (!groupId) return;
      socket.leave(roomOf(groupId));
      joinedGroups.delete(groupId);
      await emitPresence(groupId);
    });

    // Gửi tin nhắn: xác thực thành viên → lưu DB → broadcast cả room (kể cả người gửi)
    socket.on(
      "message:send",
      async (
        payload: {
          groupId: string;
          type?: "text" | "image" | "file" | "sticker";
          text?: string;
          attachments?: { url: string; name?: string; size?: number; mime?: string }[];
          sticker?: string;
        },
        cb?: (r: any) => void
      ) => {
        try {
          const { groupId } = payload || ({} as any);
          if (!groupId || !(await isMember(groupId, user.id))) {
            return cb?.({ ok: false, message: "Không thể gửi tin nhắn" });
          }

          const type = payload.type || "text";
          const text = (payload.text || "").toString().slice(0, 5000);
          const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];
          const sticker = (payload.sticker || "").toString();

          // Không cho gửi tin rỗng
          if (type === "text" && !text.trim()) {
            return cb?.({ ok: false, message: "Tin nhắn rỗng" });
          }
          if ((type === "image" || type === "file") && attachments.length === 0) {
            return cb?.({ ok: false, message: "Thiếu tệp đính kèm" });
          }
          if (type === "sticker" && !sticker) {
            return cb?.({ ok: false, message: "Thiếu sticker" });
          }

          const doc = await GroupMessage.create({
            groupId,
            senderId: user.id,
            type,
            text,
            attachments,
            sticker,
          });

          // Cập nhật xem nhanh tin cuối cho danh sách nhóm
          const preview =
            type === "text"
              ? text
              : type === "image"
              ? "📷 Hình ảnh"
              : type === "file"
              ? "📎 Tệp đính kèm"
              : "😄 Sticker";
          await StudyGroup.updateOne(
            { _id: groupId },
            { lastMessageText: preview.slice(0, 200), lastSenderName: user.fullName, lastMessageAt: doc.get("createdAt") }
          );

          const message = {
            _id: String(doc._id),
            groupId,
            type,
            text,
            attachments,
            sticker,
            sender: {
              _id: user.id,
              fullName: user.fullName,
              avatar: user.avatar,
              studentId: user.studentId,
            },
            createdAt: doc.get("createdAt"),
          };

          io?.to(roomOf(groupId)).emit("message:new", message);
          cb?.({ ok: true, message });
        } catch (err) {
          console.error("message:send error", err);
          cb?.({ ok: false, message: "Lỗi máy chủ" });
        }
      }
    );

    // Đang gõ… (chỉ phát cho người khác trong room)
    socket.on("typing", (data: { groupId: string; isTyping: boolean }) => {
      if (!data?.groupId) return;
      socket.to(roomOf(data.groupId)).emit("typing", {
        groupId: data.groupId,
        userId: user.id,
        name: user.fullName,
        isTyping: !!data.isTyping,
      });
    });

    // Cập nhật presence cho các nhóm đang mở khi ngắt kết nối
    socket.on("disconnect", async () => {
      for (const groupId of joinedGroups) {
        await emitPresence(groupId);
      }
    });
  });

  return io;
};

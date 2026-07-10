import { Request, Response } from "express";
import mongoose from "mongoose";
import { StudyGroup } from "../../models/study-group.model";
import { GroupMessage } from "../../models/group-message.model";

// Bảng mã sinh inviteCode (bỏ ký tự dễ nhầm: 0/O, 1/I/L)
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LEN = 7;

const randomCode = (): string => {
  let code = "";
  for (let i = 0; i < CODE_LEN; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
};

// Sinh inviteCode chưa trùng trong DB
const generateInviteCode = async (): Promise<string> => {
  for (let i = 0; i < 8; i++) {
    const code = randomCode();
    const exists = await StudyGroup.findOne({ inviteCode: code }).select("_id");
    if (!exists) return code;
  }
  // Cực hiếm khi trùng liên tục — thêm hậu tố thời gian
  return randomCode() + Date.now().toString(36).slice(-3).toUpperCase();
};

// Gói dữ liệu nhóm cho danh sách / phản hồi tạo/join
const serializeGroup = (group: any, userId: string) => {
  const me = (group.members || []).find((m: any) => String(m.studentId) === String(userId));
  return {
    _id: String(group._id),
    name: group.name,
    subject: group.subject || "",
    description: group.description || "",
    color: group.color || "#FF6B35",
    inviteCode: group.inviteCode,
    memberCount: (group.members || []).length,
    role: me?.role || "member",
    lastMessageText: group.lastMessageText || "",
    lastSenderName: group.lastSenderName || "",
    lastMessageAt: group.lastMessageAt || null,
    createdAt: group.createdAt,
  };
};

// Kiểm tra user có thuộc nhóm không; trả group nếu có
const findMemberGroup = async (groupId: string, userId: string) => {
  if (!mongoose.isValidObjectId(groupId)) return null;
  return StudyGroup.findOne({
    _id: groupId,
    isDeleted: false,
    "members.studentId": userId,
  });
};

// [GET] /api/client/student/groups — danh sách nhóm của tôi
export const listMyGroups = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json({ code: "error", message: "Chưa đăng nhập" });

    const groups = await StudyGroup.find({
      isDeleted: false,
      "members.studentId": userId,
    }).sort({ lastMessageAt: -1, updatedAt: -1 });

    return res.json({
      code: "success",
      message: "Lấy danh sách nhóm thành công",
      data: groups.map((g) => serializeGroup(g, userId)),
    });
  } catch (error) {
    console.error("listMyGroups error", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [POST] /api/client/student/groups — tạo nhóm mới
export const createGroup = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json({ code: "error", message: "Chưa đăng nhập" });

    const { name, subject, description, color } = req.body || {};
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.json({ code: "error", message: "Tên nhóm phải có ít nhất 2 ký tự" });
    }

    const inviteCode = await generateInviteCode();
    const group = await StudyGroup.create({
      name: name.trim().slice(0, 100),
      subject: (subject || "").toString().trim().slice(0, 50),
      description: (description || "").toString().trim().slice(0, 300),
      color: (color || "#FF6B35").toString(),
      ownerId: userId,
      members: [{ studentId: userId, role: "owner", joinedAt: new Date() }],
      inviteCode,
    });

    return res.json({
      code: "success",
      message: "Tạo nhóm thành công",
      data: serializeGroup(group, userId),
    });
  } catch (error) {
    console.error("createGroup error", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [GET] /api/client/student/groups/:id — chi tiết nhóm + thành viên (cần là thành viên)
export const getGroupDetail = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json({ code: "error", message: "Chưa đăng nhập" });

    const group = await findMemberGroup(String(req.params.id), userId);
    if (!group) return res.json({ code: "error", message: "Nhóm không tồn tại hoặc bạn chưa tham gia" });

    await group.populate({ path: "members.studentId", select: "fullName avatar studentId level title" });

    const members = (group.get("members") || []).map((m: any) => {
      const s = m.studentId || {};
      return {
        _id: String(s._id || m.studentId),
        fullName: s.fullName || "Ẩn danh",
        avatar: s.avatar || "",
        studentId: s.studentId || "",
        level: s.level || 1,
        title: s.title || "",
        role: m.role,
      };
    });

    return res.json({
      code: "success",
      message: "Lấy chi tiết nhóm thành công",
      data: { ...serializeGroup(group, userId), members },
    });
  } catch (error) {
    console.error("getGroupDetail error", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [GET] /api/client/student/groups/invite/:code — xem trước nhóm theo link mời (không cần là thành viên)
export const getGroupByInvite = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json({ code: "error", message: "Chưa đăng nhập" });

    const code = (req.params.code || "").toString().trim().toUpperCase();
    const group = await StudyGroup.findOne({ inviteCode: code, isDeleted: false });
    if (!group) return res.json({ code: "error", message: "Link mời không hợp lệ hoặc đã hết hạn" });

    const alreadyMember = (group.get("members") || []).some(
      (m: any) => String(m.studentId) === String(userId)
    );

    return res.json({
      code: "success",
      message: "Lấy thông tin nhóm thành công",
      data: {
        _id: String(group._id),
        name: group.get("name"),
        subject: group.get("subject") || "",
        description: group.get("description") || "",
        color: group.get("color") || "#FF6B35",
        memberCount: (group.get("members") || []).length,
        inviteCode: group.get("inviteCode"),
        alreadyMember,
      },
    });
  } catch (error) {
    console.error("getGroupByInvite error", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [POST] /api/client/student/groups/join — tham gia nhóm bằng inviteCode
export const joinGroup = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json({ code: "error", message: "Chưa đăng nhập" });

    const code = (req.body?.code || "").toString().trim().toUpperCase();
    if (!code) return res.json({ code: "error", message: "Thiếu mã mời" });

    const group = await StudyGroup.findOne({ inviteCode: code, isDeleted: false });
    if (!group) return res.json({ code: "error", message: "Link mời không hợp lệ hoặc đã hết hạn" });

    const already = (group.get("members") || []).some(
      (m: any) => String(m.studentId) === String(userId)
    );

    if (!already) {
      // Dùng $addToSet để tránh trùng nếu 2 request cùng lúc
      await StudyGroup.updateOne(
        { _id: group._id },
        { $addToSet: { members: { studentId: userId, role: "member", joinedAt: new Date() } } }
      );
    }

    const fresh = await StudyGroup.findById(group._id);
    return res.json({
      code: "success",
      message: already ? "Bạn đã ở trong nhóm này" : "Tham gia nhóm thành công",
      data: serializeGroup(fresh, userId),
    });
  } catch (error) {
    console.error("joinGroup error", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [POST] /api/client/student/groups/:id/leave — rời nhóm
export const leaveGroup = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json({ code: "error", message: "Chưa đăng nhập" });

    const group = await findMemberGroup(String(req.params.id), userId);
    if (!group) return res.json({ code: "error", message: "Nhóm không tồn tại hoặc bạn chưa tham gia" });

    if (String(group.get("ownerId")) === String(userId)) {
      return res.json({ code: "error", message: "Chủ nhóm không thể rời nhóm. Hãy xóa nhóm nếu muốn." });
    }

    await StudyGroup.updateOne(
      { _id: group._id },
      { $pull: { members: { studentId: new mongoose.Types.ObjectId(userId) } } }
    );

    return res.json({ code: "success", message: "Đã rời nhóm", data: { _id: String(group._id) } });
  } catch (error) {
    console.error("leaveGroup error", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [GET] /api/client/student/groups/:id/messages?before=<ISO>&limit=30 — lịch sử tin nhắn
export const getMessages = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json({ code: "error", message: "Chưa đăng nhập" });

    const group = await findMemberGroup(String(req.params.id), userId);
    if (!group) return res.json({ code: "error", message: "Nhóm không tồn tại hoặc bạn chưa tham gia" });

    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 30));
    const filter: any = { groupId: group._id };
    if (req.query.before) {
      const before = new Date(req.query.before as string);
      if (!isNaN(before.getTime())) filter.createdAt = { $lt: before };
    }

    // Lấy N tin mới nhất trước mốc → đảo lại thành cũ→mới để render
    const docs = await GroupMessage.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: "senderId", select: "fullName avatar studentId" });

    const hasMore = docs.length === limit;

    const messages = docs
      .map((d) => {
        const s: any = d.get("senderId") || {};
        return {
          _id: String(d._id),
          groupId: String(group._id),
          type: d.get("type"),
          text: d.get("text") || "",
          attachments: d.get("attachments") || [],
          sticker: d.get("sticker") || "",
          sender: {
            _id: String(s._id || d.get("senderId")),
            fullName: s.fullName || "Ẩn danh",
            avatar: s.avatar || "",
            studentId: s.studentId || "",
          },
          createdAt: d.get("createdAt"),
        };
      })
      .reverse();

    return res.json({
      code: "success",
      message: "Lấy tin nhắn thành công",
      data: { messages, hasMore },
    });
  } catch (error) {
    console.error("getMessages error", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [POST] /api/client/student/groups/:id/upload — upload 1 file đính kèm (multer single "file")
export const uploadAttachment = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json({ code: "error", message: "Chưa đăng nhập" });

    const group = await findMemberGroup(String(req.params.id), userId);
    if (!group) return res.json({ code: "error", message: "Nhóm không tồn tại hoặc bạn chưa tham gia" });

    if (!req.file) return res.json({ code: "error", message: "Không nhận được file" });

    const isImage = (req.file.mimetype || "").startsWith("image/");
    return res.json({
      code: "success",
      message: "Tải lên thành công",
      data: {
        url: `/uploads/group-chat/${req.file.filename}`,
        name: req.file.originalname,
        size: req.file.size, // byte, frontend tự format
        mime: req.file.mimetype,
        kind: isImage ? "image" : "file",
      },
    });
  } catch (error) {
    console.error("uploadAttachment error", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

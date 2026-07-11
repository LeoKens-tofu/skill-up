'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Send, Smile, Loader2, ChevronUp, Paperclip, Sticker, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { getSocket, API_URL, fileUrl } from "@/lib/socket";

// emoji-picker-react truy cập window → tải phía client, tránh SSR
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const SHADOW_XS = "2px 2px 0px 0px rgba(0,0,0,1)";

type Attachment = { url: string; name?: string; size?: number; mime?: string };
export type ChatMessage = {
  _id: string;
  groupId: string;
  type: "text" | "image" | "file" | "sticker";
  text: string;
  attachments: Attachment[];
  sticker: string;
  mentions?: string[];
  mentionAll?: boolean;
  sender: { _id: string; fullName: string; avatar: string; studentId: string };
  createdAt: string;
};

type MentionUser = { _id: string; fullName: string; avatar?: string };
const ALL_MENTION = { _id: "__all__", fullName: "Tất cả" };

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const initials = (name: string) =>
  (name || "?").trim().split(/\s+/).slice(-2).map((w) => w[0]).join("").toUpperCase();

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

const humanSize = (bytes: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

// Bộ emoji-sticker cỡ lớn (không cần asset ảnh)
const STICKERS = [
  "👍", "🎉", "🔥", "❤️", "😂", "😍", "😎", "🤔",
  "👏", "🙌", "💯", "✅", "❌", "🚀", "⭐", "💡",
  "😭", "😱", "🥳", "🤝", "💪", "🙏", "👀", "🧠",
  "☕", "📚", "⏰", "🎯", "😴", "🤯", "🫡", "🐧",
];

export default function GroupChat({
  groupId,
  groupColor,
  myId,
  members = [],
}: {
  groupId: string;
  groupColor: string;
  myId: string;
  members?: MentionUser[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [online, setOnline] = useState(1);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [uploading, setUploading] = useState(false);

  // @mention
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState(0);
  const [mentionIndex, setMentionIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputEl = useRef<HTMLInputElement>(null);
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const selfTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingSent = useRef(false);

  const scrollToBottom = useCallback((smooth = false) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  // Đánh dấu / gỡ 1 người đang gõ (tự hết hạn sau 3s)
  const bumpTyping = useCallback((userId: string, name: string, on: boolean) => {
    if (typingTimers.current[userId]) clearTimeout(typingTimers.current[userId]);
    if (on) {
      setTypingNames((prev) => (prev.includes(name) ? prev : [...prev, name]));
      typingTimers.current[userId] = setTimeout(() => {
        setTypingNames((prev) => prev.filter((n) => n !== name));
        delete typingTimers.current[userId];
      }, 3000);
    } else {
      setTypingNames((prev) => prev.filter((n) => n !== name));
      delete typingTimers.current[userId];
    }
  }, []);

  // Socket: join room + đăng ký listeners (component được key theo groupId nên mount lại mỗi nhóm)
  useEffect(() => {
    const socket = getSocket();

    const onNew = (msg: ChatMessage) => {
      if (msg.groupId !== groupId) return;
      setMessages((prev) => [...prev, msg]);
      // Người khác gửi → coi như hết gõ
      bumpTyping(msg.sender._id, msg.sender.fullName, false);
    };
    const onTyping = (d: { groupId: string; userId: string; name: string; isTyping: boolean }) => {
      if (d.groupId !== groupId || d.userId === myId) return;
      bumpTyping(d.userId, d.name, d.isTyping);
    };
    const onPresence = (d: { groupId: string; online: number }) => {
      if (d.groupId === groupId) setOnline(d.online);
    };
    const onConnectError = () => toast.error("Mất kết nối chat, đang thử lại...");

    socket.on("message:new", onNew);
    socket.on("typing", onTyping);
    socket.on("presence:update", onPresence);
    socket.on("connect_error", onConnectError);

    socket.emit("group:join", groupId, (r: any) => {
      if (!r?.ok) toast.error(r?.message || "Không vào được phòng chat");
    });

    return () => {
      socket.emit("group:leave", groupId);
      socket.off("message:new", onNew);
      socket.off("typing", onTyping);
      socket.off("presence:update", onPresence);
      socket.off("connect_error", onConnectError);
      Object.values(typingTimers.current).forEach(clearTimeout);
      typingTimers.current = {};
    };
  }, [groupId, myId, bumpTyping]);

  // Tải lịch sử tin nhắn ban đầu
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setMessages([]);
    fetch(`${API_URL}/client/student/groups/${groupId}/messages?limit=30`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.code === "success") {
          setMessages(d.data.messages);
          setHasMore(d.data.hasMore);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) {
          setLoading(false);
          requestAnimationFrame(() => scrollToBottom());
        }
      });
    return () => { alive = false; };
  }, [groupId, scrollToBottom]);

  // Tự cuộn xuống khi có tin mới (nếu đang ở gần đáy)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (nearBottom) scrollToBottom(true);
  }, [messages, typingNames, scrollToBottom]);

  const loadOlder = async () => {
    if (loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight || 0;
    try {
      const before = messages[0].createdAt;
      const res = await fetch(
        `${API_URL}/client/student/groups/${groupId}/messages?limit=30&before=${encodeURIComponent(before)}`,
        { credentials: "include" }
      );
      const d = await res.json();
      if (d.code === "success") {
        setMessages((prev) => [...d.data.messages, ...prev]);
        setHasMore(d.data.hasMore);
        // Giữ nguyên vị trí cuộn sau khi chèn tin cũ lên đầu
        requestAnimationFrame(() => {
          if (el) el.scrollTop = el.scrollHeight - prevHeight;
        });
      }
    } catch {
      toast.error("Không tải được tin cũ");
    } finally {
      setLoadingMore(false);
    }
  };

  const emitTyping = (on: boolean) => {
    const socket = getSocket();
    if (on && !isTypingSent.current) {
      socket.emit("typing", { groupId, isTyping: true });
      isTypingSent.current = true;
    }
    if (!on && isTypingSent.current) {
      socket.emit("typing", { groupId, isTyping: false });
      isTypingSent.current = false;
    }
  };

  // Phát hiện đang gõ "@..." ngay trước con trỏ để bật gợi ý
  const detectMention = (v: string, caret: number) => {
    const upto = v.slice(0, caret);
    const at = upto.lastIndexOf("@");
    if (at < 0) { setMentionOpen(false); return; }
    const before = at === 0 ? "" : upto[at - 1];
    if (before && !/\s/.test(before)) { setMentionOpen(false); return; } // @ phải mở đầu 1 token
    const q = upto.slice(at + 1);
    if (q.includes("@") || q.length > 30) { setMentionOpen(false); return; }
    setMentionStart(at);
    setMentionQuery(q);
    setMentionIndex(0);
    setMentionOpen(true);
  };

  const onInputChange = (v: string, caret: number) => {
    setInput(v);
    emitTyping(true);
    if (selfTypingTimer.current) clearTimeout(selfTypingTimer.current);
    selfTypingTimer.current = setTimeout(() => emitTyping(false), 1500);
    detectMention(v, caret);
  };

  // Chèn token "@Tên " thay cho phần đang gõ, đặt lại con trỏ
  const pickMention = (u: MentionUser) => {
    const el = inputEl.current;
    const caret = el?.selectionStart ?? input.length;
    const before = input.slice(0, mentionStart);
    const after = input.slice(caret);
    const label = u._id === "__all__" ? "Tất cả" : u.fullName;
    const token = `@${label} `;
    const next = before + token + after;
    setInput(next);
    setMentionOpen(false);
    requestAnimationFrame(() => {
      const pos = (before + token).length;
      el?.focus();
      el?.setSelectionRange(pos, pos);
    });
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    // Suy ra mention từ nội dung cuối cùng (bền với việc sửa/xóa)
    const mentionAll = /(^|\s)@(all|tất cả)(\s|$)/i.test(input);
    const mentions = mentionAll
      ? []
      : members
          .filter((m) => String(m._id) !== String(myId) && input.includes(`@${m.fullName}`))
          .map((m) => String(m._id));
    const socket = getSocket();
    socket.emit("message:send", { groupId, type: "text", text, mentions, mentionAll }, (r: any) => {
      if (!r?.ok) toast.error(r?.message || "Gửi tin nhắn thất bại");
    });
    setInput("");
    setShowEmoji(false);
    setMentionOpen(false);
    emitTyping(false);
    if (selfTypingTimer.current) clearTimeout(selfTypingTimer.current);
  };

  // Chọn ảnh/file → upload REST → gửi tin nhắn đính kèm qua socket
  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng file
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_URL}/client/student/groups/${groupId}/upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const d = await res.json();
      if (d.code !== "success") {
        toast.error(d.message || "Tải file thất bại");
        return;
      }
      const att = { url: d.data.url, name: d.data.name, size: d.data.size, mime: d.data.mime };
      const type = d.data.kind === "image" ? "image" : "file";
      getSocket().emit("message:send", { groupId, type, attachments: [att] }, (r: any) => {
        if (!r?.ok) toast.error(r?.message || "Gửi đính kèm thất bại");
      });
    } catch {
      toast.error("Lỗi tải file");
    } finally {
      setUploading(false);
    }
  };

  const sendSticker = (s: string) => {
    getSocket().emit("message:send", { groupId, type: "sticker", sticker: s }, (r: any) => {
      if (!r?.ok) toast.error(r?.message || "Gửi sticker thất bại");
    });
    setShowStickers(false);
  };

  const memberMap = useMemo(() => {
    const map = new Map<string, MentionUser>();
    members.forEach((m) => map.set(String(m._id), m));
    return map;
  }, [members]);

  // Danh sách gợi ý mention theo phần đang gõ (Tất cả + thành viên khớp, bỏ chính mình)
  const mq = mentionQuery.trim().toLowerCase();
  const mentionCandidates: MentionUser[] = mentionOpen
    ? [
        ...("tất cả".includes(mq) || "all".includes(mq) || mq === "" ? [ALL_MENTION] : []),
        ...members.filter(
          (m) => String(m._id) !== String(myId) && m.fullName.toLowerCase().includes(mq)
        ),
      ]
    : [];

  // Bôi đậm/gạch chân các đoạn "@Tên" trong nội dung tin nhắn
  const renderText = (m: ChatMessage) => {
    const text = m.text || "";
    const labels: string[] = [];
    if (m.mentionAll) { labels.push("@Tất cả"); labels.push("@all"); }
    (m.mentions || []).forEach((id) => {
      const mem = memberMap.get(String(id));
      if (mem) labels.push(`@${mem.fullName}`);
    });
    if (!labels.length) return text;
    const uniq = [...new Set(labels)].sort((a, b) => b.length - a.length);
    const re = new RegExp(`(${uniq.map(escapeRegExp).join("|")})`, "g");
    return text.split(re).map((p, i) =>
      uniq.includes(p) ? (
        <span key={i} className="font-extrabold underline decoration-2 underline-offset-2">{p}</span>
      ) : (
        <span key={i}>{p}</span>
      )
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Presence bar */}
      <div className="px-5 py-1.5 border-b-[3px] border-black bg-white flex items-center gap-2">
        <span className="w-2.5 h-2.5 bg-[#16A34A] border border-black inline-block" />
        <span className="font-sans text-xs text-[#0A1628]/70" style={{ fontWeight: 600 }}>
          {online} đang hoạt động
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#0A1628]/50">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={loadOlder}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-1.5 border-[2px] border-black bg-white text-[#0A1628] px-3 py-1.5 font-sans text-xs hover:-translate-y-0.5 transition-transform disabled:opacity-60"
                  style={{ boxShadow: SHADOW_XS, fontWeight: 700 }}
                >
                  {loadingMore ? <Loader2 size={13} className="animate-spin" /> : <ChevronUp size={13} />}
                  Tải tin cũ hơn
                </button>
              </div>
            )}

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <p className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                  Chưa có tin nhắn nào
                </p>
                <p className="font-sans text-sm text-[#0A1628]/60 mt-1" style={{ fontWeight: 500 }}>
                  Hãy gửi lời chào đầu tiên tới nhóm 👋
                </p>
              </div>
            )}

            {messages.map((m, i) => {
              const mine = m.sender._id === myId;
              const prev = messages[i - 1];
              const grouped = prev && prev.sender._id === m.sender._id;
              const mentionedMe = !mine && !!(m.mentionAll || (m.mentions || []).includes(myId));
              return (
                <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"} gap-2`}>
                  {!mine && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {!grouped && (
                        <div className="w-8 h-8 border-[2px] border-black bg-[#FFD166] flex items-center justify-center overflow-hidden font-serif text-[0.8rem] text-[#0A1628]" style={{ fontWeight: 800 }}>
                          {m.sender.avatar ? <img src={m.sender.avatar} alt={m.sender.fullName} className="w-full h-full object-cover" /> : initials(m.sender.fullName)}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="max-w-[72%]">
                    {!mine && !grouped && (
                      <p className="font-sans text-[10px] mb-0.5" style={{ fontWeight: 700, color: "#FF6B35" }}>
                        {m.sender.fullName}
                      </p>
                    )}

                    {mentionedMe && (
                      <span className="inline-flex items-center gap-1 mb-0.5 border-[2px] border-black bg-[#FFD166] text-[#0A1628] px-1.5 py-0.5 font-sans text-[9px]" style={{ fontWeight: 800 }}>
                        @ Nhắc đến bạn
                      </span>
                    )}

                    {m.type === "sticker" ? (
                      <div className="text-6xl leading-none py-1" style={{ textAlign: mine ? "right" : "left" }}>
                        {m.sticker}
                      </div>
                    ) : m.type === "image" && m.attachments[0] ? (
                      <a
                        href={fileUrl(m.attachments[0].url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border-[3px] border-black overflow-hidden hover:-translate-y-0.5 transition-transform"
                        style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}
                      >
                        <img
                          src={fileUrl(m.attachments[0].url)}
                          alt={m.attachments[0].name || "hình ảnh"}
                          className="max-w-[240px] max-h-[300px] w-auto h-auto object-cover block"
                        />
                      </a>
                    ) : m.type === "file" && m.attachments[0] ? (
                      <a
                        href={fileUrl(m.attachments[0].url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center gap-2.5 border-[3px] border-black px-3 py-2.5 hover:-translate-y-0.5 transition-transform"
                        style={{
                          backgroundColor: mine ? groupColor : "#FFFFFF",
                          color: mine ? "#FFFFFF" : "#0A1628",
                          boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)",
                        }}
                      >
                        <FileText size={26} className="flex-shrink-0" />
                        <span className="min-w-0">
                          <span className="font-sans text-sm block truncate max-w-[180px]" style={{ fontWeight: 700 }}>
                            {m.attachments[0].name || "Tệp đính kèm"}
                          </span>
                          <span className="font-sans text-[11px] opacity-70 flex items-center gap-1" style={{ fontWeight: 500 }}>
                            <Download size={11} /> {humanSize(m.attachments[0].size || 0)}
                          </span>
                        </span>
                      </a>
                    ) : (
                      <div
                        className="border-[3px] px-3 py-2 font-sans text-sm break-words"
                        style={{
                          backgroundColor: mentionedMe ? "#FFF3D6" : mine ? groupColor : "#FFFFFF",
                          color: mine && !mentionedMe ? "#FFFFFF" : "#0A1628",
                          borderColor: mentionedMe ? "#FF6B35" : "#000000",
                          fontWeight: 500,
                          boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)",
                        }}
                      >
                        {renderText(m)}
                      </div>
                    )}

                    <p className="font-sans text-[10px] mt-0.5 text-[#0A1628]/50" style={{ fontWeight: 500, textAlign: mine ? "right" : "left" }}>
                      {fmtTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      {typingNames.length > 0 && (
        <div className="px-5 py-1 border-t-[2px] border-black/10">
          <p className="font-sans text-xs text-[#0A1628]/60 italic" style={{ fontWeight: 500 }}>
            {typingNames.slice(0, 2).join(", ")}
            {typingNames.length > 2 ? ` và ${typingNames.length - 2} người khác` : ""} đang gõ…
          </p>
        </div>
      )}

      {/* Composer */}
      <div className="border-t-[3px] border-black p-3 flex items-center gap-2 relative">
        {/* Emoji */}
        <div className="relative">
          <button
            onClick={() => { setShowEmoji((v) => !v); setShowStickers(false); }}
            className="border-[3px] border-black bg-white text-[#0A1628] p-2.5 hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
            style={{ boxShadow: SHADOW_XS }}
            aria-label="Emoji"
          >
            <Smile size={18} />
          </button>
          {showEmoji && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowEmoji(false)} />
              <div className="absolute bottom-full left-0 mb-2 z-40">
                <EmojiPicker
                  onEmojiClick={(e: any) => setInput((prev) => prev + e.emoji)}
                  width={320}
                  height={380}
                  searchDisabled={false}
                  skinTonesDisabled
                />
              </div>
            </>
          )}
        </div>

        {/* Sticker */}
        <div className="relative">
          <button
            onClick={() => { setShowStickers((v) => !v); setShowEmoji(false); }}
            className="border-[3px] border-black bg-white text-[#0A1628] p-2.5 hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
            style={{ boxShadow: SHADOW_XS }}
            aria-label="Sticker"
          >
            <Sticker size={18} />
          </button>
          {showStickers && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowStickers(false)} />
              <div
                className="absolute bottom-full left-0 mb-2 z-40 w-[300px] border-[3px] border-black bg-[#FFF8F0] p-3"
                style={{ boxShadow: SHADOW_SM }}
              >
                <p className="font-sans text-[11px] uppercase tracking-wider text-[#0A1628]/50 mb-2" style={{ fontWeight: 700 }}>
                  Sticker
                </p>
                <div className="grid grid-cols-8 gap-1">
                  {STICKERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendSticker(s)}
                      className="text-2xl leading-none p-1 hover:-translate-y-0.5 hover:bg-[#FFE4D6] border-[2px] border-transparent hover:border-black transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Đính kèm ảnh/file */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onPickFile}
          accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="border-[3px] border-black bg-white text-[#0A1628] p-2.5 hover:-translate-y-0.5 active:translate-y-0.5 transition-transform disabled:opacity-60"
          style={{ boxShadow: SHADOW_XS }}
          aria-label="Đính kèm"
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
        </button>

        {/* Gợi ý @mention */}
        {mentionOpen && mentionCandidates.length > 0 && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMentionOpen(false)} />
            <div
              className="absolute bottom-full left-3 right-3 mb-2 z-40 border-[3px] border-black bg-white max-h-52 overflow-y-auto"
              style={{ boxShadow: SHADOW_SM }}
            >
              <p className="px-3 py-1.5 font-sans text-[10px] uppercase tracking-wider text-[#0A1628]/50 border-b-[2px] border-black/10" style={{ fontWeight: 700 }}>
                Nhắc đến
              </p>
              {mentionCandidates.map((u, i) => (
                <button
                  key={u._id}
                  onMouseDown={(e) => { e.preventDefault(); pickMention(u); }}
                  onMouseEnter={() => setMentionIndex(i)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                  style={{ backgroundColor: i === mentionIndex ? "#FFE4D6" : "transparent" }}
                >
                  {u._id === "__all__" ? (
                    <span className="w-7 h-7 border-[2px] border-black bg-[#FF6B35] text-white flex items-center justify-center flex-shrink-0" style={{ fontWeight: 800 }}>@</span>
                  ) : (
                    <span className="w-7 h-7 border-[2px] border-black bg-[#FFD166] flex items-center justify-center overflow-hidden font-serif text-[11px] text-[#0A1628] flex-shrink-0" style={{ fontWeight: 800 }}>
                      {u.avatar ? <img src={u.avatar} alt={u.fullName} className="w-full h-full object-cover" /> : initials(u.fullName)}
                    </span>
                  )}
                  <span className="font-sans text-sm text-[#0A1628] truncate" style={{ fontWeight: 600 }}>
                    {u._id === "__all__" ? "Tất cả (@all)" : u.fullName}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        <input
          ref={inputEl}
          value={input}
          onChange={(e) => onInputChange(e.target.value, e.target.selectionStart ?? e.target.value.length)}
          onKeyDown={(e) => {
            if (mentionOpen && mentionCandidates.length) {
              if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex((i) => (i + 1) % mentionCandidates.length); return; }
              if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex((i) => (i - 1 + mentionCandidates.length) % mentionCandidates.length); return; }
              if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); pickMention(mentionCandidates[Math.min(mentionIndex, mentionCandidates.length - 1)]); return; }
              if (e.key === "Escape") { e.preventDefault(); setMentionOpen(false); return; }
            }
            if (e.key === "Enter") send();
          }}
          placeholder="Nhập tin nhắn... (gõ @ để nhắc tên)"
          className="flex-1 border-[3px] border-black bg-white px-3 py-2.5 font-sans text-sm outline-none text-[#0A1628]"
          style={{ fontWeight: 500, boxShadow: SHADOW_XS }}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="border-[3px] border-black bg-[#FF6B35] text-white p-2.5 hover:-translate-y-0.5 active:translate-y-0.5 transition-transform disabled:opacity-50"
          style={{ boxShadow: SHADOW_XS }}
          aria-label="Gửi"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

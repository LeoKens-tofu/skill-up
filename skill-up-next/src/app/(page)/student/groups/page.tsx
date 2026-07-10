'use client';
import { useState, useEffect, useCallback } from "react";
import {
  Users, Plus, Search, MessagesSquare, Copy, Check, Share2,
  Crown, Loader2, UserPlus, X,
} from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/socket";
import GroupChat from "@/components/GroupChat";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const SHADOW_XS = "2px 2px 0px 0px rgba(0,0,0,1)";

const GROUP_COLORS = ["#FF6B35", "#0A1628", "#16A34A", "#FFD166", "#991B1B", "#7C3AED"];

export type GroupMember = {
  _id: string;
  fullName: string;
  avatar: string;
  studentId: string;
  level: number;
  title: string;
  role: "owner" | "member";
};

export type StudyGroup = {
  _id: string;
  name: string;
  subject: string;
  description: string;
  color: string;
  inviteCode: string;
  memberCount: number;
  role: "owner" | "member";
  lastMessageText: string;
  lastSenderName: string;
  lastMessageAt: string | null;
  members?: GroupMember[];
};

const initials = (name: string) =>
  (name || "?").trim().split(/\s+/).slice(-2).map((w) => w[0]).join("").toUpperCase();

const timeAgo = (iso: string | null): string => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ`;
  return `${Math.floor(h / 24)} ngày`;
};

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<StudyGroup | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [myId, setMyId] = useState("");

  // Lấy id của mình 1 lần để căn phải tin nhắn của bản thân
  useEffect(() => {
    fetch(`${API_URL}/client/student/account/profile`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.code === "success") setMyId(String(d.data._id)); })
      .catch(() => {});
  }, []);

  const fetchGroups = useCallback(async (autoSelect?: string) => {
    try {
      const res = await fetch(`${API_URL}/client/student/groups`, { credentials: "include" });
      const data = await res.json();
      if (data.code === "success") {
        setGroups(data.data);
        setSelectedId((cur) => {
          if (autoSelect && data.data.some((g: StudyGroup) => g._id === autoSelect)) return autoSelect;
          if (cur && data.data.some((g: StudyGroup) => g._id === cur)) return cur;
          return data.data[0]?._id || null;
        });
      } else {
        toast.error(data.message || "Không tải được danh sách nhóm");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự chọn nhóm khi vừa tham gia qua link (?g=<id>)
  useEffect(() => {
    const g = new URLSearchParams(window.location.search).get("g") || undefined;
    fetchGroups(g);
    if (g) window.history.replaceState(null, "", "/student/groups");
  }, [fetchGroups]);

  // Lấy chi tiết (thành viên) khi chọn nhóm
  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    let alive = true;
    setDetailLoading(true);
    fetch(`${API_URL}/client/student/groups/${selectedId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (alive && d.code === "success") setDetail(d.data); })
      .catch(() => {})
      .finally(() => { if (alive) setDetailLoading(false); });
    return () => { alive = false; };
  }, [selectedId]);

  const copyInvite = async () => {
    if (!detail) return;
    const link = `${window.location.origin}/student/groups/join/${detail.inviteCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Đã sao chép link mời");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không sao chép được, hãy copy thủ công: " + link);
    }
  };

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.subject || "").toLowerCase().includes(search.toLowerCase())
  );

  const selected = detail && detail._id === selectedId ? detail : groups.find((g) => g._id === selectedId) || null;

  return (
    <div className="space-y-6">
      <p className="font-sans max-w-3xl text-[#0A1628]/60" style={{ fontWeight: 500 }}>
        Học cùng nhau hiệu quả hơn — tạo nhóm theo môn, chia sẻ link mời và trò chuyện realtime với bạn học.
      </p>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div
          className="flex items-center gap-2 border-[3px] border-black bg-white px-3 py-2 flex-1 max-w-md"
          style={{ boxShadow: SHADOW_SM }}
        >
          <Search size={16} className="text-[#0A1628]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm nhóm theo tên, môn..."
            className="bg-transparent outline-none font-sans text-sm flex-1 text-[#0A1628]"
            style={{ fontWeight: 500 }}
          />
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-4 py-2.5 font-sans text-sm hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1 transition-transform"
          style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
        >
          <Plus size={16} /> Tạo nhóm mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        {/* Group list */}
        <div className="border-[4px] border-black bg-[#FFF8F0]" style={{ boxShadow: SHADOW }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b-[3px] border-black bg-[#FF6B35]">
            <Users size={18} className="text-white" />
            <p className="font-serif text-white flex-1" style={{ fontWeight: 700 }}>Nhóm của bạn</p>
            <span className="font-sans text-xs px-2 py-0.5 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628]" style={{ fontWeight: 700 }}>
              {groups.length}
            </span>
          </div>

          <div className="p-3 space-y-2 max-h-[640px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-[#0A1628]/50">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyGroups hasGroups={groups.length > 0} onCreate={() => setCreateOpen(true)} />
            ) : (
              filtered.map((g) => (
                <button
                  key={g._id}
                  onClick={() => setSelectedId(g._id)}
                  className="w-full text-left border-[3px] border-black p-3 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                  style={{
                    backgroundColor: selectedId === g._id ? "#FFE4D6" : "#FFFFFF",
                    boxShadow: SHADOW_SM,
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-10 h-10 border-[2px] border-black flex items-center justify-center flex-shrink-0 font-serif text-white text-sm"
                      style={{ backgroundColor: g.color, fontWeight: 800 }}
                    >
                      {initials(g.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-sans truncate flex-1 text-[#0A1628]" style={{ fontWeight: 700 }}>{g.name}</p>
                        {g.role === "owner" && <Crown size={14} className="text-[#FF6B35] flex-shrink-0" />}
                      </div>
                      <p className="font-sans text-xs mt-0.5 truncate text-[#0A1628]/60" style={{ fontWeight: 500 }}>
                        {g.lastMessageText ? (
                          <>
                            {g.lastSenderName && <span style={{ color: "#FF6B35", fontWeight: 700 }}>{g.lastSenderName}: </span>}
                            {g.lastMessageText}
                          </>
                        ) : (
                          <span className="italic">Chưa có tin nhắn</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {g.subject && (
                          <span className="font-sans text-[10px] px-1.5 py-0.5 border border-black bg-[#FFD166] text-[#0A1628]" style={{ fontWeight: 700 }}>
                            {g.subject}
                          </span>
                        )}
                        <span className="font-sans text-[10px] text-[#0A1628]/50" style={{ fontWeight: 600 }}>
                          {g.memberCount} thành viên
                        </span>
                        {g.lastMessageAt && (
                          <span className="font-sans text-[10px] text-[#0A1628]/40 ml-auto" style={{ fontWeight: 600 }}>
                            {timeAgo(g.lastMessageAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Group detail */}
        <div className="border-[4px] border-black bg-[#FFF8F0] flex flex-col" style={{ boxShadow: SHADOW, height: "80vh", minHeight: 520 }}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 border-[4px] border-black bg-[#FFD166] flex items-center justify-center mb-4 rotate-[-4deg]" style={{ boxShadow: SHADOW }}>
                <MessagesSquare size={40} className="text-[#0A1628]" />
              </div>
              <h3 className="font-serif text-[#0A1628] mb-1" style={{ fontWeight: 800, fontSize: "1.3rem" }}>
                Chọn một nhóm để bắt đầu
              </h3>
              <p className="font-sans text-[#0A1628]/60 max-w-sm" style={{ fontWeight: 500 }}>
                Tạo nhóm mới hoặc mở link mời từ bạn bè để tham gia trò chuyện.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b-[3px] border-black flex items-center gap-3">
                <div
                  className="w-12 h-12 border-[3px] border-black flex items-center justify-center font-serif text-white flex-shrink-0"
                  style={{ backgroundColor: selected.color, fontWeight: 800 }}
                >
                  {initials(selected.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-[#0A1628] truncate" style={{ fontWeight: 800, fontSize: "1.2rem" }}>
                    {selected.name}
                  </h3>
                  <p className="font-sans text-xs text-[#0A1628]/60" style={{ fontWeight: 500 }}>
                    {selected.memberCount} thành viên{selected.subject ? ` · ${selected.subject}` : ""}
                  </p>
                </div>
                <button
                  onClick={copyInvite}
                  className="flex items-center gap-1.5 border-[3px] border-black bg-[#16A34A] text-white px-3 py-2 font-sans text-xs hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1 transition-transform"
                  style={{ boxShadow: SHADOW_XS, fontWeight: 700 }}
                >
                  {copied ? <Check size={15} /> : <Share2 size={15} />} {copied ? "Đã copy" : "Mời"}
                </button>
              </div>

              {/* Invite code strip */}
              <div className="px-5 py-2.5 border-b-[3px] border-black bg-[#FFE4D6] flex items-center gap-2 flex-wrap">
                <span className="font-sans text-[11px] uppercase tracking-wider text-[#0A1628]/60" style={{ fontWeight: 700 }}>
                  Mã mời
                </span>
                <code className="font-mono text-sm px-2 py-0.5 border-[2px] border-black bg-white text-[#0A1628]" style={{ fontWeight: 700, letterSpacing: "0.1em" }}>
                  {selected.inviteCode}
                </code>
                <button onClick={copyInvite} className="text-[#0A1628]/60 hover:text-[#FF6B35] transition-colors" title="Sao chép link">
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>

              {/* Members */}
              <div className="px-5 py-3 border-b-[3px] border-black">
                <p className="font-sans text-[11px] uppercase tracking-wider text-[#0A1628]/50 mb-2" style={{ fontWeight: 700 }}>
                  Thành viên {detailLoading && <Loader2 size={11} className="inline animate-spin ml-1" />}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(detail?.members || []).map((m) => (
                    <div key={m._id} className="flex items-center gap-2 border-[2px] border-black bg-white pl-1 pr-2.5 py-1" style={{ boxShadow: SHADOW_XS }}>
                      <div className="w-7 h-7 border-[2px] border-black bg-[#FFD166] flex items-center justify-center overflow-hidden font-serif text-[11px] text-[#0A1628]" style={{ fontWeight: 800 }}>
                        {m.avatar ? <img src={m.avatar} alt={m.fullName} className="w-full h-full object-cover" /> : initials(m.fullName)}
                      </div>
                      <span className="font-sans text-xs text-[#0A1628]" style={{ fontWeight: 600 }}>{m.fullName}</span>
                      {m.role === "owner" && <Crown size={12} className="text-[#FF6B35]" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat realtime */}
              <GroupChat key={selected._id} groupId={selected._id} groupColor={selected.color} myId={myId} />
            </>
          )}
        </div>
      </div>

      {createOpen && (
        <CreateGroupModal
          onClose={() => setCreateOpen(false)}
          onCreated={(g) => {
            setGroups((prev) => [g, ...prev]);
            setSelectedId(g._id);
            setCreateOpen(false);
          }}
        />
      )}
    </div>
  );
}

function EmptyGroups({ hasGroups, onCreate }: { hasGroups: boolean; onCreate: () => void }) {
  return (
    <div className="text-center py-10 px-3">
      <div className="w-14 h-14 border-[3px] border-black bg-[#FFD166] flex items-center justify-center mx-auto mb-3 rotate-[-4deg]">
        <Users size={26} className="text-[#0A1628]" />
      </div>
      <p className="font-sans text-sm text-[#0A1628]/70" style={{ fontWeight: 600 }}>
        {hasGroups ? "Không tìm thấy nhóm phù hợp" : "Bạn chưa tham gia nhóm nào"}
      </p>
      {!hasGroups && (
        <button
          onClick={onCreate}
          className="mt-3 inline-flex items-center gap-1.5 border-[3px] border-black bg-[#FF6B35] text-white px-3 py-2 font-sans text-xs hover:-translate-y-0.5 transition-transform"
          style={{ boxShadow: SHADOW_XS, fontWeight: 700 }}
        >
          <Plus size={14} /> Tạo nhóm đầu tiên
        </button>
      )}
    </div>
  );
}

function CreateGroupModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (g: StudyGroup) => void;
}) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(GROUP_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (name.trim().length < 2) {
      toast.error("Tên nhóm phải có ít nhất 2 ký tự");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/client/student/groups`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, description, color }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã tạo nhóm!");
        onCreated(data.data);
      } else {
        toast.error(data.message || "Không tạo được nhóm");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 w-9 h-9 border-[3px] border-black bg-white text-[#0A1628] flex items-center justify-center hover:bg-[#991B1B] hover:text-white transition-colors"
          style={{ boxShadow: SHADOW_XS, fontWeight: 700 }}
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
        <div className="border-[4px] border-black bg-[#FFF8F0] max-h-[90vh] overflow-y-auto" style={{ boxShadow: SHADOW }}>
          <div className="sticky top-0 z-10 flex items-center gap-2 px-5 py-3.5 border-b-[3px] border-black bg-[#FF6B35]">
            <UserPlus size={20} className="text-white" />
            <h3 className="font-serif text-white" style={{ fontWeight: 800, fontSize: "1.15rem" }}>Tạo nhóm học tập</h3>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 mb-1.5 block" style={{ fontWeight: 700 }}>
                Tên nhóm *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                placeholder="VD: SWP391 - Team Phoenix"
                className="w-full border-[3px] border-black bg-white px-3 py-2.5 font-sans text-sm outline-none text-[#0A1628]"
                style={{ fontWeight: 500 }}
              />
            </div>

            <div>
              <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 mb-1.5 block" style={{ fontWeight: 700 }}>
                Môn học / Tag
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="VD: SWP391"
                className="w-full border-[3px] border-black bg-white px-3 py-2.5 font-sans text-sm outline-none text-[#0A1628]"
                style={{ fontWeight: 500 }}
              />
            </div>

            <div>
              <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 mb-1.5 block" style={{ fontWeight: 700 }}>
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Nhóm dùng để làm gì..."
                className="w-full border-[3px] border-black bg-white px-3 py-2.5 font-sans text-sm outline-none text-[#0A1628] resize-none"
                style={{ fontWeight: 500 }}
              />
            </div>

            <div>
              <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 mb-1.5 block" style={{ fontWeight: 700 }}>
                Màu nhóm
              </label>
              <div className="flex gap-2">
                {GROUP_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-9 h-9 border-[3px] border-black transition-transform hover:-translate-y-0.5 flex items-center justify-center"
                    style={{ backgroundColor: c, boxShadow: color === c ? SHADOW_XS : "none" }}
                    aria-label={c}
                  >
                    {color === c && <Check size={16} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 flex gap-3 px-5 py-4 border-t-[3px] border-black bg-[#FFF8F0]">
            <button
              onClick={onClose}
              className="flex-1 border-[3px] border-black bg-white text-[#0A1628] py-2.5 font-sans text-sm hover:-translate-y-0.5 transition-transform"
              style={{ boxShadow: SHADOW_XS, fontWeight: 700 }}
            >
              Hủy
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white py-2.5 font-sans text-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-transform disabled:opacity-60"
              style={{ boxShadow: SHADOW_XS, fontWeight: 700 }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Tạo nhóm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

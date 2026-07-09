'use client';
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CalendarClock, FileWarning, CheckCircle2, Clock, Filter, Upload, Eye,
  AlertTriangle, CalendarDays, X, Loader2, Trash2, Paperclip, Award,
  BookOpen, Send, Star,
} from "lucide-react";
import { toast } from "sonner";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const API = process.env.NEXT_PUBLIC_API_URL;

type SubFile = { name: string; url: string; size?: string };
type Submission = {
  files: SubFile[];
  note?: string;
  status: "submitted" | "graded";
  score?: number;
  feedback?: string;
  xpEarned?: number;
  submittedAt?: string;
  gradedAt?: string;
};
type Assignment = {
  lessonId: string;
  courseId: string;
  courseTitle: string;
  courseColor?: string;
  chapterTitle: string;
  title: string;
  instructions: string;
  resources: SubFile[];
  dueDate: string | null;
  maxScore: number;
  xp: number;
  status: "todo" | "submitted" | "graded" | "late";
  submission: Submission | null;
};

const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "urgent", label: "Khẩn cấp" },
  { id: "todo", label: "Chưa nộp" },
  { id: "submitted", label: "Đã nộp" },
  { id: "graded", label: "Đã chấm" },
  { id: "late", label: "Quá hạn" },
] as const;
type FilterId = (typeof FILTERS)[number]["id"];

const fmtDateTime = (iso?: string | null) => {
  if (!iso) return "Không hạn";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} — ${p(d.getHours())}:${p(d.getMinutes())}`;
};

// Số ngày còn lại (làm tròn lên). null nếu không có hạn.
const daysLeftOf = (iso?: string | null): number | null => {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function Deadlines({ isDark = false }: { isDark?: boolean }) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Assignment | null>(null);

  const chipBg = isDark ? "#11203A" : "#FFF8F0";
  const chipText = isDark ? "#FFF8F0" : "#0A1628";

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/client/student/assignments`, { credentials: "include" });
      const json = await res.json();
      if (json.code === "success") setItems(json.data);
      else toast.error(json.message || "Không tải được bài tập");
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const counts = useMemo(() => {
    const todo = items.filter((i) => i.status === "todo");
    const urgent = todo.filter((i) => {
      const d = daysLeftOf(i.dueDate);
      return d !== null && d >= 0 && d <= 3;
    });
    return {
      todo: todo.length,
      urgent: urgent.length,
      submitted: items.filter((i) => i.status === "submitted").length,
      graded: items.filter((i) => i.status === "graded").length,
      late: items.filter((i) => i.status === "late").length,
    };
  }, [items]);

  const filtered = useMemo(() => {
    const list = items.filter((i) => {
      if (filter === "all") return true;
      if (filter === "urgent") {
        const d = daysLeftOf(i.dueDate);
        return i.status === "todo" && d !== null && d >= 0 && d <= 3;
      }
      return i.status === filter;
    });
    // sắp theo hạn nộp
    return [...list].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [items, filter]);

  const summary = [
    { label: "Chưa nộp", value: counts.todo, icon: Clock, bg: isDark ? "#11203A" : "#FFF8F0", iconBg: "#FF6B35", text: chipText },
    { label: "Khẩn cấp", value: counts.urgent, icon: AlertTriangle, bg: isDark ? "#3A1A10" : "#FFE4D6", iconBg: "#991B1B", text: isDark ? "#FFB088" : "#991B1B" },
    { label: "Đã chấm", value: counts.graded, icon: CheckCircle2, bg: isDark ? "#11203A" : "#FFF8F0", iconBg: "#16A34A", text: chipText },
    { label: "Quá hạn", value: counts.late, icon: FileWarning, bg: isDark ? "#11203A" : "#FFF8F0", iconBg: "#991B1B", text: chipText },
  ];

  const dueTone = (i: Assignment) => {
    if (i.status === "graded") return { bg: "#16A34A", color: "#FFFFFF" };
    if (i.status === "submitted") return { bg: "#FF6B35", color: "#FFFFFF" };
    if (i.status === "late") return { bg: "#991B1B", color: "#FFFFFF" };
    const d = daysLeftOf(i.dueDate);
    if (d === null) return { bg: "#FCD34D", color: "#0A1628" };
    if (d <= 3) return { bg: "#991B1B", color: "#FFFFFF" };
    if (d <= 7) return { bg: "#FF6B35", color: "#FFFFFF" };
    return { bg: "#FCD34D", color: "#0A1628" };
  };

  const dueBadgeContent = (i: Assignment) => {
    if (i.status === "graded") return { big: `${i.submission?.score ?? "–"}`, small: `/${i.maxScore} điểm` };
    if (i.status === "submitted") return { big: "✓", small: "Đã nộp" };
    if (i.status === "late") return { big: "!", small: "Quá hạn" };
    const d = daysLeftOf(i.dueDate);
    if (d === null) return { big: "∞", small: "Không hạn" };
    if (d < 0) return { big: `${d}`, small: "Quá hạn" };
    if (d === 0) return { big: "0", small: "Hôm nay" };
    return { big: `${d}`, small: d === 1 ? "Ngày mai" : "ngày nữa" };
  };

  const statusBadge = (s: Assignment["status"]) => {
    if (s === "submitted") return { label: "Đã nộp", bg: "#FF6B35", color: "#FFFFFF" };
    if (s === "graded") return { label: "Đã chấm", bg: "#16A34A", color: "#FFFFFF" };
    if (s === "late") return { label: "Quá hạn", bg: "#991B1B", color: "#FFFFFF" };
    return { label: "Chưa nộp", bg: chipBg, color: chipText };
  };

  return (
    <div className="space-y-6 pb-10">
      <p className="font-sans text-[#0A1628]/70 max-w-2xl" style={{ fontWeight: 400 }}>
        Tất cả bài tập từ các khóa bạn đang theo học. Nộp file trước hạn để giáo viên chấm điểm.
      </p>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="border-[4px] border-black p-5 transition-all duration-150 hover:-translate-y-1 hover:-translate-x-1"
              style={{ backgroundColor: s.bg, boxShadow: SHADOW }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 border-[3px] border-black flex items-center justify-center" style={{ backgroundColor: s.iconBg }}>
                  <Icon size={22} className="text-white" />
                </div>
              </div>
              <p className="font-serif" style={{ fontWeight: 700, fontSize: "2.25rem", color: s.text }}>{s.value}</p>
              <p className="font-sans text-sm" style={{ fontWeight: 600, color: s.text }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 border-[3px] border-black bg-[#0A1628] text-white px-3 py-2" style={{ boxShadow: SHADOW_SM }}>
          <Filter size={16} />
          <span className="font-sans text-xs uppercase tracking-wider" style={{ fontWeight: 700 }}>Lọc</span>
        </div>
        {FILTERS.map((f) => {
          const activeF = filter === f.id;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="border-[3px] border-black px-4 py-2 font-sans text-sm transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
              style={{ backgroundColor: activeF ? "#FF6B35" : chipBg, color: activeF ? "#FFFFFF" : chipText, fontWeight: activeF ? 700 : 500, boxShadow: SHADOW_SM }}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="border-[4px] border-black bg-[#FFF8F0]" style={{ boxShadow: SHADOW }}>
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black">
          <div className="flex items-center gap-2">
            <CalendarDays size={22} className="text-[#0A1628]" />
            <h3 className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.25rem" }}>Danh sách bài tập</h3>
          </div>
          <span className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60" style={{ fontWeight: 600 }}>{filtered.length} mục</span>
        </div>

        <div className="p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-[#FF6B35]" />
              <p className="font-sans text-[#0A1628]/60" style={{ fontWeight: 600 }}>Đang tải bài tập...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.15rem" }}>Không có bài tập nào</p>
              <p className="font-sans text-[#0A1628]/60 mt-1" style={{ fontWeight: 500 }}>
                {items.length === 0 ? "Bạn chưa có bài tập nào từ các khóa đã tham gia." : "Bộ lọc hiện tại không có kết quả."}
              </p>
            </div>
          ) : (
            filtered.map((i) => {
              const tone = dueTone(i);
              const sb = statusBadge(i.status);
              const badge = dueBadgeContent(i);
              const isDoneish = i.status === "graded";
              return (
                <div key={i.lessonId}
                  className="border-[3px] border-black bg-white p-4 flex items-center gap-4 transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5"
                  style={{ boxShadow: SHADOW_SM, opacity: isDoneish ? 0.85 : 1 }}>
                  {/* Due / score badge */}
                  <div className="border-[3px] border-black flex flex-col items-center justify-center w-24 h-20 flex-shrink-0"
                    style={{ backgroundColor: tone.bg, color: tone.color, boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}>
                    <span className="font-serif leading-none" style={{ fontWeight: 700, fontSize: "1.5rem" }}>{badge.big}</span>
                    <span className="font-sans text-[10px] uppercase tracking-wider mt-1 text-center px-1" style={{ fontWeight: 700 }}>{badge.small}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 border-[2px] border-black bg-[#0A1628] text-[#FFF8F0] truncate max-w-[220px]" style={{ fontWeight: 700 }}>{i.courseTitle}</span>
                      <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 border-[2px] border-black" style={{ fontWeight: 700, backgroundColor: sb.bg, color: sb.color }}>{sb.label}</span>
                    </div>
                    <p className="font-serif text-[#0A1628] leading-tight" style={{ fontWeight: 700, fontSize: "1.05rem" }}>{i.title}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-[#0A1628]/70 flex-wrap">
                      <span className="font-sans text-xs flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                        <CalendarClock size={13} /> {fmtDateTime(i.dueDate)}
                      </span>
                      <span className="font-sans text-xs flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                        <Star size={13} /> {i.maxScore} điểm{i.xp ? ` · +${i.xp} XP` : ""}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button onClick={() => setActive(i)}
                    className="border-[3px] border-black px-4 py-2.5 flex items-center gap-2 font-sans flex-shrink-0 transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
                    style={{
                      backgroundColor: i.status === "graded" ? "#16A34A" : i.status === "late" ? chipBg : "#FF6B35",
                      color: i.status === "late" ? chipText : "#FFFFFF",
                      boxShadow: SHADOW_SM, fontWeight: 700,
                    }}>
                    {i.status === "graded" ? (<><Award size={16} /> Xem điểm</>)
                      : i.status === "submitted" ? (<><Eye size={16} /> Xem / Nộp lại</>)
                      : i.status === "late" ? (<><Eye size={16} /> Xem đề</>)
                      : (<><Upload size={16} /> Nộp bài</>)}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {active && (
        <SubmitModal
          item={active}
          onClose={() => setActive(null)}
          onSubmitted={() => { setActive(null); fetchAssignments(); }}
        />
      )}
    </div>
  );
}

// ============ Modal nộp bài / xem điểm ============
function SubmitModal({
  item, onClose, onSubmitted,
}: {
  item: Assignment;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const existing = item.submission;
  const [files, setFiles] = useState<SubFile[]>(existing?.files || []);
  const [note, setNote] = useState(existing?.note || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pastDue = item.dueDate ? Date.now() > new Date(item.dueDate).getTime() : false;
  const isGraded = item.status === "graded";
  const canSubmit = !isGraded && !pastDue;

  const uploadOne = async (file: File) => {
    setUploading(true);
    const t = toast.loading(`Đang tải ${file.name}...`);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/client/student/submissions/upload`, { method: "POST", credentials: "include", body: fd });
      const json = await res.json();
      if (json.code === "success") {
        setFiles((f) => [...f, json.data]);
        toast.success("Đã tải file", { id: t });
      } else {
        toast.error(json.message || "Lỗi tải file", { id: t });
      }
    } catch {
      toast.error("Lỗi kết nối khi tải file", { id: t });
    } finally {
      setUploading(false);
    }
  };

  const onPick = async (list: FileList | null) => {
    if (!list) return;
    for (const f of Array.from(list)) await uploadOne(f);
  };

  const submit = async () => {
    if (files.length === 0) { toast.error("Vui lòng nộp ít nhất 1 file"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/client/student/submissions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: item.courseId, lessonId: item.lessonId, files, note }),
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message || "Nộp bài thành công");
        if (json.data?.courseBonus > 0) toast.success(`+${json.data.courseBonus} XP hoàn thành khóa!`);
        onSubmitted();
      } else {
        toast.error(json.message || "Không nộp được bài");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="relative w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-3 -right-3 z-20 w-10 h-10 border-[3px] border-black bg-[#991B1B] text-white flex items-center justify-center hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}>
          <X size={20} strokeWidth={3} />
        </button>

        <div className="border-[4px] border-black bg-[#FFF8F0] max-h-[90vh] overflow-y-auto" style={{ boxShadow: SHADOW }}>
          {/* Header */}
          <div className="p-5 border-b-[4px] border-black bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 border-[2px] border-black bg-[#0A1628] text-[#FF6B35]" style={{ fontWeight: 700 }}>{item.courseTitle}</span>
              <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628]" style={{ fontWeight: 700 }}>{item.chapterTitle}</span>
            </div>
            <h3 className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.35rem" }}>{item.title}</h3>
            <div className="flex items-center gap-4 mt-2 text-[#0A1628]/70 flex-wrap">
              <span className="font-sans text-xs flex items-center gap-1.5" style={{ fontWeight: 600 }}><CalendarClock size={13} /> Hạn: {fmtDateTime(item.dueDate)}</span>
              <span className="font-sans text-xs flex items-center gap-1.5" style={{ fontWeight: 600 }}><Star size={13} /> {item.maxScore} điểm{item.xp ? ` · +${item.xp} XP` : ""}</span>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Đề bài */}
            {item.instructions && (
              <div>
                <p className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 mb-2 flex items-center gap-1.5" style={{ fontWeight: 700 }}><BookOpen size={13} /> Đề bài</p>
                <div className="border-[2px] border-black bg-white p-3 font-sans text-sm text-[#0A1628] whitespace-pre-wrap" style={{ fontWeight: 500 }}>{item.instructions}</div>
              </div>
            )}

            {/* Tài liệu đề bài */}
            {item.resources.length > 0 && (
              <div>
                <p className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 mb-2" style={{ fontWeight: 700 }}>Tài liệu đề bài</p>
                <div className="space-y-1.5">
                  {item.resources.map((r, ri) => (
                    <a key={ri} href={`${API}${r.url}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 border-[2px] border-black bg-white px-3 py-2 hover:-translate-y-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>
                      <Paperclip size={14} className="text-[#FF6B35]" />
                      <span className="flex-1 font-sans text-xs text-[#0A1628] truncate" style={{ fontWeight: 600 }}>{r.name}</span>
                      <span className="font-sans text-[10px] text-[#0A1628]/50" style={{ fontWeight: 600 }}>{r.size}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Kết quả chấm */}
            {isGraded && (
              <div className="border-[3px] border-black bg-[#16A34A]/10 p-4" style={{ boxShadow: SHADOW_SM }}>
                <div className="flex items-center gap-2 mb-2">
                  <Award size={18} className="text-[#16A34A]" />
                  <span className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    Điểm: {existing?.score ?? "–"}/{item.maxScore}
                  </span>
                  {(existing?.xpEarned ?? 0) > 0 && (
                    <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 border-[2px] border-black bg-[#FFD166] text-[#0A1628]" style={{ fontWeight: 700 }}>+{existing?.xpEarned} XP</span>
                  )}
                </div>
                {existing?.feedback ? (
                  <p className="font-sans text-sm text-[#0A1628] whitespace-pre-wrap" style={{ fontWeight: 500 }}><b>Nhận xét:</b> {existing.feedback}</p>
                ) : (
                  <p className="font-sans text-sm text-[#0A1628]/60" style={{ fontWeight: 500 }}>Giáo viên chưa để lại nhận xét.</p>
                )}
              </div>
            )}

            {/* Quá hạn chưa nộp */}
            {pastDue && !existing && !isGraded && (
              <div className="border-[3px] border-black bg-[#991B1B]/10 p-4 flex items-center gap-2" style={{ boxShadow: SHADOW_SM }}>
                <FileWarning size={18} className="text-[#991B1B]" />
                <p className="font-sans text-sm text-[#991B1B]" style={{ fontWeight: 600 }}>Đã quá hạn nộp bài. Bạn không thể nộp bài tập này nữa.</p>
              </div>
            )}

            {/* Khu vực nộp / bài đã nộp */}
            {(canSubmit || existing) && (
              <div>
                <p className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 mb-2" style={{ fontWeight: 700 }}>
                  {existing ? "Bài đã nộp" : "File nộp"}
                </p>
                <div className="space-y-1.5 mb-3">
                  {files.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2 border-[2px] border-black bg-white px-3 py-2">
                      <Paperclip size={14} className="text-[#0A1628]" />
                      <a href={`${API}${f.url}`} target="_blank" rel="noreferrer" className="flex-1 font-sans text-xs text-[#0A1628] truncate hover:text-[#FF6B35]" style={{ fontWeight: 600 }}>{f.name}</a>
                      <span className="font-sans text-[10px] text-[#0A1628]/50" style={{ fontWeight: 600 }}>{f.size}</span>
                      {canSubmit && (
                        <button onClick={() => setFiles((x) => x.filter((_, i) => i !== fi))} className="text-[#991B1B]"><Trash2 size={14} /></button>
                      )}
                    </div>
                  ))}
                  {files.length === 0 && (
                    <p className="font-sans text-xs text-[#0A1628]/50 py-2" style={{ fontWeight: 500 }}>Chưa có file nào.</p>
                  )}
                </div>

                {canSubmit && (
                  <label className="cursor-pointer inline-flex items-center gap-2 border-[3px] border-black bg-white text-[#0A1628] px-4 py-2 font-sans text-sm hover:-translate-y-0.5 transition-transform" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    Thêm file (.pdf, .zip, .txt, .doc, ảnh...)
                    <input type="file" multiple className="hidden" onChange={(e) => { onPick(e.target.files); e.target.value = ""; }} />
                  </label>
                )}

                {canSubmit && (
                  <div className="mt-3">
                    <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 block mb-2" style={{ fontWeight: 700 }}>Ghi chú (tùy chọn)</label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                      placeholder="Ghi chú gửi giáo viên..."
                      className="w-full border-[3px] border-black bg-white px-3 py-2 font-sans text-sm outline-none resize-none" />
                  </div>
                )}

                {!canSubmit && existing?.note && (
                  <p className="font-sans text-xs text-[#0A1628]/70 mt-1" style={{ fontWeight: 500 }}><b>Ghi chú:</b> {existing.note}</p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t-[3px] border-dashed border-black/20 flex items-center justify-end gap-3">
            <button onClick={onClose} className="border-[3px] border-black bg-white text-[#0A1628] py-2.5 px-5 font-sans hover:-translate-y-0.5 transition-transform" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>Đóng</button>
            {canSubmit && (
              <button onClick={submit} disabled={saving || uploading}
                className="border-[3px] border-black bg-[#FF6B35] text-white py-2.5 px-6 flex items-center gap-2 font-sans hover:-translate-y-0.5 transition-transform disabled:opacity-60" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {existing ? "Nộp lại" : "Nộp bài"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

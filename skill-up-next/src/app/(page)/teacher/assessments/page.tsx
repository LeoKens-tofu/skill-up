'use client';
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  BookCheck, ClipboardList, CheckCircle2, TrendingUp, Target, Loader2,
  Paperclip, X, Send, Star, FileQuestion, Clock, Filter, Award,
} from "lucide-react";
import { toast } from "sonner";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const API = process.env.NEXT_PUBLIC_API_URL;

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");
const timeAgo = (d?: string) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} ngày trước`;
  return fmtDate(d);
};

type SubFile = { name: string; url: string; size?: string };
type PendingItem = {
  _id: string;
  student: { _id: string; fullName: string; studentId: string; avatar?: string; email?: string };
  courseId: string;
  courseTitle: string;
  coverColor?: string;
  chapterTitle: string;
  assignmentTitle: string;
  lessonId: string;
  maxScore: number;
  xp: number;
  dueDate?: string | null;
  files: SubFile[];
  note?: string;
  submittedAt: string;
};
type GradedItem = PendingItem & { score: number; feedback?: string; xpEarned: number; gradedAt: string };
type QuizItem = {
  _id: string;
  student: { _id: string; fullName: string; studentId: string; avatar?: string };
  quizTitle: string;
  subject: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  xpEarned: number;
  createdAt: string;
};
type Stats = {
  courses: number; assignments: number; totalSubmissions: number;
  pendingCount: number; gradedCount: number; avgScorePercent: number;
  passRatePercent: number; quizAttempts: number;
};
type Overview = {
  stats: Stats;
  pending: PendingItem[];
  recentGraded: GradedItem[];
  recentQuiz: QuizItem[];
  courses: { _id: string; title: string }[];
};

const initials = (name?: string) =>
  (name || "?").trim().split(/\s+/).slice(-2).map((w) => w[0]).join("").toUpperCase();

export default function AssessmentsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [grading, setGrading] = useState<PendingItem | null>(null);

  const fetchData = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await fetch(`${API}/client/teacher/assessments/overview`, { credentials: "include" });
      const json = await res.json();
      if (json.code === "success") setData(json.data);
      else toast.error(json.message || "Không tải được dữ liệu");
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pending = useMemo(
    () => (data?.pending || []).filter((p) => !courseFilter || p.courseId === courseFilter),
    [data, courseFilter]
  );
  const recentGraded = useMemo(
    () => (data?.recentGraded || []).filter((p) => !courseFilter || p.courseId === courseFilter).slice(0, 8),
    [data, courseFilter]
  );

  const s = data?.stats;
  const statTiles = [
    { label: "Cần chấm", value: s?.pendingCount ?? 0, icon: ClipboardList, bg: "#FFE4D6", iconBg: "#FF6B35", iconColor: "#fff" },
    { label: "Đã chấm", value: s?.gradedCount ?? 0, icon: CheckCircle2, bg: "#FFF8F0", iconBg: "#16A34A", iconColor: "#fff" },
    { label: "Điểm trung bình", value: `${s?.avgScorePercent ?? 0}%`, icon: TrendingUp, bg: "#FFF8F0", iconBg: "#FFD166", iconColor: "#0A1628" },
    { label: "Tỉ lệ đạt", value: `${s?.passRatePercent ?? 0}%`, icon: Target, bg: "#FFF8F0", iconBg: "#7C3AED", iconColor: "#fff" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 border-[4px] border-black bg-[#FF6B35] flex items-center justify-center flex-shrink-0" style={{ boxShadow: SHADOW_SM }}>
          <BookCheck size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-serif text-[#0A1628]" style={{ fontWeight: 800, fontSize: "1.9rem" }}>Đánh giá năng lực</h1>
          <p className="font-sans text-sm text-[#0A1628]/60" style={{ fontWeight: 500 }}>
            Chấm bài tập và theo dõi kết quả học sinh trên tất cả lớp bạn phụ trách.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statTiles.map((t, i) => {
              const Icon = t.icon;
              return (
                <div key={i} className="border-[4px] border-black p-4 hover:-translate-y-1 transition-transform" style={{ backgroundColor: t.bg, boxShadow: SHADOW }}>
                  <div className="w-11 h-11 border-[3px] border-black flex items-center justify-center mb-3" style={{ backgroundColor: t.iconBg }}>
                    <Icon size={22} style={{ color: t.iconColor }} />
                  </div>
                  <p className="font-serif text-[#0A1628]" style={{ fontWeight: 800, fontSize: "2rem", lineHeight: 1 }}>{t.value}</p>
                  <p className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 mt-1" style={{ fontWeight: 700 }}>{t.label}</p>
                </div>
              );
            })}
          </div>

          {/* Filter */}
          {(data?.courses.length ?? 0) > 0 && (
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#0A1628]/60" />
              <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}
                className="border-[3px] border-black bg-white px-3 py-2 font-sans text-sm outline-none cursor-pointer" style={{ fontWeight: 600, boxShadow: SHADOW_SM }}>
                <option value="">Tất cả lớp ({data?.courses.length})</option>
                {data?.courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            {/* Cần chấm */}
            <div className="border-[4px] border-black bg-white" style={{ boxShadow: SHADOW }}>
              <div className="flex items-center justify-between px-5 py-3 border-b-[3px] border-black bg-[#FFF8F0]">
                <div className="flex items-center gap-2">
                  <ClipboardList size={20} className="text-[#FF6B35]" />
                  <h2 className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.15rem" }}>Cần chấm</h2>
                </div>
                <span className="font-sans text-xs border-[2px] border-black px-2 py-1 bg-[#FF6B35] text-white" style={{ fontWeight: 700 }}>{pending.length}</span>
              </div>

              {pending.length === 0 ? (
                <div className="py-16 text-center">
                  <CheckCircle2 size={40} className="text-[#16A34A] mx-auto mb-3" />
                  <p className="font-sans text-sm text-[#0A1628]/60" style={{ fontWeight: 600 }}>Không có bài nào chờ chấm. Tuyệt vời!</p>
                </div>
              ) : (
                <div className="divide-y-[2px] divide-black/10">
                  {pending.map((p) => (
                    <div key={p._id} className="p-4 flex items-center gap-3 hover:bg-[#FFF8F0]/60 transition-colors">
                      <div className="w-11 h-11 border-[3px] border-black flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#0A1628] text-white" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>
                        {p.student.avatar ? <img src={p.student.avatar} alt="" className="w-full h-full object-cover" /> : <span className="font-serif text-sm" style={{ fontWeight: 700 }}>{initials(p.student.fullName)}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm text-[#0A1628] truncate" style={{ fontWeight: 700 }}>{p.student.fullName}
                          <span className="text-[#0A1628]/40 ml-1.5" style={{ fontWeight: 500 }}>{p.student.studentId}</span>
                        </p>
                        <p className="font-sans text-xs text-[#0A1628]/70 truncate" style={{ fontWeight: 600 }}>{p.assignmentTitle}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="font-sans text-[10px] px-1.5 py-0.5 border-[1.5px] border-black text-white truncate max-w-[160px]" style={{ backgroundColor: p.coverColor || "#0A1628", fontWeight: 700 }}>{p.courseTitle}</span>
                          <span className="font-sans text-[10px] text-[#0A1628]/50 flex items-center gap-1" style={{ fontWeight: 600 }}><Clock size={11} /> {timeAgo(p.submittedAt)}</span>
                          <span className="font-sans text-[10px] text-[#0A1628]/50 flex items-center gap-1" style={{ fontWeight: 600 }}><Paperclip size={11} /> {p.files.length} file</span>
                        </div>
                      </div>
                      <button onClick={() => setGrading(p)}
                        className="border-[2px] border-black bg-[#0A1628] text-[#FF6B35] px-3 py-2 font-sans text-sm flex items-center gap-1.5 flex-shrink-0 hover:-translate-y-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)", fontWeight: 700 }}>
                        <Star size={14} /> Chấm
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Quiz gần đây */}
              <div className="border-[4px] border-black bg-white" style={{ boxShadow: SHADOW }}>
                <div className="flex items-center gap-2 px-5 py-3 border-b-[3px] border-black bg-[#FFF8F0]">
                  <FileQuestion size={20} className="text-[#7C3AED]" />
                  <h2 className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Quiz gần đây</h2>
                </div>
                {(data?.recentQuiz.length ?? 0) === 0 ? (
                  <p className="font-sans text-sm text-[#0A1628]/50 text-center py-10" style={{ fontWeight: 500 }}>Chưa có lượt làm quiz nào.</p>
                ) : (
                  <div className="divide-y-[2px] divide-black/10">
                    {data?.recentQuiz.map((q) => (
                      <div key={q._id} className="p-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm text-[#0A1628] truncate" style={{ fontWeight: 700 }}>{q.student.fullName}</p>
                          <p className="font-sans text-[11px] text-[#0A1628]/60 truncate" style={{ fontWeight: 600 }}>{q.quizTitle}</p>
                          <p className="font-sans text-[10px] text-[#0A1628]/40 mt-0.5" style={{ fontWeight: 500 }}>{timeAgo(q.createdAt)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-serif text-lg text-[#0A1628] block" style={{ fontWeight: 800 }}>{q.percentage}%</span>
                          <span className="font-sans text-[10px] text-[#0A1628]/50" style={{ fontWeight: 600 }}>{q.correctAnswers}/{q.totalQuestions}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Đã chấm gần đây */}
              <div className="border-[4px] border-black bg-white" style={{ boxShadow: SHADOW }}>
                <div className="flex items-center gap-2 px-5 py-3 border-b-[3px] border-black bg-[#FFF8F0]">
                  <Award size={20} className="text-[#16A34A]" />
                  <h2 className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Đã chấm gần đây</h2>
                </div>
                {recentGraded.length === 0 ? (
                  <p className="font-sans text-sm text-[#0A1628]/50 text-center py-10" style={{ fontWeight: 500 }}>Chưa chấm bài nào.</p>
                ) : (
                  <div className="divide-y-[2px] divide-black/10">
                    {recentGraded.map((g) => (
                      <button key={g._id} onClick={() => setGrading(g)} className="w-full text-left p-3 flex items-center gap-3 hover:bg-[#FFF8F0]/60 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm text-[#0A1628] truncate" style={{ fontWeight: 700 }}>{g.student.fullName}</p>
                          <p className="font-sans text-[11px] text-[#0A1628]/60 truncate" style={{ fontWeight: 600 }}>{g.assignmentTitle}</p>
                        </div>
                        <span className="font-sans text-xs border-[2px] border-black px-2 py-1 flex-shrink-0" style={{ fontWeight: 700, backgroundColor: "#16A34A", color: "#fff" }}>{g.score}/{g.maxScore}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {grading && (
        <GradeModal item={grading} onClose={() => setGrading(null)} onGraded={() => { setGrading(null); fetchData({ silent: true }); }} />
      )}
    </div>
  );
}

function GradeModal({ item, onClose, onGraded }: { item: PendingItem & Partial<GradedItem>; onClose: () => void; onGraded: () => void }) {
  const [score, setScore] = useState<string>(item.score != null ? String(item.score) : "");
  const [feedback, setFeedback] = useState<string>(item.feedback || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const n = Number(score);
    if (score === "" || isNaN(n) || n < 0 || n > item.maxScore) {
      toast.error(`Điểm phải từ 0 đến ${item.maxScore}`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/client/teacher/assessments/submissions/${item._id}/grade`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: n, feedback }),
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message || "Đã chấm điểm");
        if (json.data?.xpAwarded > 0) toast.success(`+${json.data.xpAwarded} XP cho sinh viên`);
        onGraded();
      } else {
        toast.error(json.message || "Không chấm được");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-3 -right-3 z-20 w-10 h-10 border-[3px] border-black bg-[#991B1B] text-white flex items-center justify-center hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}>
          <X size={20} strokeWidth={3} />
        </button>

        <div className="border-[4px] border-black bg-[#FFF8F0] max-h-[90vh] overflow-y-auto" style={{ boxShadow: SHADOW }}>
          <div className="p-5 border-b-[4px] border-black bg-white sticky top-0 z-10">
            <h3 className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.3rem" }}>Chấm bài</h3>
            <p className="font-sans text-sm text-[#0A1628]/60 mt-1" style={{ fontWeight: 500 }}>{item.student.fullName} · {item.assignmentTitle}</p>
            <p className="font-sans text-xs text-[#0A1628]/40 mt-0.5" style={{ fontWeight: 500 }}>{item.courseTitle}</p>
          </div>

          <div className="p-5 space-y-4">
            {/* File đã nộp */}
            <div>
              <p className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 mb-2" style={{ fontWeight: 700 }}>File đã nộp</p>
              <div className="space-y-1.5">
                {item.files.map((f, fi) => (
                  <a key={fi} href={`${API}${f.url}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 border-[2px] border-black bg-white px-3 py-2 hover:-translate-y-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>
                    <Paperclip size={14} className="text-[#FF6B35]" />
                    <span className="flex-1 font-sans text-xs text-[#0A1628] truncate" style={{ fontWeight: 600 }}>{f.name}</span>
                    <span className="font-sans text-[10px] text-[#0A1628]/50" style={{ fontWeight: 600 }}>{f.size}</span>
                  </a>
                ))}
              </div>
              {item.note && (
                <p className="font-sans text-xs text-[#0A1628]/70 mt-2" style={{ fontWeight: 500 }}><b>Ghi chú SV:</b> {item.note}</p>
              )}
            </div>

            {/* Điểm */}
            <div>
              <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 block mb-2" style={{ fontWeight: 700 }}>Điểm (tối đa {item.maxScore})</label>
              <input type="number" min={0} max={item.maxScore} value={score} onChange={(e) => setScore(e.target.value)}
                placeholder={`0 - ${item.maxScore}`}
                className="w-full border-[3px] border-black bg-white px-3 py-2 font-sans outline-none focus:-translate-y-0.5 transition-transform" style={{ fontWeight: 600 }} />
              <p className="font-sans text-[11px] text-[#0A1628]/50 mt-1" style={{ fontWeight: 500 }}>
                Đạt ≥ {item.maxScore / 2} điểm → sinh viên nhận +{item.xp || 0} XP.
              </p>
            </div>

            {/* Nhận xét */}
            <div>
              <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 block mb-2" style={{ fontWeight: 700 }}>Nhận xét (tùy chọn)</label>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3}
                placeholder="Nhận xét gửi sinh viên..."
                className="w-full border-[3px] border-black bg-white px-3 py-2 font-sans text-sm outline-none resize-none" />
            </div>
          </div>

          <div className="p-5 border-t-[3px] border-dashed border-black/20 flex items-center justify-end gap-3">
            <button onClick={onClose} className="border-[3px] border-black bg-white text-[#0A1628] py-2.5 px-5 font-sans hover:-translate-y-0.5 transition-transform" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>Hủy</button>
            <button onClick={save} disabled={saving}
              className="border-[3px] border-black bg-[#16A34A] text-white py-2.5 px-6 flex items-center gap-2 font-sans hover:-translate-y-0.5 transition-transform disabled:opacity-60" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Lưu điểm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

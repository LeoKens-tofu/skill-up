'use client';
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Search, Users, TrendingUp, Award, Target, Zap, CalendarClock,
  CheckCircle2, Circle, X, Video, FileText, Paperclip, HelpCircle, BookOpen,
  ChevronUp, ChevronDown, User as UserIcon, ClipboardList, Loader2, Send, Star,
} from "lucide-react";
import { toast } from "sonner";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const API = process.env.NEXT_PUBLIC_API_URL;

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

const fmtDateTime = (d?: string | null) => {
  if (!d) return "Không hạn";
  const dt = new Date(d);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(dt.getDate())}/${p(dt.getMonth() + 1)}/${dt.getFullYear()} ${p(dt.getHours())}:${p(dt.getMinutes())}`;
};

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

const lessonIcon = (type: string) => {
  if (type === "video") return Video;
  if (type === "article") return FileText;
  if (type === "resource") return Paperclip;
  if (type === "quiz") return HelpCircle;
  return BookOpen;
};

type SortKey = "name" | "progress" | "quiz" | "active";

function StatTile({ icon: Icon, label, value, accent }: any) {
  return (
    <div className="border-[3px] border-black bg-white px-4 py-3 flex items-center gap-3" style={{ boxShadow: SHADOW_SM }}>
      <div className="w-10 h-10 border-[2px] border-black flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accent }}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="font-sans text-[11px] uppercase tracking-wide text-[#0A1628]/60 leading-tight" style={{ fontWeight: 700 }}>{label}</p>
        <p className="font-serif text-[#0A1628] leading-tight" style={{ fontWeight: 700, fontSize: "1.35rem" }}>{value}</p>
      </div>
    </div>
  );
}

function StudentModal({ courseId, studentId, onClose }: { courseId: string; studentId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/client/teacher/classes/${courseId}/students/${studentId}`, { credentials: "include" });
        const json = await res.json();
        if (json.code === "success") setData(json.data);
        else toast.error(json.message || "Không tải được chi tiết sinh viên");
      } catch {
        toast.error("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, studentId]);

  // Nhóm bài học theo chương (giữ thứ tự xuất hiện)
  const chapters = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, any[]>();
    const order: string[] = [];
    data.lessons.forEach((ls: any) => {
      if (!map.has(ls.chapterTitle)) { map.set(ls.chapterTitle, []); order.push(ls.chapterTitle); }
      map.get(ls.chapterTitle)!.push(ls);
    });
    return order.map((title) => ({ title, lessons: map.get(title)! }));
  }, [data]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col border-[4px] border-black bg-[#FFF8F0]"
        style={{ boxShadow: SHADOW }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-10 h-10 border-[3px] border-black bg-[#991B1B] text-white flex items-center justify-center hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
          style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}
        >
          <X size={20} strokeWidth={3} />
        </button>

        {loading ? (
          <div className="p-12 text-center font-sans text-[#0A1628]/60" style={{ fontWeight: 600 }}>Đang tải...</div>
        ) : !data ? (
          <div className="p-12 text-center font-sans text-[#0A1628]/60" style={{ fontWeight: 600 }}>Không có dữ liệu.</div>
        ) : (
          <>
            {/* Header SV */}
            <div className="p-5 border-b-[4px] border-black bg-white flex items-center gap-4">
              <div className="w-14 h-14 border-[3px] border-black bg-[#FF6B35] overflow-hidden flex items-center justify-center text-white flex-shrink-0">
                {data.student.avatar ? (
                  <img src={data.student.avatar} alt={data.student.fullName} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={26} />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-[#0A1628] leading-tight truncate" style={{ fontWeight: 700, fontSize: "1.35rem" }}>{data.student.fullName}</h3>
                <p className="font-sans text-sm text-[#0A1628]/60 truncate" style={{ fontWeight: 500 }}>
                  {data.student.studentId} · {data.student.email}
                </p>
              </div>
              {data.isCompleted && (
                <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 border-[2px] border-black bg-[#16A34A] text-white flex-shrink-0" style={{ fontWeight: 700, fontSize: "0.7rem" }}>
                  <Award size={13} /> HOÀN THÀNH
                </span>
              )}
            </div>

            {/* Chips tổng quan */}
            <div className="p-5 border-b-[3px] border-dashed border-black/20 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center border-[2px] border-black bg-white py-2">
                <p className="font-serif text-[#FF6B35]" style={{ fontWeight: 700, fontSize: "1.35rem" }}>{data.progressPercent}%</p>
                <p className="font-sans text-[10px] uppercase tracking-wide text-[#0A1628]/60" style={{ fontWeight: 700 }}>Tiến độ</p>
              </div>
              <div className="text-center border-[2px] border-black bg-white py-2">
                <p className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.35rem" }}>{data.completedLessons}/{data.totalLessons}</p>
                <p className="font-sans text-[10px] uppercase tracking-wide text-[#0A1628]/60" style={{ fontWeight: 700 }}>Bài học</p>
              </div>
              <div className="text-center border-[2px] border-black bg-white py-2">
                <p className="font-serif text-[#16A34A]" style={{ fontWeight: 700, fontSize: "1.35rem" }}>{data.xpEarned}</p>
                <p className="font-sans text-[10px] uppercase tracking-wide text-[#0A1628]/60" style={{ fontWeight: 700 }}>XP</p>
              </div>
              <div className="text-center border-[2px] border-black bg-white py-2">
                <p className="font-serif text-[#0A1628] leading-tight" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{fmtDate(data.enrolledAt)}</p>
                <p className="font-sans text-[10px] uppercase tracking-wide text-[#0A1628]/60" style={{ fontWeight: 700 }}>Ghi danh</p>
              </div>
            </div>

            {/* Danh sách bài học theo chương */}
            <div className="p-5 overflow-y-auto space-y-5">
              {chapters.map((ch, ci) => (
                <div key={ci}>
                  <p className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/50 mb-2" style={{ fontWeight: 700 }}>{ch.title}</p>
                  <div className="space-y-2">
                    {ch.lessons.map((ls: any, li: number) => {
                      const Icon = lessonIcon(ls.type);
                      return (
                        <div
                          key={li}
                          className="flex items-center gap-3 border-[2px] border-black px-3 py-2"
                          style={{ backgroundColor: ls.completed ? "#F0FDF4" : "#FFFFFF" }}
                        >
                          {ls.completed ? (
                            <CheckCircle2 size={18} className="text-[#16A34A] flex-shrink-0" />
                          ) : (
                            <Circle size={18} className="text-[#0A1628]/30 flex-shrink-0" />
                          )}
                          <Icon size={15} className="text-[#0A1628]/50 flex-shrink-0" />
                          <span className="font-sans text-sm text-[#0A1628] flex-1 min-w-0 truncate" style={{ fontWeight: 600 }}>{ls.title}</span>
                          {ls.type === "quiz" && ls.quizResult ? (
                            <span
                              className="flex-shrink-0 text-xs border-[2px] border-black px-2 py-0.5"
                              style={{
                                fontWeight: 700,
                                backgroundColor: ls.quizResult.score >= 8 ? "#16A34A" : ls.quizResult.score >= 5 ? "#FFD166" : "#991B1B",
                                color: ls.quizResult.score >= 5 && ls.quizResult.score < 8 ? "#000" : "#fff",
                              }}
                              title={`${ls.quizResult.correctAnswers}/${ls.quizResult.totalQuestions} câu đúng`}
                            >
                              {ls.quizResult.score}/10
                            </span>
                          ) : ls.type === "quiz" ? (
                            <span className="flex-shrink-0 text-xs text-[#0A1628]/40 font-sans" style={{ fontWeight: 600 }}>chưa làm</span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("progress");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [activeStudent, setActiveStudent] = useState<string | null>(null);
  const [tab, setTab] = useState<"students" | "submissions">("students");

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/client/teacher/classes/${courseId}`, { credentials: "include" });
      const json = await res.json();
      if (json.code === "success") setData(json.data);
      else {
        toast.error(json.message || "Không tải được lớp học");
        router.push("/teacher/classes");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
      router.push("/teacher/classes");
    } finally {
      setLoading(false);
    }
  }, [courseId, router]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const rows = useMemo(() => {
    if (!data) return [];
    let list = [...data.students];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((s) =>
        s.student.fullName.toLowerCase().includes(q) ||
        (s.student.studentId || "").toLowerCase().includes(q) ||
        (s.student.email || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter === "completed") list = list.filter((s) => s.isCompleted);
    else if (statusFilter === "in-progress") list = list.filter((s) => !s.isCompleted && s.progressPercent > 0);
    else if (statusFilter === "not-started") list = list.filter((s) => s.progressPercent === 0);

    list.sort((a, b) => {
      let av: any, bv: any;
      if (sortKey === "name") { av = a.student.fullName.toLowerCase(); bv = b.student.fullName.toLowerCase(); }
      else if (sortKey === "progress") { av = a.progressPercent; bv = b.progressPercent; }
      else if (sortKey === "quiz") { av = a.avgQuizScore ?? -1; bv = b.avgQuizScore ?? -1; }
      else { av = new Date(a.lastActive).getTime(); bv = new Date(b.lastActive).getTime(); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [data, search, statusFilter, sortKey, sortDir]);

  const SortHeader = ({ label, k, className = "" }: { label: string; k: SortKey; className?: string }) => (
    <th className={`p-4 ${className}`} style={{ fontWeight: 700 }}>
      <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:opacity-80">
        {label}
        {sortKey === k ? (sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} className="opacity-30" />}
      </button>
    </th>
  );

  if (loading) {
    return <div className="p-10 text-center font-bold font-sans text-[#0A1628]/60">Đang tải lớp học...</div>;
  }
  if (!data) return null;

  const { course, summary } = data;

  return (
    <div className="space-y-8">
      <button
        onClick={() => router.push("/teacher/classes")}
        className="inline-flex items-center gap-2 border-[3px] border-black bg-white text-[#0A1628] px-4 py-2 font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5"
        style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
      >
        <ArrowLeft size={18} /> Danh sách lớp
      </button>

      {/* Header lớp */}
      <div className="border-[4px] border-black bg-white flex items-stretch" style={{ boxShadow: SHADOW }}>
        <div
          className="w-28 flex-shrink-0 border-r-[4px] border-black overflow-hidden"
          style={{
            backgroundColor: course.coverColor || "#FF6B35",
            backgroundImage: course.thumbnail ? undefined : `repeating-linear-gradient(45deg, ${course.stripeColor || "#0A1628"} 0 12px, transparent 12px 28px)`,
          }}
        >
          {course.thumbnail && <img src={`${API}${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" />}
        </div>
        <div className="p-5 flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628]" style={{ fontWeight: 700 }}>{course.category}</span>
            <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#0A1628] text-[#FFF8F0]" style={{ fontWeight: 700 }}>{course.level}</span>
            {course.status === "draft" && (
              <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#FFD166] text-black" style={{ fontWeight: 700 }}>Bản nháp</span>
            )}
          </div>
          <h1 className="font-serif text-3xl text-[#0A1628] leading-tight" style={{ fontWeight: 700 }}>{course.title}</h1>
          {course.subtitle && <p className="font-sans text-[#0A1628]/60 mt-1" style={{ fontWeight: 500 }}>{course.subtitle}</p>}
          <p className="font-sans text-sm text-[#0A1628]/50 mt-2" style={{ fontWeight: 500 }}>
            {course.totalLessons} bài học · Mở lớp {fmtDate(course.createdAt)}
          </p>
        </div>
      </div>

      {/* Thống kê tổng hợp */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatTile icon={Users} label="Sinh viên" value={summary.totalStudents} accent="#0A1628" />
        <StatTile icon={TrendingUp} label="Tiến độ TB" value={`${summary.avgProgress}%`} accent="#FF6B35" />
        <StatTile icon={Award} label="Hoàn thành" value={summary.completedStudents} accent="#16A34A" />
        <StatTile icon={Target} label="Điểm quiz TB" value={summary.avgQuizScore != null ? `${summary.avgQuizScore}/10` : "—"} accent="#7C3AED" />
        <StatTile icon={CalendarClock} label="Hoạt động/tuần" value={summary.activeThisWeek} accent="#0EA5E9" />
      </div>

      {/* Tab chuyển giữa Sinh viên / Bài nộp */}
      <div className="flex gap-2">
        {([["students", "Sinh viên"], ["submissions", "Bài nộp"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="border-[3px] border-black px-5 py-2.5 font-sans transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: tab === id ? "#0A1628" : "#FFF8F0", color: tab === id ? "#FF6B35" : "#0A1628", boxShadow: SHADOW_SM, fontWeight: 700 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "submissions" && <SubmissionsTab courseId={courseId} />}

      {tab === "students" && (<>
      {/* Bộ lọc */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFF8F0] border-[4px] border-black p-4" style={{ boxShadow: SHADOW_SM }}>
        <div className="flex items-center border-[3px] border-black bg-white px-4 py-2 w-full md:w-96 transition-all focus-within:-translate-y-0.5 focus-within:-translate-x-0.5">
          <Search size={20} className="text-[#0A1628]/50 mr-2" />
          <input
            type="text"
            placeholder="Tìm sinh viên (tên, mã SV, email)..."
            className="bg-transparent outline-none font-sans w-full text-[#0A1628]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border-[3px] border-black bg-white text-[#0A1628] px-4 py-2.5 font-sans outline-none cursor-pointer"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="in-progress">Đang học</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="not-started">Chưa bắt đầu</option>
        </select>
      </div>

      {/* Bảng sinh viên */}
      <div className="overflow-x-auto border-[4px] border-black bg-white" style={{ boxShadow: SHADOW }}>
        <table className="w-full text-left font-sans min-w-[860px]">
          <thead>
            <tr className="border-b-[4px] border-black bg-[#FF6B35] text-white">
              <SortHeader label="Sinh viên" k="name" />
              <th className="p-4" style={{ fontWeight: 700 }}>Ghi danh</th>
              <SortHeader label="Tiến độ" k="progress" />
              <th className="p-4" style={{ fontWeight: 700 }}>Bài xong</th>
              <SortHeader label="Điểm quiz" k="quiz" />
              <SortHeader label="Hoạt động" k="active" />
              <th className="p-4" style={{ fontWeight: 700 }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center font-sans text-lg text-[#0A1628]/60 font-semibold">
                  {data.students.length === 0 ? "Chưa có sinh viên nào ghi danh lớp này." : "Không tìm thấy sinh viên phù hợp bộ lọc."}
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr
                  key={s.enrollmentId}
                  onClick={() => setActiveStudent(s.student._id)}
                  className="border-b-[3px] border-black text-[#0A1628] transition-colors hover:bg-[#FFF8F0] cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 border-[2px] border-black bg-[#FF6B35] overflow-hidden flex items-center justify-center text-white flex-shrink-0">
                        {s.student.avatar ? (
                          <img src={s.student.avatar} alt={s.student.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={18} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-sans truncate" style={{ fontWeight: 700 }}>{s.student.fullName}</p>
                        <p className="font-sans text-xs text-[#0A1628]/55 truncate" style={{ fontWeight: 500 }}>{s.student.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm" style={{ fontWeight: 600 }}>{fmtDate(s.enrolledAt)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="flex-1 h-2.5 border-[2px] border-black bg-[#FFF8F0]">
                        <div className="h-full bg-[#FF6B35]" style={{ width: `${s.progressPercent}%` }} />
                      </div>
                      <span className="text-sm w-9 text-right" style={{ fontWeight: 700 }}>{s.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm" style={{ fontWeight: 600 }}>{s.completedLessons}/{s.totalLessons}</td>
                  <td className="p-4">
                    {s.avgQuizScore != null ? (
                      <span
                        className="text-xs border-[2px] border-black px-2 py-0.5"
                        style={{
                          fontWeight: 700,
                          backgroundColor: s.avgQuizScore >= 8 ? "#16A34A" : s.avgQuizScore >= 5 ? "#FFD166" : "#991B1B",
                          color: s.avgQuizScore >= 5 && s.avgQuizScore < 8 ? "#000" : "#fff",
                        }}
                      >
                        {s.avgQuizScore}/10
                      </span>
                    ) : (
                      <span className="text-xs text-[#0A1628]/40" style={{ fontWeight: 600 }}>—</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-[#0A1628]/70" style={{ fontWeight: 600 }}>{timeAgo(s.lastActive)}</td>
                  <td className="p-4">
                    {s.isCompleted ? (
                      <span className="text-xs border-[2px] border-black px-2 py-1 bg-[#16A34A] text-white" style={{ fontWeight: 700 }}>Hoàn thành</span>
                    ) : s.progressPercent > 0 ? (
                      <span className="text-xs border-[2px] border-black px-2 py-1 bg-[#FFD166] text-black" style={{ fontWeight: 700 }}>Đang học</span>
                    ) : (
                      <span className="text-xs border-[2px] border-black px-2 py-1 bg-[#FFF8F0] text-[#0A1628]/70" style={{ fontWeight: 700 }}>Chưa bắt đầu</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </>)}

      {activeStudent && (
        <StudentModal courseId={courseId} studentId={activeStudent} onClose={() => setActiveStudent(null)} />
      )}
    </div>
  );
}

// ============ Tab "Bài nộp" — chấm bài tập ============
function SubmissionsTab({ courseId }: { courseId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [grading, setGrading] = useState<{ assignment: any; submission: any } | null>(null);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/client/teacher/classes/${courseId}/submissions`, { credentials: "include" });
      const json = await res.json();
      if (json.code === "success") setData(json.data);
      else toast.error(json.message || "Không tải được bài nộp");
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  if (loading) {
    return (
      <div className="border-[4px] border-black bg-white p-10 flex flex-col items-center gap-3" style={{ boxShadow: SHADOW }}>
        <Loader2 size={28} className="animate-spin text-[#FF6B35]" />
        <p className="font-sans text-[#0A1628]/60" style={{ fontWeight: 600 }}>Đang tải bài nộp...</p>
      </div>
    );
  }

  const assignments = data?.assignments || [];
  if (assignments.length === 0) {
    return (
      <div className="border-[4px] border-black border-dashed bg-[#FFF8F0] p-10 text-center" style={{ boxShadow: SHADOW }}>
        <ClipboardList size={36} className="mx-auto text-[#FF6B35] mb-2" />
        <p className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.15rem" }}>Lớp này chưa có bài tập nào</p>
        <p className="font-sans text-[#0A1628]/60 mt-1" style={{ fontWeight: 500 }}>Thêm bài học loại "Bài tập" trong trình chỉnh sửa khóa học.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {assignments.map((a: any) => {
        const isOpen = open[a.lessonId] ?? true;
        return (
          <div key={a.lessonId} className="border-[4px] border-black bg-white" style={{ boxShadow: SHADOW }}>
            <button onClick={() => setOpen((o) => ({ ...o, [a.lessonId]: !isOpen }))}
              className="w-full flex items-center gap-3 p-4 border-b-[3px] border-black text-left hover:bg-[#FFF8F0] transition-colors">
              <div className="w-10 h-10 border-[2px] border-black bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                <ClipboardList size={18} className="text-[#FF6B35]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-[#0A1628] truncate" style={{ fontWeight: 700, fontSize: "1.1rem" }}>{a.title}</p>
                <p className="font-sans text-xs text-[#0A1628]/60 truncate" style={{ fontWeight: 500 }}>
                  {a.chapterTitle} · Hạn {fmtDateTime(a.dueDate)} · {a.maxScore} điểm{a.xp ? ` · +${a.xp} XP` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-sans text-[11px] px-2 py-1 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628]" style={{ fontWeight: 700 }}>{a.submittedCount}/{a.totalStudents} nộp</span>
                {a.pendingCount > 0 && (
                  <span className="font-sans text-[11px] px-2 py-1 border-[2px] border-black bg-[#FF6B35] text-white" style={{ fontWeight: 700 }}>{a.pendingCount} chờ chấm</span>
                )}
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {isOpen && (
              <div className="p-4 space-y-2">
                {a.submissions.length === 0 ? (
                  <p className="font-sans text-sm text-[#0A1628]/50 text-center py-4" style={{ fontWeight: 500 }}>Chưa có sinh viên nộp bài.</p>
                ) : (
                  a.submissions.map((s: any) => (
                    <div key={s._id} className="border-[2px] border-black p-3 flex items-center gap-3 flex-wrap"
                      style={{ backgroundColor: s.status === "graded" ? "#F0FDF4" : "#FFFFFF" }}>
                      <div className="w-9 h-9 border-[2px] border-black bg-[#FF6B35] overflow-hidden flex items-center justify-center text-white flex-shrink-0">
                        {s.student.avatar ? <img src={s.student.avatar} alt={s.student.fullName} className="w-full h-full object-cover" /> : <UserIcon size={18} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-sans text-sm text-[#0A1628] truncate" style={{ fontWeight: 700 }}>{s.student.fullName}</p>
                        <p className="font-sans text-xs text-[#0A1628]/55 truncate" style={{ fontWeight: 500 }}>
                          {s.student.studentId} · Nộp {fmtDateTime(s.submittedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {s.files.map((f: any, fi: number) => (
                          <a key={fi} href={`${API}${f.url}`} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 border-[2px] border-black bg-white px-2 py-1 font-sans text-[11px] hover:-translate-y-0.5 transition-transform" style={{ fontWeight: 600 }}>
                            <Paperclip size={12} className="text-[#FF6B35]" /> <span className="max-w-[120px] truncate">{f.name}</span>
                          </a>
                        ))}
                      </div>
                      {s.status === "graded" ? (
                        <span className="font-sans text-xs border-[2px] border-black px-2 py-1 flex-shrink-0"
                          style={{ fontWeight: 700, backgroundColor: "#16A34A", color: "#fff" }}>
                          {s.score}/{a.maxScore}
                        </span>
                      ) : (
                        <span className="font-sans text-[11px] border-[2px] border-black px-2 py-1 bg-[#FFD166] text-black flex-shrink-0" style={{ fontWeight: 700 }}>Chờ chấm</span>
                      )}
                      <button onClick={() => setGrading({ assignment: a, submission: s })}
                        className="border-[2px] border-black bg-[#0A1628] text-[#FF6B35] px-3 py-1.5 font-sans text-sm flex items-center gap-1.5 flex-shrink-0 hover:-translate-y-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)", fontWeight: 700 }}>
                        <Star size={14} /> {s.status === "graded" ? "Sửa điểm" : "Chấm"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}

      {grading && (
        <GradeModal courseId={courseId} assignment={grading.assignment} submission={grading.submission}
          onClose={() => setGrading(null)} onGraded={() => { setGrading(null); fetchSubs(); }} />
      )}
    </div>
  );
}

function GradeModal({
  courseId, assignment, submission, onClose, onGraded,
}: {
  courseId: string;
  assignment: any;
  submission: any;
  onClose: () => void;
  onGraded: () => void;
}) {
  const [score, setScore] = useState<string>(submission.score != null ? String(submission.score) : "");
  const [feedback, setFeedback] = useState<string>(submission.feedback || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const n = Number(score);
    if (score === "" || isNaN(n) || n < 0 || n > assignment.maxScore) {
      toast.error(`Điểm phải từ 0 đến ${assignment.maxScore}`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/client/teacher/classes/${courseId}/submissions/${submission._id}/grade`, {
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
            <p className="font-sans text-sm text-[#0A1628]/60 mt-1" style={{ fontWeight: 500 }}>{submission.student.fullName} · {assignment.title}</p>
          </div>

          <div className="p-5 space-y-4">
            {/* File đã nộp */}
            <div>
              <p className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 mb-2" style={{ fontWeight: 700 }}>File đã nộp</p>
              <div className="space-y-1.5">
                {submission.files.map((f: any, fi: number) => (
                  <a key={fi} href={`${API}${f.url}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 border-[2px] border-black bg-white px-3 py-2 hover:-translate-y-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>
                    <Paperclip size={14} className="text-[#FF6B35]" />
                    <span className="flex-1 font-sans text-xs text-[#0A1628] truncate" style={{ fontWeight: 600 }}>{f.name}</span>
                    <span className="font-sans text-[10px] text-[#0A1628]/50" style={{ fontWeight: 600 }}>{f.size}</span>
                  </a>
                ))}
              </div>
              {submission.note && (
                <p className="font-sans text-xs text-[#0A1628]/70 mt-2" style={{ fontWeight: 500 }}><b>Ghi chú SV:</b> {submission.note}</p>
              )}
            </div>

            {/* Điểm */}
            <div>
              <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 block mb-2" style={{ fontWeight: 700 }}>Điểm (tối đa {assignment.maxScore})</label>
              <input type="number" min={0} max={assignment.maxScore} value={score} onChange={(e) => setScore(e.target.value)}
                placeholder={`0 - ${assignment.maxScore}`}
                className="w-full border-[3px] border-black bg-white px-3 py-2 font-sans outline-none focus:-translate-y-0.5 transition-transform" style={{ fontWeight: 600 }} />
              <p className="font-sans text-[11px] text-[#0A1628]/50 mt-1" style={{ fontWeight: 500 }}>
                Đạt ≥ {assignment.maxScore / 2} điểm → sinh viên nhận +{assignment.xp || 0} XP.
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

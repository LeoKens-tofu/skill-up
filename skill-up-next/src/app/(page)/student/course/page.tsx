'use client';
import { useState, useEffect, useCallback } from "react";
import {
  Search, User as UserIcon, PlayCircle, Compass, Filter, CheckCircle2, Award, BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import CourseDetail from "./CourseDetail";
import CourseLearn from "./CourseLearn";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const API = process.env.NEXT_PUBLIC_API_URL;

const CATEGORIES = ["Lập trình", "Thiết kế", "Ngôn ngữ", "Kỹ năng mềm"];
const FILTERS = ["Tất cả khóa học", "Đã tham gia", ...CATEGORIES];

function CoursesList({ onSelect }: { onSelect: (id: string) => void }) {
  const [filter, setFilter] = useState("Tất cả khóa học");
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const category = CATEGORIES.includes(filter) ? filter : "all";
      const query = new URLSearchParams({ search, category, limit: "50" });
      const res = await fetch(`${API}/client/student/courses?${query}`, { credentials: "include" });
      const json = await res.json();
      if (json.code === "success") {
        setCourses(json.data);
      } else {
        toast.error(json.message || "Không thể tải khóa học");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const t = setTimeout(fetchCourses, 300);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  const filtered = courses.filter((c) => (filter === "Đã tham gia" ? c.isEnrolled : true));

  return (
    <div>
      <p className="font-sans text-[#0A1628]/70 max-w-2xl mb-6" style={{ fontWeight: 400 }}>
        Khám phá, tham gia và theo dõi tiến độ các khóa học của bạn.
      </p>

      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 border-[3px] border-black bg-[#0A1628] text-white px-3 py-2" style={{ boxShadow: SHADOW_SM }}>
            <Filter size={16} />
            <span className="font-sans text-xs uppercase tracking-wider" style={{ fontWeight: 700 }}>Bộ lọc</span>
          </div>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className="border-[3px] border-black px-4 py-2 font-sans text-sm transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
                style={{ backgroundColor: active ? "#FF6B35" : "#FFF8F0", color: active ? "#fff" : "#0A1628", fontWeight: active ? 700 : 500, boxShadow: SHADOW_SM }}>
                {f}
              </button>
            );
          })}
        </div>

        <div className="border-[3px] border-black bg-white flex items-center px-4 py-2 w-full md:w-72 flex-shrink-0" style={{ boxShadow: SHADOW_SM }}>
          <Search size={18} className="text-[#0A1628]/60 mr-3 flex-shrink-0" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm khóa học..."
            className="flex-1 bg-transparent outline-none font-sans text-sm text-[#0A1628] min-w-0" style={{ fontWeight: 500 }} />
        </div>
      </div>

      {loading ? (
        <div className="border-[4px] border-black border-dashed bg-[#FFF8F0] p-10 text-center font-sans text-[#0A1628]/60" style={{ fontWeight: 600 }}>
          Đang tải khóa học...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
          {filtered.map((c) => {
            const pct = c.progressPercent || 0;
            const instructor = c.teacherId?.fullName || "Giảng viên";
            return (
              <div key={c._id}
                className="border-[4px] border-black bg-white flex flex-col transition-all duration-150 hover:-translate-y-1 hover:-translate-x-1"
                style={{ boxShadow: SHADOW }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "10px 10px 0px 0px rgba(0,0,0,1)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = SHADOW)}>
                <div className="relative h-36 border-b-[4px] border-black overflow-hidden"
                  style={{
                    backgroundColor: c.coverColor || "#FF6B35",
                    backgroundImage: c.thumbnail ? undefined : `repeating-linear-gradient(45deg, ${c.stripeColor || "#0A1628"} 0 12px, transparent 12px 28px)`,
                  }}>
                  {c.thumbnail && <img src={`${API}${c.thumbnail}`} alt={c.title} className="w-full h-full object-cover" />}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628]" style={{ fontWeight: 700 }}>{c.category}</span>
                    <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#0A1628] text-[#FFF8F0]" style={{ fontWeight: 700 }}>{c.level}</span>
                  </div>
                  {c.isCompleted && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 border-[2px] border-black bg-[#16A34A] text-white" style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}>
                      <Award size={12} />
                      <span className="font-sans text-[10px] uppercase tracking-wider" style={{ fontWeight: 700 }}>Hoàn thành</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-serif text-[#0A1628] mb-3 leading-tight" style={{ fontWeight: 700, fontSize: "1.15rem" }}>{c.title}</h3>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-[#0A1628]/75">
                      <UserIcon size={14} />
                      <span className="font-sans text-sm" style={{ fontWeight: 500 }}>{instructor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0A1628]/75">
                      <BookOpen size={14} />
                      <span className="font-sans text-sm" style={{ fontWeight: 500 }}>{c.totalLessons} bài học</span>
                    </div>
                  </div>

                  {c.isEnrolled ? (
                    <>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-sans text-xs text-[#0A1628]/70" style={{ fontWeight: 600 }}>Tiến độ</span>
                        <span className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1rem" }}>{pct}%</span>
                      </div>
                      <div className="w-full h-3 border-[2px] border-black bg-[#FFF8F0] mb-4">
                        <div className="h-full bg-[#FF6B35] transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </>
                  ) : (
                    <div className="mb-4 flex items-center gap-2">
                      <span className="font-sans text-xs px-2 py-1 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628]" style={{ fontWeight: 600 }}>+{c.totalXp} XP</span>
                      <span className="font-sans text-xs text-[#0A1628]/60" style={{ fontWeight: 500 }}>Chưa tham gia</span>
                    </div>
                  )}

                  <button onClick={() => onSelect(c._id)}
                    className="mt-auto w-full bg-[#FF6B35] border-[3px] border-black py-2.5 flex items-center justify-center gap-2 text-white font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
                    style={{ boxShadow: "5px 5px 0px 0px rgba(0,0,0,1)", fontWeight: 700 }}>
                    {c.isEnrolled ? (<><PlayCircle size={18} /> Tiếp tục</>) : (<><Compass size={18} /> Khám phá</>)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="border-[4px] border-black border-dashed bg-[#FFF8F0] p-10 text-center" style={{ boxShadow: SHADOW }}>
          <CheckCircle2 size={40} className="mx-auto text-[#FF6B35] mb-2" />
          <p className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.25rem" }}>Không tìm thấy khóa học nào</p>
          <p className="font-sans text-[#0A1628]/60 mt-1" style={{ fontWeight: 500 }}>Thử bộ lọc hoặc từ khóa khác nhé.</p>
        </div>
      )}
    </div>
  );
}

export default function CoursePage() {
  const [mode, setMode] = useState<"list" | "detail" | "learn">("list");
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Deep-link từ Lịch học: ?course=<id>&lesson=<lessonId>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const course = params.get("course");
    const lesson = params.get("lesson");
    if (course) {
      setActiveCourseId(course);
      if (lesson) {
        setActiveLessonId(lesson);
        setMode("learn");
      } else {
        setMode("detail");
      }
      // dọn query để không giữ lại khi back
      window.history.replaceState(null, "", "/student/course");
    }
  }, []);

  if (mode === "learn" && activeCourseId) {
    return (
      <CourseLearn
        courseId={activeCourseId}
        initialLessonId={activeLessonId}
        onBack={() => setMode("detail")}
      />
    );
  }

  if (mode === "detail" && activeCourseId) {
    return (
      <CourseDetail
        courseId={activeCourseId}
        onBack={() => setMode("list")}
        onOpenLesson={(lessonId: string) => { setActiveLessonId(lessonId); setMode("learn"); }}
      />
    );
  }

  return <CoursesList onSelect={(id) => { setActiveCourseId(id); setMode("detail"); }} />;
}

'use client';
import { useState } from "react";
import {
  Search,
  User as UserIcon,
  Clock,
  Radio,
  PlayCircle,
  Compass,
  Filter,
} from "lucide-react";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

type Course = {
  id: string;
  title: string;
  category: string;
  level: string;
  instructor: string;
  schedule: string;
  lessons: number;
  totalLessons: number;
  joined: boolean;
  live: boolean;
  coverColor: string;
  stripeColor: string;
};

const ALL_COURSES: Course[] = [
  {
    id: "swp391",
    title: "Lập trình Web với React & Node",
    category: "Lập trình",
    level: "Nâng cao",
    instructor: "Ths. Lê Minh Tuấn",
    schedule: "T2, T4, T6 — 18:30",
    lessons: 17,
    totalLessons: 24,
    joined: true,
    live: true,
    coverColor: "#FF6B35",
    stripeColor: "#0A1628",
  },
  {
    id: "dbi202",
    title: "Cơ sở dữ liệu quan hệ",
    category: "Lập trình",
    level: "Cơ bản",
    instructor: "TS. Phạm Quốc Bảo",
    schedule: "T3, T5 — 14:00",
    lessons: 12,
    totalLessons: 20,
    joined: true,
    live: false,
    coverColor: "#0A1628",
    stripeColor: "#FF6B35",
  },
  {
    id: "pru212",
    title: "Thiết kế UI/UX hiện đại",
    category: "Thiết kế",
    level: "Trung cấp",
    instructor: "Ths. Nguyễn Thu Hà",
    schedule: "T7 — 09:00",
    lessons: 9,
    totalLessons: 20,
    joined: true,
    live: false,
    coverColor: "#FFF8F0",
    stripeColor: "#FF6B35",
  },
  {
    id: "ssl101",
    title: "Kỹ năng mềm cho sinh viên",
    category: "Kỹ năng mềm",
    level: "Cơ bản",
    instructor: "Cô Trần Hoài Linh",
    schedule: "CN — 10:00",
    lessons: 18,
    totalLessons: 20,
    joined: true,
    live: false,
    coverColor: "#FF6B35",
    stripeColor: "#FFF8F0",
  },
  {
    id: "eng301",
    title: "Tiếng Anh giao tiếp chuyên ngành IT",
    category: "Ngôn ngữ",
    level: "Trung cấp",
    instructor: "Mr. David Chen",
    schedule: "T2 → T6 — 07:30",
    lessons: 0,
    totalLessons: 30,
    joined: false,
    live: true,
    coverColor: "#0A1628",
    stripeColor: "#FFF8F0",
  },
  {
    id: "ai401",
    title: "Trí tuệ nhân tạo ứng dụng",
    category: "Lập trình",
    level: "Nâng cao",
    instructor: "PGS.TS. Vũ Anh Đức",
    schedule: "T4, T6 — 19:00",
    lessons: 0,
    totalLessons: 28,
    joined: false,
    live: false,
    coverColor: "#FFF8F0",
    stripeColor: "#0A1628",
  },
];

const FILTERS = [
  "Tất cả khóa học",
  "Đã tham gia",
  "Lập trình",
  "Thiết kế",
  "Ngôn ngữ",
  "Kỹ năng mềm",
];

function CoursesList({ isDark = false, onSelect }: { isDark?: boolean; onSelect?: (course: any) => void }) {
  const chipBg = isDark ? "#11203A" : "#FFF8F0";
  const chipText = isDark ? "#FFF8F0" : "#0A1628";
  const [filter, setFilter] = useState("Tất cả khóa học");
  const [search, setSearch] = useState("");

  const filtered = ALL_COURSES.filter((c) => {
    if (filter === "Đã tham gia" && !c.joined) return false;
    if (
      filter !== "Tất cả khóa học" &&
      filter !== "Đã tham gia" &&
      c.category !== filter
    )
      return false;
    if (
      search &&
      !c.title.toLowerCase().includes(search.toLowerCase()) &&
      !c.instructor.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div>
      {/* Description */}
      <p
        className="font-sans text-[#0A1628]/70 dark:text-[#FFF8F0]/70 max-w-2xl mb-6"
        style={{ fontWeight: 400 }}
      >
        Khám phá, tham gia và theo dõi tiến độ của tất cả khóa học bạn đang
        theo học tại Đại học FPT.
      </p>

      {/* Filter row + Search */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-2 border-[3px] border-black bg-[#0A1628] text-white px-3 py-2"
            style={{ boxShadow: SHADOW_SM }}
          >
            <Filter size={16} />
            <span
              className="font-sans text-xs uppercase tracking-wider"
              style={{ fontWeight: 700 }}
            >
              Bộ lọc
            </span>
          </div>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="border-[3px] border-black px-4 py-2 font-sans text-sm transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
                style={{
                  backgroundColor: active ? "#FF6B35" : chipBg,
                  color: active ? "#FFFFFF" : chipText,
                  fontWeight: active ? 700 : 500,
                  boxShadow: SHADOW_SM,
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div
          className="border-[3px] border-black bg-white dark:bg-[#11203A] flex items-center px-4 py-2 w-full md:w-72 flex-shrink-0"
          style={{ boxShadow: SHADOW_SM }}
        >
          <Search size={18} className="text-[#0A1628]/60 dark:text-[#FFF8F0]/60 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm khóa học, giảng viên..."
            className="flex-1 bg-transparent outline-none font-sans text-sm text-[#0A1628] dark:text-[#FFF8F0] min-w-0"
            style={{ fontWeight: 500 }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
        {filtered.map((c) => {
          const pct = Math.round((c.lessons / c.totalLessons) * 100);
          return (
            <div
              key={c.id}
              className="border-[4px] border-black bg-white dark:bg-[#11203A] flex flex-col transition-all duration-150 hover:-translate-y-1 hover:-translate-x-1"
              style={{ boxShadow: SHADOW }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "10px 10px 0px 0px rgba(0,0,0,1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = SHADOW)}
            >
              {/* Cover */}
              <div
                className="relative h-36 border-b-[4px] border-black overflow-hidden"
                style={{
                  backgroundColor: c.coverColor,
                  backgroundImage: `repeating-linear-gradient(45deg, ${c.stripeColor} 0 12px, transparent 12px 28px)`,
                }}
              >
                {/* Tags */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span
                    className="font-sans text-[10px] uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#FFF8F0] dark:bg-[#11203A] text-[#0A1628] dark:text-[#FFF8F0]"
                    style={{ fontWeight: 700 }}
                  >
                    {c.category}
                  </span>
                  <span
                    className="font-sans text-[10px] uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#0A1628] text-[#FFF8F0]"
                    style={{ fontWeight: 700 }}
                  >
                    {c.level}
                  </span>
                </div>
                {c.live && (
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 border-[2px] border-black bg-red-600 text-white"
                    style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}
                  >
                    <Radio size={12} className="animate-pulse" />
                    <span
                      className="font-sans text-[10px] uppercase tracking-wider"
                      style={{ fontWeight: 700 }}
                    >
                      LIVE
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col">
                <h3
                  className="font-serif text-[#0A1628] dark:text-[#FFF8F0] mb-3 leading-tight"
                  style={{ fontWeight: 700, fontSize: "1.15rem" }}
                >
                  {c.title}
                </h3>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-[#0A1628]/75 dark:text-[#FFF8F0]/75">
                    <UserIcon size={14} />
                    <span
                      className="font-sans text-sm"
                      style={{ fontWeight: 500 }}
                    >
                      {c.instructor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#0A1628]/75 dark:text-[#FFF8F0]/75">
                    <Clock size={14} />
                    <span
                      className="font-sans text-sm"
                      style={{ fontWeight: 500 }}
                    >
                      {c.schedule}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                {c.joined ? (
                  <>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="font-sans text-xs text-[#0A1628]/70 dark:text-[#FFF8F0]/70"
                        style={{ fontWeight: 600 }}
                      >
                        {c.lessons}/{c.totalLessons} bài học
                      </span>
                      <span
                        className="font-serif text-[#0A1628] dark:text-[#FFF8F0]"
                        style={{ fontWeight: 700, fontSize: "1rem" }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-3 border-[2px] border-black bg-[#FFF8F0] dark:bg-[#11203A] mb-4">
                      <div
                        className="h-full bg-[#FF6B35] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <div className="mb-4 flex items-center gap-2">
                    <span
                      className="font-sans text-xs px-2 py-1 border-[2px] border-black bg-[#FFF8F0] dark:bg-[#11203A] text-[#0A1628] dark:text-[#FFF8F0]"
                      style={{ fontWeight: 600 }}
                    >
                      {c.totalLessons} bài học
                    </span>
                    <span
                      className="font-sans text-xs text-[#0A1628]/60 dark:text-[#FFF8F0]/60"
                      style={{ fontWeight: 500 }}
                    >
                      Chưa tham gia
                    </span>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={() => onSelect?.(c)}
                  className="mt-auto w-full bg-[#FF6B35] border-[3px] border-black py-2.5 flex items-center justify-center gap-2 text-white font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
                  style={{
                    boxShadow: "5px 5px 0px 0px rgba(0,0,0,1)",
                    fontWeight: 700,
                  }}
                >
                  {c.joined ? (
                    <>
                      <PlayCircle size={18} />
                      Tiếp tục
                    </>
                  ) : (
                    <>
                      <Compass size={18} />
                      Khám phá
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div
          className="border-[4px] border-black border-dashed bg-[#FFF8F0] dark:bg-[#11203A] p-10 text-center"
          style={{ boxShadow: SHADOW }}
        >
          <p
            className="font-serif text-[#0A1628] dark:text-[#FFF8F0]"
            style={{ fontWeight: 700, fontSize: "1.25rem" }}
          >
            Không tìm thấy khóa học nào
          </p>
          <p
            className="font-sans text-[#0A1628]/60 dark:text-[#FFF8F0]/60 mt-1"
            style={{ fontWeight: 500 }}
          >
            Thử bộ lọc hoặc từ khóa khác nhé.
          </p>
        </div>
      )}
    </div>
  );
}


import CourseDetail from "./CourseDetail";

export default function CoursePage({ isDark = false }: { isDark?: boolean }) {
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  if (selectedCourse) {
    return <CourseDetail course={selectedCourse} isDark={isDark} onBack={() => setSelectedCourse(null)} />;
  }

  return <CoursesList isDark={isDark} onSelect={(c) => setSelectedCourse(c)} />;
}

'use client';
import { useState } from "react";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Lock,
  FileText,
  Download,
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
} from "lucide-react";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

type Course = {
  code: string;
  name: string;
  instructor: string;
  progress: number;
};

export default function CourseDetail({
  course,
  isDark = false,
  onBack,
}: {
  course: Course;
  isDark?: boolean;
  onBack: () => void;
}) {
  const lessons = [
    { id: 1, title: "Giới thiệu khóa học", duration: "8:24", done: true },
    { id: 2, title: "Thiết lập môi trường", duration: "15:30", done: true },
    { id: 3, title: "Components & Props", duration: "22:10", done: true },
    { id: 4, title: "State & Hooks", duration: "28:45", done: true, current: true },
    { id: 5, title: "Side Effects & useEffect", duration: "19:50", done: false },
    { id: 6, title: "Context API", duration: "24:15", done: false },
    { id: 7, title: "Custom Hooks", duration: "18:30", done: false },
    { id: 8, title: "Performance & Memo", duration: "26:00", done: false, locked: true },
    { id: 9, title: "Testing với Vitest", duration: "32:20", done: false, locked: true },
    { id: 10, title: "Dự án cuối khóa", duration: "45:00", done: false, locked: true },
  ];

  const materials = [
    { name: "Slide bài giảng — Tuần 1-4.pdf", size: "2.4 MB" },
    { name: "Source code mẫu — Github.zip", size: "8.1 MB" },
    { name: "Tài liệu tham khảo.pdf", size: "1.2 MB" },
    { name: "Bài tập thực hành.docx", size: "340 KB" },
  ];

  const [activeTab, setActiveTab] = useState<"lessons" | "materials" | "discuss">("lessons");
  const text = isDark ? "#FFF8F0" : "#0A1628";
  const muted = isDark ? "rgba(255,248,240,0.6)" : "rgba(10,22,40,0.6)";
  const cardBg = isDark ? "#11203A" : "#FFF8F0";
  const innerBg = isDark ? "#0A1628" : "#FFFFFF";

  const currentLesson = lessons.find((l) => l.current) || lessons.find((l) => !l.done);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-sans text-sm px-3 py-2 border-[3px] border-black bg-[#FFF8F0] dark:bg-[#11203A] text-[#0A1628] dark:text-[#FFF8F0] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
        style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
      >
        <ArrowLeft size={16} /> Quay lại danh sách khóa học
      </button>

      {/* Header */}
      <div
        className="border-[4px] border-black"
        style={{ backgroundColor: cardBg, boxShadow: SHADOW }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
          {/* Video placeholder */}
          <div className="relative aspect-video bg-[#0A1628] border-r-[4px] border-black flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #FF6B35 0 12px, transparent 12px 24px)",
              }}
            ></div>
            <div className="relative flex flex-col items-center gap-3">
              <button
                className="w-20 h-20 border-[4px] border-black bg-[#FF6B35] flex items-center justify-center hover:-translate-y-1 hover:-translate-x-1 transition-transform"
                style={{ boxShadow: SHADOW }}
              >
                <Play size={36} className="text-white ml-1" fill="white" />
              </button>
              <p
                className="font-sans text-white text-sm"
                style={{ fontWeight: 600 }}
              >
                Bài {currentLesson?.id}: {currentLesson?.title}
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="font-sans text-xs uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#FF6B35] text-white"
                style={{ fontWeight: 700 }}
              >
                {course.code}
              </span>
              <span
                className="font-sans text-xs uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#0A1628] text-[#FF6B35]"
                style={{ fontWeight: 700 }}
              >
                Đang học
              </span>
            </div>
            <h2
              className="font-serif mb-2"
              style={{ fontWeight: 700, fontSize: "1.6rem", color: text }}
            >
              {course.name}
            </h2>
            <p className="font-sans text-sm mb-4" style={{ fontWeight: 500, color: muted }}>
              Giảng viên: <span style={{ color: text, fontWeight: 700 }}>{course.instructor}</span>
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { icon: Clock, label: "12 giờ" },
                { icon: Users, label: "1,240 SV" },
                { icon: Star, label: "4.8/5" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="border-[2px] border-black p-2 text-center"
                  style={{ backgroundColor: innerBg }}
                >
                  <s.icon size={16} className="mx-auto text-[#FF6B35]" />
                  <p
                    className="font-sans text-xs mt-1"
                    style={{ fontWeight: 700, color: text }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mb-2 flex items-baseline justify-between">
              <p className="font-sans text-xs uppercase tracking-wider" style={{ fontWeight: 700, color: muted }}>
                Tiến độ
              </p>
              <p className="font-serif" style={{ fontWeight: 700, fontSize: "1.25rem", color: text }}>
                {course.progress}%
              </p>
            </div>
            <div className="w-full h-3 border-[2px] border-black bg-white dark:bg-[#0A1628] overflow-hidden mb-4">
              <div className="h-full bg-[#FF6B35]" style={{ width: `${course.progress}%` }}></div>
            </div>

            <button
              className="mt-auto flex items-center justify-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-4 py-3 font-sans hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1 transition-transform"
              style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
            >
              <Play size={18} fill="white" />
              Tiếp tục học từ chỗ đang dở
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["lessons", "materials", "discuss"] as const).map((t) => {
          const labels = { lessons: "Bài học", materials: "Tài liệu", discuss: "Thảo luận" };
          const active = activeTab === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="font-sans px-4 py-2.5 border-[3px] border-black transition-all hover:-translate-y-0.5 hover:-translate-x-0.5"
              style={{
                backgroundColor: active ? "#FF6B35" : isDark ? "#11203A" : "#FFF8F0",
                color: active ? "#FFFFFF" : text,
                fontWeight: 700,
                boxShadow: SHADOW_SM,
              }}
            >
              {labels[t]}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === "lessons" && (
        <div
          className="border-[4px] border-black"
          style={{ backgroundColor: cardBg, boxShadow: SHADOW }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black">
            <div className="flex items-center gap-2">
              <BookOpen size={22} className="text-[#FF6B35]" />
              <h3 className="font-serif" style={{ fontWeight: 700, fontSize: "1.2rem", color: text }}>
                Danh sách bài học
              </h3>
            </div>
            <span className="font-sans text-sm" style={{ fontWeight: 600, color: muted }}>
              {lessons.filter((l) => l.done).length} / {lessons.length} hoàn thành
            </span>
          </div>
          <div className="p-4 space-y-2">
            {lessons.map((l) => (
              <div
                key={l.id}
                className="border-[3px] border-black p-3 flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:-translate-x-0.5 cursor-pointer"
                style={{
                  backgroundColor: l.current
                    ? isDark ? "#3A1A10" : "#FFE4D6"
                    : innerBg,
                  boxShadow: SHADOW_SM,
                  opacity: l.locked ? 0.5 : 1,
                }}
              >
                <div
                  className="w-10 h-10 border-[2px] border-black flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: l.done
                      ? "#16A34A"
                      : l.locked
                      ? isDark ? "#11203A" : "#FFF8F0"
                      : "#FF6B35",
                  }}
                >
                  {l.done ? (
                    <CheckCircle2 size={20} className="text-white" />
                  ) : l.locked ? (
                    <Lock size={18} style={{ color: text }} />
                  ) : (
                    <Play size={18} className="text-white" fill="white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-sans"
                    style={{ fontWeight: l.current ? 700 : 600, color: text }}
                  >
                    Bài {l.id}: {l.title}
                  </p>
                  <p className="font-sans text-xs mt-0.5" style={{ fontWeight: 500, color: muted }}>
                    {l.duration}
                  </p>
                </div>
                {l.current && (
                  <span
                    className="font-sans text-[10px] uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#FF6B35] text-white"
                    style={{ fontWeight: 700 }}
                  >
                    Đang học
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "materials" && (
        <div
          className="border-[4px] border-black"
          style={{ backgroundColor: cardBg, boxShadow: SHADOW }}
        >
          <div className="flex items-center gap-2 px-6 py-4 border-b-[3px] border-black">
            <FileText size={22} className="text-[#FF6B35]" />
            <h3 className="font-serif" style={{ fontWeight: 700, fontSize: "1.2rem", color: text }}>
              Tài liệu khóa học
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {materials.map((m, i) => (
              <div
                key={i}
                className="border-[3px] border-black p-3 flex items-center gap-3"
                style={{ backgroundColor: innerBg, boxShadow: SHADOW_SM }}
              >
                <div className="w-10 h-10 border-[2px] border-black bg-[#FFD166] flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-[#0A1628]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans truncate" style={{ fontWeight: 700, color: text }}>
                    {m.name}
                  </p>
                  <p className="font-sans text-xs mt-0.5" style={{ fontWeight: 500, color: muted }}>
                    {m.size}
                  </p>
                </div>
                <button
                  className="border-[2px] border-black bg-[#FF6B35] text-white p-2 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                  style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
                  title="Tải xuống"
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "discuss" && (
        <div
          className="border-[4px] border-black p-8 text-center"
          style={{ backgroundColor: cardBg, boxShadow: SHADOW }}
        >
          <Award size={40} className="mx-auto text-[#FF6B35] mb-2" />
          <p className="font-serif mb-1" style={{ fontWeight: 700, fontSize: "1.2rem", color: text }}>
            Diễn đàn thảo luận
          </p>
          <p className="font-sans text-sm" style={{ fontWeight: 500, color: muted }}>
            Đặt câu hỏi và trao đổi với giảng viên + 1,240 sinh viên khác. Sắp ra mắt!
          </p>
        </div>
      )}
    </div>
  );
}


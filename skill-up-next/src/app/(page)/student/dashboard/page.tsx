'use client';
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  CalendarClock,
  UserCircle2,
  Settings,
  LogOut,
  Flame,
  GraduationCap,
  FileWarning,
  Trophy,
  Bell,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  Bot,
  Sun,
  Moon,
  TrendingUp,
  Crown,
  ChevronsLeft,
  ChevronsRight,
  CalendarDays,
  Users,
  ShoppingBag,
} from "lucide-react";
import QuickActions from "@/components/QuickActions";
import { useStudentProfile } from "@/context/StudentProfileContext";

type HomeProps = {
  onLogout: () => void;
};

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

const stats = [
  {
    label: "Bài tập chưa nộp",
    value: "5",
    sub: "Cần xử lý ngay",
    icon: FileWarning,
    bg: "#FFE4D6",
    accent: "#C2410C",
    iconBg: "#FF6B35",
  },
  {
    label: "Điểm GPA",
    value: "3.42",
    sub: "Học kỳ Spring 2026",
    icon: GraduationCap,
    bg: "#FFF8F0",
    accent: "#0A1628",
    iconBg: "#FFF8F0",
  },
  {
    label: "Chuỗi học liên tục",
    value: "14",
    sub: "Ngày liên tiếp",
    icon: Flame,
    bg: "#FFF8F0",
    accent: "#0A1628",
    iconBg: "#FFF8F0",
  },
  {
    label: "Tổng điểm XP",
    value: "2,450",
    sub: "Cấp 12 — Học giả",
    icon: Trophy,
    bg: "#FFF8F0",
    accent: "#0A1628",
    iconBg: "#FFF8F0",
  },
];

const deadlines = [
  {
    title: "Bài tập lớn — Lập trình Web",
    course: "SWP391",
    due: "2 ngày nữa",
    status: "Chưa nộp",
    urgent: true,
  },
  {
    title: "Quiz Chương 4 — CSDL",
    course: "DBI202",
    due: "5 ngày nữa",
    status: "Đang làm",
    urgent: false,
  },
  {
    title: "Báo cáo nhóm — Kỹ năng mềm",
    course: "SSL101c",
    due: "1 tuần nữa",
    status: "Chưa bắt đầu",
    urgent: false,
  },
  {
    title: "Thuyết trình cuối kỳ — UI/UX",
    course: "PRU212",
    due: "12 ngày nữa",
    status: "Chưa bắt đầu",
    urgent: false,
  },
];

const activities = [
  {
    icon: CheckCircle2,
    title: "Hoàn thành quiz Chương 3",
    sub: "DBI202 · +50 XP",
    time: "2 giờ trước",
  },
  {
    icon: Award,
    title: "Đạt huy hiệu Streak 14 ngày",
    sub: "Tiếp tục giữ vững!",
    time: "Hôm qua",
  },
  {
    icon: BookOpen,
    title: "Bắt đầu khóa React Nâng cao",
    sub: "Tiến độ 12%",
    time: "2 ngày trước",
  },
  {
    icon: Sparkles,
    title: "Lên cấp 12 — Học giả",
    sub: "+1 cấp độ",
    time: "3 ngày trước",
  },
];

const courses = [
  { code: "SWP391", name: "Lập trình Web", progress: 78, color: "#FF6B35" },
  { code: "DBI202", name: "Cơ sở dữ liệu", progress: 62, color: "#0A1628" },
  { code: "PRU212", name: "Thiết kế UI/UX", progress: 45, color: "#FF6B35" },
  { code: "SSL101c", name: "Kỹ năng mềm", progress: 90, color: "#0A1628" },
];

export default function Overview() {
  const { profile, loading } = useStudentProfile();
  return (
    <>
        {/* Greeting Banner */}
        <div
          className="border-[4px] border-black mb-8 relative overflow-hidden"
          style={{ backgroundColor: "#FF6B35", boxShadow: SHADOW }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-0">
            {/* Greeting (compact, left) */}
            <div className="px-8 py-6 flex flex-col justify-center">
              <p
                className="font-sans text-white/90 text-sm uppercase tracking-wider mb-2"
                style={{ fontWeight: 600 }}
              >
                Chủ nhật, 07/06/2026
              </p>
              <h2
                className="font-serif text-white mb-2 min-h-[2.2rem]"
                style={{ fontWeight: 700, fontSize: "1.75rem" }}
              >
                {loading && !profile ? (
                  <span className="inline-block align-middle h-7 w-64 max-w-full bg-white/30 animate-pulse" />
                ) : (
                  <>Xin chào, {profile?.fullName || "bạn"}!</>
                )}
              </h2>
              <p
                className="font-sans text-white/95"
                style={{ fontWeight: 400, fontSize: "0.9rem" }}
              >
                Hôm nay bạn có 5 bài tập cần hoàn thành và 2 khóa học đang chờ.
              </p>
            </div>

            {/* Ranking panel (right) */}
            <div
              className="relative border-l-[4px] border-black bg-[#0A1628] px-6 py-5 flex items-center gap-4 overflow-hidden"
            >
              {/* Decorative confetti sparkles */}
              <Sparkles
                size={14}
                className="absolute top-3 right-4 text-[#FF6B35] opacity-70"
              />
              <Sparkles
                size={10}
                className="absolute bottom-4 right-16 text-[#FFD166] opacity-80"
              />

              {/* Trophy cup with podium */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="relative w-20 h-20 border-[4px] border-black bg-[#FF6B35] flex items-center justify-center rotate-[-4deg]"
                  style={{ boxShadow: SHADOW_SM }}
                >
                  <Trophy
                    size={42}
                    strokeWidth={2.5}
                    className="text-white"
                    fill="white"
                  />
                  {/* Rank badge */}
                  <div
                    className="absolute -top-2 -right-2 w-8 h-8 border-[3px] border-black bg-[#FFD166] flex items-center justify-center rotate-[8deg]"
                    style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
                  >
                    <Crown
                      size={14}
                      strokeWidth={3}
                      className="text-[#0A1628]"
                      fill="#0A1628"
                    />
                  </div>
                </div>
                {/* Podium base */}
                <div
                  className="w-24 h-3 border-[3px] border-black bg-[#FFD166] -mt-1"
                  style={{ boxShadow: "0px 3px 0px 0px rgba(0,0,0,1)" }}
                ></div>
              </div>

              {/* Stats */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-sans text-[#FFD166] text-[10px] uppercase tracking-wider mb-1"
                  style={{ fontWeight: 700 }}
                >
                  ⚔ Bảng xếp hạng toàn trường
                </p>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span
                    className="font-serif text-[#FF6B35] leading-none"
                    style={{ fontWeight: 700, fontSize: "2.5rem" }}
                  >
                    #2
                  </span>
                  <span
                    className="font-sans text-white/70 text-xs"
                    style={{ fontWeight: 600 }}
                  >
                    / 8,450 SV
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <span
                    className="font-sans text-[10px] px-1.5 py-0.5 border-[2px] border-black bg-[#16A34A] text-white"
                    style={{ fontWeight: 700 }}
                  >
                    ▲ 40 bậc
                  </span>
                  <span
                    className="font-sans text-[10px] px-1.5 py-0.5 border-[2px] border-black bg-[#FFD166] text-[#0A1628]"
                    style={{ fontWeight: 700 }}
                  >
                    Á QUÂN
                  </span>
                </div>
                <div className="w-full h-2 border-[2px] border-black bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#FF6B35]" style={{ width: "97%" }}></div>
                </div>
                <p
                  className="font-sans text-white/80 text-[11px] mt-1"
                  style={{ fontWeight: 600 }}
                >
                  Còn <span className="text-[#FFD166]">180 XP</span> để lên #1 👑
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Progress */}
        {(() => {
          const currentStreak = 14;
          const milestones = [
            { day: 7, reward: "+50 XP", label: "Khởi động" },
            { day: 14, reward: "+150 XP", label: "Bền bỉ" },
            { day: 30, reward: "+500 XP", label: "Huyền thoại" },
          ];
          const maxDay = milestones[milestones.length - 1].day;
          const progressPct = Math.min((currentStreak / maxDay) * 100, 100);

          return (
            <div
              className="border-[4px] border-black bg-[#FFF8F0] mb-8"
              style={{ boxShadow: SHADOW }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 border-[3px] border-black bg-[#FF6B35] flex items-center justify-center"
                  >
                    <Flame size={22} className="text-white" />
                  </div>
                  <div>
                    <h3
                      className="font-serif text-[#0A1628] leading-tight"
                      style={{ fontWeight: 700, fontSize: "1.25rem" }}
                    >
                      Chuỗi hoạt động
                    </h3>
                    <p
                      className="font-sans text-xs text-[#0A1628]/60"
                      style={{ fontWeight: 500 }}
                    >
                      Đăng nhập mỗi ngày để tăng 1 nấc
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-baseline gap-2 border-[3px] border-black bg-[#FF6B35] px-4 py-2"
                  style={{ boxShadow: SHADOW_SM }}
                >
                  <span
                    className="font-serif text-white"
                    style={{ fontWeight: 700, fontSize: "1.5rem" }}
                  >
                    {currentStreak}
                  </span>
                  <span
                    className="font-sans text-white text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    ngày
                  </span>
                </div>
              </div>

              <div className="px-12 pt-12 pb-6">
                {/* Progress track with markers */}
                <div className="relative px-8">
                  <div className="relative h-3 border-[3px] border-black bg-white">
                    <div
                      className="h-full bg-[#FF6B35] transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    ></div>

                    {/* Flame markers */}
                    {milestones.map((m) => {
                      const pos = (m.day / maxDay) * 100;
                      const reached = currentStreak >= m.day;
                      return (
                        <div
                          key={m.day}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                          style={{ left: `${pos}%` }}
                        >
                          <div
                            className="w-14 h-14 border-[4px] border-black flex items-center justify-center transition-transform duration-150 hover:-translate-y-1"
                            style={{
                              backgroundColor: reached ? "#FF6B35" : "#FFF8F0",
                              boxShadow: SHADOW_SM,
                            }}
                          >
                            <Flame
                              size={26}
                              style={{
                                color: reached ? "#FFFFFF" : "rgba(10,22,40,0.4)",
                              }}
                              fill={reached ? "white" : "none"}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Labels row */}
                  <div className="relative mt-12 h-24">
                    {milestones.map((m) => {
                      const pos = (m.day / maxDay) * 100;
                      const reached = currentStreak >= m.day;
                      return (
                        <div
                          key={m.day}
                          className="absolute top-0 -translate-x-1/2 flex flex-col items-center w-28"
                          style={{ left: `${pos}%` }}
                        >
                          <span
                            className="font-serif text-[#0A1628]"
                            style={{ fontWeight: 700, fontSize: "1.1rem" }}
                          >
                            {m.day} ngày
                          </span>
                          <span
                            className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60"
                            style={{ fontWeight: 600 }}
                          >
                            {m.label}
                          </span>
                          <span
                            className="font-sans text-xs mt-1.5 px-2 py-0.5 border-[2px] border-black"
                            style={{
                              fontWeight: 700,
                              backgroundColor: reached ? "#0A1628" : "#FFF8F0",
                              color: reached ? "#FF6B35" : "#0A1628",
                            }}
                          >
                            {m.reward}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Motivational quote */}
                <div
                  className="mt-4 mx-2 border-[3px] border-black bg-[#0A1628] px-5 py-3 flex items-center gap-3"
                  style={{ boxShadow: SHADOW_SM }}
                >
                  <Flame size={20} className="text-[#FF6B35] flex-shrink-0" />
                  <p
                    className="font-serif text-[#FFF8F0] italic"
                    style={{ fontWeight: 500, fontSize: "1rem" }}
                  >
                    "Có công mài sắt, có ngày nên kim."
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        <QuickActions />

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            const mainText = s.accent;
            const mutedText = `${s.accent}99`;
            
            return (
              <div
                key={s.label}
                className="border-[4px] border-black p-5 transition-all duration-150 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[9px_9px_0px_0px_rgba(0,0,0,1)] cursor-default"
                style={{
                  backgroundColor: s.bg,
                  boxShadow: SHADOW,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 border-[3px] border-black flex items-center justify-center"
                    style={{ backgroundColor: s.iconBg }}
                  >
                    <Icon
                      size={22}
                      style={{
                        color: s.iconBg === "#FF6B35" ? "#FFFFFF" : "#FF6B35",
                      }}
                    />
                  </div>
                  <span
                    className="font-sans text-xs uppercase tracking-wider px-2 py-1 border-[2px] border-black"
                    style={{
                      fontWeight: 700,
                      color: mainText,
                      backgroundColor: "#FFF8F0",
                    }}
                  >
                    {s.sub.split(" ")[0]}
                  </span>
                </div>
                <p
                  className="font-serif mb-1"
                  style={{
                    fontWeight: 700,
                    fontSize: "2.25rem",
                    color: mainText,
                  }}
                >
                  {s.value}
                </p>
                <p
                  className="font-sans text-sm"
                  style={{ fontWeight: 600, color: mainText }}
                >
                  {s.label}
                </p>
                <p
                  className="font-sans text-xs mt-1"
                  style={{ fontWeight: 500, color: mutedText }}
                >
                  {s.sub}
                </p>
              </div>
            );
          })}
        </div>

        {/* Two columns: Deadlines + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Deadlines */}
          <div
            className="border-[4px] border-black bg-[#FFF8F0] flex flex-col"
            style={{ boxShadow: SHADOW, height: "440px" }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black">
              <div className="flex items-center gap-2">
                <CalendarClock size={22} className="text-[#0A1628] dark:text-[#FFF8F0]" />
                <h3
                  className="font-serif text-[#0A1628]"
                  style={{ fontWeight: 700, fontSize: "1.25rem" }}
                >
                  Deadline sắp tới
                </h3>
              </div>
              <a
                href="#"
                className="font-sans text-sm text-[#FF6B35] hover:underline"
                style={{ fontWeight: 600 }}
              >
                Xem tất cả
              </a>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {deadlines.map((d) => (
                <div
                  key={d.title}
                  className="border-[3px] border-black bg-white p-4 flex items-center justify-between transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5"
                  style={{ boxShadow: SHADOW_SM }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-sans text-[#0A1628] truncate"
                      style={{ fontWeight: 700 }}
                    >
                      {d.title}
                    </p>
                    <p
                      className="font-sans text-xs text-[#0A1628]/60 mt-0.5"
                      style={{ fontWeight: 500 }}
                    >
                      {d.course} · {d.status}
                    </p>
                  </div>
                  {(() => {
                    const m = d.due.match(/(\d+)/);
                    const num = m ? parseInt(m[1]) : 99;
                    const days = d.due.includes("tuần") ? num * 7 : num;
                    const tone =
                      d.urgent || days <= 3
                        ? { bg: "#991B1B", color: "#FFFFFF" }
                        : days <= 7
                        ? { bg: "#FF6B35", color: "#FFFFFF" }
                        : { bg: "#FCD34D", color: "#0A1628" };
                    return (
                      <span
                        className="font-sans text-xs uppercase tracking-wider px-3 py-1.5 border-[2px] border-black flex-shrink-0 ml-3"
                        style={{
                          fontWeight: 700,
                          backgroundColor: tone.bg,
                          color: tone.color,
                          boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)",
                        }}
                      >
                        {d.due}
                      </span>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div
            className="border-[4px] border-black bg-[#FFF8F0] flex flex-col"
            style={{ boxShadow: SHADOW, height: "440px" }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black">
              <div className="flex items-center gap-2">
                <Clock size={22} className="text-[#0A1628] dark:text-[#FFF8F0]" />
                <h3
                  className="font-serif text-[#0A1628]"
                  style={{ fontWeight: 700, fontSize: "1.25rem" }}
                >
                  Hoạt động gần đây
                </h3>
              </div>
              <a
                href="#"
                className="font-sans text-sm text-[#FF6B35] hover:underline"
                style={{ fontWeight: 600 }}
              >
                Xem tất cả
              </a>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activities.map((a) => {
                const Icon = a.icon;
                return (
                  <div
                    key={a.title}
                    className="border-[3px] border-black bg-white p-4 flex items-center gap-3 transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5"
                    style={{ boxShadow: SHADOW_SM }}
                  >
                    <div
                      className="w-10 h-10 border-[3px] border-black bg-[#FF6B35] flex items-center justify-center flex-shrink-0"
                    >
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-sans text-[#0A1628] truncate"
                        style={{ fontWeight: 700 }}
                      >
                        {a.title}
                      </p>
                      <p
                        className="font-sans text-xs text-[#0A1628]/60 mt-0.5"
                        style={{ fontWeight: 500 }}
                      >
                        {a.sub}
                      </p>
                    </div>
                    <span
                      className="font-sans text-xs text-[#0A1628]/60 flex-shrink-0"
                      style={{ fontWeight: 500 }}
                    >
                      {a.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Courses */}
        <div
          className="border-[4px] border-black bg-[#FFF8F0]"
          style={{ boxShadow: SHADOW }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black">
            <div className="flex items-center gap-2">
              <BookOpen size={22} className="text-[#0A1628] dark:text-[#FFF8F0]" />
              <h3
                className="font-serif text-[#0A1628]"
                style={{ fontWeight: 700, fontSize: "1.25rem" }}
              >
                Khóa học đang học
              </h3>
            </div>
            <a
              href="#"
              className="font-sans text-sm text-[#FF6B35] hover:underline"
              style={{ fontWeight: 600 }}
            >
              Xem tất cả
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
            {courses.map((c) => (
              <div
                key={c.code}
                className="border-[3px] border-black bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5"
                style={{ boxShadow: SHADOW_SM }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p
                      className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60"
                      style={{ fontWeight: 700 }}
                    >
                      {c.code}
                    </p>
                    <p
                      className="font-sans text-[#0A1628]"
                      style={{ fontWeight: 700, fontSize: "1.05rem" }}
                    >
                      {c.name}
                    </p>
                  </div>
                  <span
                    className="font-serif text-[#0A1628]"
                    style={{ fontWeight: 700, fontSize: "1.5rem" }}
                  >
                    {c.progress}%
                  </span>
                </div>
                <div className="w-full h-4 border-[2px] border-black bg-[#FFF8F0] overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${c.progress}%`,
                      backgroundColor: c.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
          
    </>
  );
}



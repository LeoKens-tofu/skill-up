'use client';
import { useState } from "react";
import {
  Pencil,
  Crown,
  Gift,
  Bell,
  Mail,
  Moon,
  Lock,
  Languages,
  Trophy,
  Flame,
  Sparkles,
  GraduationCap,
  Target,
  BookOpen,
  ChevronRight,
  Code2,
  Database,
  Palette,
  MessageCircle,
  Brain,
  Award,
} from "lucide-react";
// import removed

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

const skillsData = [
  { skill: "Lập trình", value: 92, icon: Code2 },
  { skill: "Cơ sở dữ liệu", value: 78, icon: Database },
  { skill: "Giao tiếp", value: 70, icon: MessageCircle },
  { skill: "Tư duy logic", value: 85, icon: Brain },
  { skill: "Thiết kế UI", value: 55, icon: Palette },
  { skill: "Học thuật", value: 80, icon: GraduationCap },
];

const weeklyXP = [
  { day: "T2", xp: 120, done: true },
  { day: "T3", xp: 180, done: true },
  { day: "T4", xp: 90, done: true },
  { day: "T5", xp: 220, done: true },
  { day: "T6", xp: 150, done: true },
  { day: "T7", xp: 60, done: false },
  { day: "CN", xp: 0, done: false },
];

const badges = [
  { icon: Trophy, label: "Top 1% kỳ", bg: "#FF6B35", color: "white" },
  { icon: Flame, label: "Streak 14", bg: "#FEF3C7", color: "#92400E" },
  { icon: Sparkles, label: "Học giả", bg: "#DBEAFE", color: "#1E40AF" },
  { icon: GraduationCap, label: "Tốt nghiệp K1", bg: "#FCE7F3", color: "#9F1239" },
  { icon: Target, label: "Săn deadline", bg: "#D1FAE5", color: "#065F46" },
  { icon: BookOpen, label: "Mọt sách", bg: "#E0E7FF", color: "#3730A3" },
  { icon: Award, label: "Giải nhì hackathon", bg: "#0A1628", color: "#FF6B35" },
  { icon: Crown, label: "Lớp trưởng", bg: "#FFF8F0", color: "#0A1628" },
];

export default function Profile({ isDark = false }: { isDark?: boolean }) {
  const axisColor = isDark ? "#FFF8F0" : "#0A1628";
  const [toggles, setToggles] = useState({
    notif: true,
    email: false,
    dark: true,
    twoFa: true,
    lang: false,
  });

  const weeklyTotal = weeklyXP.reduce((s, d) => s + d.xp, 0);
  const weeklyGoal = 1500;
  const weeklyPct = Math.min((weeklyTotal / weeklyGoal) * 100, 100);

  const Toggle = ({
    on,
    onChange,
  }: {
    on: boolean;
    onChange: () => void;
  }) => (
    <button
      onClick={onChange}
      className="relative w-14 h-8 border-[3px] border-black transition-colors duration-200"
      style={{
        backgroundColor: on ? "#FF6B35" : "#E5E7EB",
        boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)",
      }}
    >
      <div
        className="absolute top-0 w-[22px] h-[22px] border-[2px] border-black bg-white dark:bg-[#11203A] transition-all duration-200"
        style={{ left: on ? "24px" : "0px" }}
      ></div>
    </button>
  );

  const settings = [
    {
      key: "notif" as const,
      icon: Bell,
      title: "Thông báo đẩy",
      sub: "Nhận nhắc nhở deadline và XP mới",
    },
    {
      key: "email" as const,
      icon: Mail,
      title: "Email thông báo",
      sub: "Tổng kết tuần gửi vào email",
    },
    {
      key: "dark" as const,
      icon: Moon,
      title: "Chế độ tối",
      sub: "Giảm mỏi mắt khi học buổi đêm",
    },
    {
      key: "twoFa" as const,
      icon: Lock,
      title: "Xác thực 2 lớp",
      sub: "Bảo vệ tài khoản bằng mã OTP",
    },
    {
      key: "lang" as const,
      icon: Languages,
      title: "Giao diện tiếng Anh",
      sub: "Chuyển toàn bộ UI sang English",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Profile Banner */}
      <div
        className="relative border-[4px] border-black overflow-hidden"
        style={{ backgroundColor: "#FF6B35", boxShadow: SHADOW }}
      >
        {/* Folded corner */}
        <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none">
          <div
            className="absolute top-0 right-0 border-l-[40px] border-b-[40px]"
            style={{
              borderLeftColor: "transparent",
              borderBottomColor: "#FFF8F0",
            }}
          ></div>
          <div
            className="absolute top-0 right-0 border-l-[40px] border-b-[40px]"
            style={{
              borderLeftColor: "transparent",
              borderBottomColor: "#0A1628",
              transform: "translate(0, 0)",
              clipPath: "polygon(100% 0, 100% 100%, 80% 80%)",
            }}
          ></div>
        </div>

        <div className="px-8 py-7 flex items-center gap-6 flex-wrap">
          <div
            className="w-24 h-24 border-[4px] border-black bg-[#FFF8F0] dark:bg-[#11203A] overflow-hidden flex-shrink-0"
            style={{ boxShadow: SHADOW }}
          >
            <img
              src="/imports/image-4.png"
              alt="Trần Song Hoài Nam"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-[240px]">
            <p
              className="font-serif italic text-white/90 mb-1"
              style={{ fontWeight: 500, fontSize: "1rem" }}
            >
              "Học để khác biệt."
            </p>
            <h2
              className="font-serif text-white"
              style={{ fontWeight: 700, fontSize: "2rem" }}
            >
              Trần Song Hoài Nam
            </h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span
                className="font-sans text-xs uppercase tracking-wider px-2.5 py-1 border-[2px] border-black bg-[#FFF8F0] dark:bg-[#11203A] text-[#0A1628] dark:text-[#FFF8F0]"
                style={{ fontWeight: 700 }}
              >
                DE170123
              </span>
              <span
                className="font-sans text-xs uppercase tracking-wider px-2.5 py-1 border-[2px] border-black bg-[#0A1628] text-[#FFF8F0]"
                style={{ fontWeight: 700 }}
              >
                Đại học FPT Đà Nẵng
              </span>
              <span
                className="font-sans text-xs uppercase tracking-wider px-2.5 py-1 border-[2px] border-black bg-white dark:bg-[#11203A] text-[#0A1628] dark:text-[#FFF8F0]"
                style={{ fontWeight: 700 }}
              >
                Kỹ thuật phần mềm
              </span>
            </div>
          </div>
          <button
            className="border-[3px] border-black bg-[#FFF8F0] dark:bg-[#11203A] text-[#0A1628] dark:text-[#FFF8F0] px-4 py-2.5 flex items-center gap-2 font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1 flex-shrink-0"
            style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
          >
            <Pencil size={16} />
            Chỉnh sửa hồ sơ
          </button>
        </div>
      </div>

      {/* Ranking panel */}
      <div
        className="border-[4px] border-black"
        style={{ backgroundColor: isDark ? "#11203A" : "#FFF8F0", boxShadow: SHADOW }}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b-[3px] border-black">
          <Crown size={22} className="text-[#FF6B35]" />
          <h3
            className="font-serif"
            style={{ fontWeight: 700, fontSize: "1.25rem", color: isDark ? "#FFF8F0" : "#0A1628" }}
          >
            Bảng xếp hạng toàn trường
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 p-6 items-center">
          {/* Trophy */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              className="relative w-24 h-24 border-[4px] border-black bg-[#FF6B35] flex items-center justify-center rotate-[-4deg]"
              style={{ boxShadow: SHADOW_SM }}
            >
              <Trophy size={50} strokeWidth={2.5} className="text-white" fill="white" />
              <div
                className="absolute -top-2 -right-2 w-9 h-9 border-[3px] border-black bg-[#FFD166] flex items-center justify-center rotate-[8deg]"
                style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
              >
                <Crown size={16} strokeWidth={3} className="text-[#0A1628]" fill="#0A1628" />
              </div>
            </div>
            <div
              className="w-28 h-3 border-[3px] border-black bg-[#FFD166] -mt-1"
              style={{ boxShadow: "0px 3px 0px 0px rgba(0,0,0,1)" }}
            ></div>
          </div>

          {/* Rank info */}
          <div className="min-w-0">
            <p
              className="font-sans text-xs uppercase tracking-wider mb-1"
              style={{ fontWeight: 700, color: isDark ? "#FFD166" : "#C2410C" }}
            >
              ⚔ Hạng hiện tại
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span
                className="font-serif text-[#FF6B35] leading-none"
                style={{ fontWeight: 700, fontSize: "3rem" }}
              >
                #2
              </span>
              <span
                className="font-sans text-sm"
                style={{ fontWeight: 600, color: isDark ? "rgba(255,248,240,0.7)" : "rgba(10,22,40,0.7)" }}
              >
                / 8,450 sinh viên
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className="font-sans text-xs px-2 py-1 border-[2px] border-black bg-[#16A34A] text-white"
                style={{ fontWeight: 700 }}
              >
                ▲ 40 bậc tuần này
              </span>
              <span
                className="font-sans text-xs px-2 py-1 border-[2px] border-black bg-[#FFD166] text-[#0A1628]"
                style={{ fontWeight: 700 }}
              >
                TOP 0.02%
              </span>
              <span
                className="font-sans text-xs px-2 py-1 border-[2px] border-black bg-[#0A1628] text-[#FF6B35]"
                style={{ fontWeight: 700 }}
              >
                HẠNG VÀNG
              </span>
            </div>
            <div className="w-full h-3 border-[2px] border-black bg-white dark:bg-[#0A1628] overflow-hidden">
              <div className="h-full bg-[#FF6B35]" style={{ width: "78%" }}></div>
            </div>
            <p
              className="font-sans text-xs mt-1.5"
              style={{ fontWeight: 600, color: isDark ? "rgba(255,248,240,0.8)" : "rgba(10,22,40,0.7)" }}
            >
              Chỉ còn <span className="text-[#FF6B35]">180 XP</span> nữa để lên hạng #1! 🔥👑
            </p>
          </div>

          {/* Top 3 mini leaderboard */}
          <div
            className="border-[3px] border-black p-4 min-w-[220px]"
            style={{ backgroundColor: isDark ? "#0A1628" : "#FFFFFF", boxShadow: SHADOW_SM }}
          >
            <p
              className="font-sans text-[10px] uppercase tracking-wider mb-2"
              style={{ fontWeight: 700, color: isDark ? "rgba(255,248,240,0.6)" : "rgba(10,22,40,0.6)" }}
            >
              Top 3 toàn trường
            </p>
            {[
              { rank: 1, name: "Nguyễn Minh An", xp: "5,820", color: "#FFD166", you: false },
              { rank: 2, name: "Trần Song Hoài Nam", xp: "5,640", color: "#C0C0C0", you: true },
              { rank: 3, name: "Phạm Quốc Bảo", xp: "5,210", color: "#CD7F32", you: false },
            ].map((u) => (
              <div
                key={u.rank}
                className="flex items-center gap-2 py-1.5 px-1"
                style={{
                  backgroundColor: u.you ? (isDark ? "#3A1A10" : "#FFE4D6") : "transparent",
                  border: u.you ? "2px solid #FF6B35" : "none",
                  borderRadius: 0,
                }}
              >
                <div
                  className="w-7 h-7 border-[2px] border-black flex items-center justify-center font-serif text-sm"
                  style={{ backgroundColor: u.color, color: "#0A1628", fontWeight: 700 }}
                >
                  {u.rank}
                </div>
                <p
                  className="font-sans text-sm flex-1 truncate"
                  style={{ fontWeight: u.you ? 700 : 600, color: isDark ? "#FFF8F0" : "#0A1628" }}
                >
                  {u.you ? `${u.name} (Bạn)` : u.name}
                </p>
                <span
                  className="font-sans text-xs"
                  style={{ fontWeight: 700, color: "#FF6B35" }}
                >
                  {u.xp}
                </span>
              </div>
            ))}
            <div
              className="border-t-[2px] border-dashed border-black mt-2 pt-2 font-sans text-xs text-center"
              style={{ fontWeight: 700, color: "#FF6B35" }}
            >
              🎉 Chúc mừng! Bạn đang á quân toàn trường
            </div>
          </div>
        </div>
      </div>

      {/* Skills: Radar + Progress bars */}
      <div
        className="border-[4px] border-black bg-[#FFF8F0] dark:bg-[#11203A]"
        style={{ boxShadow: SHADOW }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black">
          <div className="flex items-center gap-2">
            <Brain size={22} className="text-[#0A1628] dark:text-[#FFF8F0]" />
            <h3
              className="font-serif text-[#0A1628] dark:text-[#FFF8F0]"
              style={{ fontWeight: 700, fontSize: "1.25rem" }}
            >
              Năng lực học tập
            </h3>
          </div>
          <span
            className="font-sans text-xs uppercase tracking-wider px-3 py-1.5 border-[2px] border-black bg-[#0A1628] text-[#FF6B35]"
            style={{ fontWeight: 700 }}
          >
            Top 3%
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Radar */}
          <div
            className="border-[3px] border-black bg-white dark:bg-[#11203A] p-4 flex items-center justify-center"
            style={{ boxShadow: SHADOW_SM, minHeight: "340px" }}
          >
            {(() => {
              const size = 320;
              const cx = size / 2;
              const cy = size / 2;
              const radius = 110;
              const n = skillsData.length;
              const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
              const point = (i: number, r: number) => {
                const a = angleFor(i);
                return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
              };
              const rings = [0.25, 0.5, 0.75, 1];
              const polygon = skillsData
                .map((s, i) => {
                  const [x, y] = point(i, radius * (s.value / 100));
                  return `${x},${y}`;
                })
                .join(" ");
              return (
                <svg width={size} height={size}>
                  {rings.map((r) => (
                    <circle
                      key={r}
                      cx={cx}
                      cy={cy}
                      r={radius * r}
                      fill="none"
                      stroke={axisColor}
                      strokeWidth={1.5}
                    />
                  ))}
                  {skillsData.map((_, i) => {
                    const [x, y] = point(i, radius);
                    return (
                      <line
                        key={`spoke-${i}`}
                        x1={cx}
                        y1={cy}
                        x2={x}
                        y2={y}
                        stroke={axisColor}
                        strokeWidth={1}
                        opacity={0.4}
                      />
                    );
                  })}
                  <polygon
                    points={polygon}
                    fill="#FF6B35"
                    fillOpacity={0.6}
                    stroke="#0A1628"
                    strokeWidth={3}
                  />
                  {skillsData.map((s, i) => {
                    const [x, y] = point(i, radius + 22);
                    return (
                      <text
                        key={`label-${s.skill}`}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={axisColor}
                        fontSize={12}
                        fontWeight={600}
                      >
                        {s.skill}
                      </text>
                    );
                  })}
                </svg>
              );
            })()}
          </div>

          {/* Progress bars */}
          <div className="space-y-4">
            {skillsData.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.skill}
                  className="border-[3px] border-black bg-white dark:bg-[#11203A] p-3"
                  style={{ boxShadow: SHADOW_SM }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 border-[2px] border-black bg-[#FFF8F0] dark:bg-[#11203A] flex items-center justify-center">
                        <Icon size={14} className="text-[#0A1628] dark:text-[#FFF8F0]" />
                      </div>
                      <span
                        className="font-sans text-sm text-[#0A1628] dark:text-[#FFF8F0]"
                        style={{ fontWeight: 600 }}
                      >
                        {s.skill}
                      </span>
                    </div>
                    <span
                      className="font-serif text-[#0A1628] dark:text-[#FFF8F0]"
                      style={{ fontWeight: 700, fontSize: "1rem" }}
                    >
                      {s.value}%
                    </span>
                  </div>
                  <div className="w-full h-3 border-[2px] border-black bg-[#FFF8F0] dark:bg-[#11203A]">
                    <div
                      className="h-full bg-[#FF6B35] transition-all duration-500"
                      style={{ width: `${s.value}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly XP Goal + Dark certificate card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly XP */}
        <div
          className="lg:col-span-2 border-[4px] border-black bg-[#FFF8F0] dark:bg-[#11203A]"
          style={{ boxShadow: SHADOW }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black">
            <div className="flex items-center gap-2">
              <Target size={22} className="text-[#0A1628] dark:text-[#FFF8F0]" />
              <h3
                className="font-serif text-[#0A1628] dark:text-[#FFF8F0]"
                style={{ fontWeight: 700, fontSize: "1.25rem" }}
              >
                Mục tiêu XP tuần này
              </h3>
            </div>
            <button
              className="flex items-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-3 py-1.5 font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
              style={{ boxShadow: SHADOW_SM, fontWeight: 700, fontSize: "0.85rem" }}
            >
              <Gift size={16} />
              Nhận quà cấp độ
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span
                  className="font-serif text-[#0A1628] dark:text-[#FFF8F0]"
                  style={{ fontWeight: 700, fontSize: "2rem" }}
                >
                  {weeklyTotal.toLocaleString()}
                </span>
                <span
                  className="font-sans text-[#0A1628]/60 dark:text-[#FFF8F0]/60 ml-2"
                  style={{ fontWeight: 500 }}
                >
                  / {weeklyGoal.toLocaleString()} XP
                </span>
              </div>
              <span
                className="font-serif text-[#FF6B35]"
                style={{ fontWeight: 700, fontSize: "1.5rem" }}
              >
                {Math.round(weeklyPct)}%
              </span>
            </div>
            <div className="w-full h-4 border-[3px] border-black bg-white dark:bg-[#11203A] mb-6">
              <div
                className="h-full bg-[#FF6B35] transition-all duration-500"
                style={{ width: `${weeklyPct}%` }}
              ></div>
            </div>

            {/* Daily bars */}
            <div className="grid grid-cols-7 gap-2">
              {weeklyXP.map((d) => {
                const maxXp = 250;
                const h = Math.max((d.xp / maxXp) * 100, 6);
                return (
                  <div key={d.day} className="flex flex-col items-center gap-1.5">
                    <div className="relative w-full h-24 border-[2px] border-black bg-white dark:bg-[#11203A] flex items-end">
                      <div
                        className="w-full transition-all duration-500"
                        style={{
                          height: `${h}%`,
                          backgroundColor: d.done ? "#FF6B35" : "#FEE2C9",
                        }}
                      ></div>
                    </div>
                    <span
                      className="font-sans text-xs text-[#0A1628] dark:text-[#FFF8F0]"
                      style={{ fontWeight: 700 }}
                    >
                      {d.day}
                    </span>
                    <span
                      className="font-sans text-[10px] text-[#0A1628]/60 dark:text-[#FFF8F0]/60"
                      style={{ fontWeight: 500 }}
                    >
                      {d.xp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Certificate Dark Card */}
        <div
          className="relative border-[4px] border-black overflow-hidden"
          style={{ backgroundColor: "#0A1628", boxShadow: SHADOW }}
        >
          {/* Orange glow */}
          <div
            className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,107,53,0.55) 0%, rgba(255,107,53,0) 70%)",
            }}
          ></div>
          <div
            className="absolute -bottom-20 -left-12 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,107,53,0.3) 0%, rgba(255,107,53,0) 70%)",
            }}
          ></div>

          <div className="relative p-6 flex flex-col h-full">
            <div
              className="inline-flex self-start px-2.5 py-1 border-[2px] border-[#FF6B35] mb-4"
              style={{ backgroundColor: "rgba(255,107,53,0.15)" }}
            >
              <span
                className="font-sans text-[10px] uppercase tracking-wider text-[#FF6B35]"
                style={{ fontWeight: 700 }}
              >
                Chứng chỉ đang theo
              </span>
            </div>

            <h3
              className="font-serif text-white leading-tight mb-2"
              style={{ fontWeight: 700, fontSize: "1.4rem" }}
            >
              Full-Stack React Developer
            </h3>
            <p
              className="font-sans text-white/70 text-sm mb-5"
              style={{ fontWeight: 400 }}
            >
              Hoàn thành 24/30 modules để nhận chứng chỉ chính thức từ FPT
              Education.
            </p>

            <div className="mb-2 flex items-baseline justify-between">
              <span
                className="font-sans text-xs uppercase tracking-wider text-white/60"
                style={{ fontWeight: 600 }}
              >
                Tiến độ
              </span>
              <span
                className="font-serif text-[#FF6B35]"
                style={{ fontWeight: 700, fontSize: "1.5rem" }}
              >
                80%
              </span>
            </div>
            <div className="w-full h-3 border-[2px] border-[#FF6B35]/40 bg-white/5 mb-6">
              <div
                className="h-full bg-[#FF6B35]"
                style={{ width: "80%" }}
              ></div>
            </div>

            <button
              className="mt-auto w-full border-[3px] border-[#FF6B35] bg-[#FF6B35] text-white px-4 py-3 flex items-center justify-center gap-2 font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
              style={{
                boxShadow: "5px 5px 0px 0px rgba(255,107,53,0.6)",
                fontWeight: 700,
              }}
            >
              Tiếp tục khóa học
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Badges + Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badges */}
        <div
          className="border-[4px] border-black bg-[#FFF8F0] dark:bg-[#11203A]"
          style={{ boxShadow: SHADOW }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black">
            <div className="flex items-center gap-2">
              <Award size={22} className="text-[#0A1628] dark:text-[#FFF8F0]" />
              <h3
                className="font-serif text-[#0A1628] dark:text-[#FFF8F0]"
                style={{ fontWeight: 700, fontSize: "1.25rem" }}
              >
                Bộ sưu tập huy hiệu
              </h3>
            </div>
            <span
              className="font-sans text-xs text-[#0A1628]/60 dark:text-[#FFF8F0]/60"
              style={{ fontWeight: 600 }}
            >
              {badges.length} / 24
            </span>
          </div>
          <div className="p-5 grid grid-cols-4 gap-3">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.label}
                  className="border-[3px] border-black p-3 flex flex-col items-center text-center gap-1.5 transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 cursor-default"
                  style={{ backgroundColor: b.bg, boxShadow: SHADOW_SM }}
                >
                  <Icon size={28} style={{ color: b.color }} />
                  <span
                    className="font-sans text-[11px] leading-tight"
                    style={{ fontWeight: 700, color: b.color }}
                  >
                    {b.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings */}
        <div
          className="border-[4px] border-black bg-[#FFF8F0] dark:bg-[#11203A]"
          style={{ boxShadow: SHADOW }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black">
            <div className="flex items-center gap-2">
              <Lock size={22} className="text-[#0A1628] dark:text-[#FFF8F0]" />
              <h3
                className="font-serif text-[#0A1628] dark:text-[#FFF8F0]"
                style={{ fontWeight: 700, fontSize: "1.25rem" }}
              >
                Cài đặt tài khoản
              </h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {settings.map((s) => {
              const Icon = s.icon;
              const on = toggles[s.key];
              return (
                <div
                  key={s.key}
                  className="border-[3px] border-black bg-white dark:bg-[#11203A] p-3 flex items-center gap-3"
                  style={{ boxShadow: SHADOW_SM }}
                >
                  <div
                    className="w-10 h-10 border-[3px] border-black flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: on ? "#FF6B35" : "#FFF8F0" }}
                  >
                    <Icon
                      size={18}
                      style={{ color: on ? "white" : "#0A1628" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-sans text-sm text-[#0A1628] dark:text-[#FFF8F0] leading-tight"
                      style={{ fontWeight: 700 }}
                    >
                      {s.title}
                    </p>
                    <p
                      className="font-sans text-xs text-[#0A1628]/60 dark:text-[#FFF8F0]/60 mt-0.5 leading-tight"
                      style={{ fontWeight: 500 }}
                    >
                      {s.sub}
                    </p>
                  </div>
                  <Toggle
                    on={on}
                    onChange={() =>
                      setToggles((t) => ({ ...t, [s.key]: !t[s.key] }))
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}



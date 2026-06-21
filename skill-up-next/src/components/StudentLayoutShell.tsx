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
import { Sidebar } from "./Sidebar";


type HomeProps = {
  onLogout: () => void;
};

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

export default function StudentLayoutShell({ children, onLogout }: { children: React.ReactNode; onLogout?: () => void }) {
  const [active, setActive] = useState<
    "overview" | "courses" | "deadlines" | "profile" | "settings" | "leaderboard" | "calendar" | "groups" | "shop"
  >("overview");
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, icon: "deadline", title: "Deadline sắp tới: Bài tập lớn SWP391", time: "2 giờ nữa", unread: true },
    { id: 2, icon: "xp", title: "Bạn vừa nhận được +50 XP từ Quiz Chương 3", time: "1 giờ trước", unread: true },
    { id: 3, icon: "rank", title: "Bạn đã lên hạng #2 toàn trường! 🎉", time: "3 giờ trước", unread: true },
    { id: 4, icon: "course", title: "Khóa học mới: React Server Components đã mở", time: "Hôm qua", unread: false },
    { id: 5, icon: "badge", title: "Đạt huy hiệu Streak 14 ngày", time: "2 ngày trước", unread: false },
  ]);
  const unreadCount = notifications.filter((n) => n.unread).length;
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    {
      role: "ai",
      text: "Xin chào Hoài Nam! Tôi là trợ lý AI của Skill Up. Bạn cần giúp gì hôm nay — ôn tập, gợi ý khóa học, hay nhắc deadline?",
    },
  ]);
  const sendChat = () => {
    const t = chatInput.trim();
    if (!t) return;
    setChatMessages((m) => [
      ...m,
      { role: "user", text: t },
      {
        role: "ai",
        text: "Mình đã ghi nhận yêu cầu. Tính năng AI đầy đủ sẽ sớm cập nhật — hãy giữ chuỗi học hằng ngày nhé!",
      },
    ]);
    setChatInput("");
  };

  const navItems = [
    { id: "overview" as const, label: "Tổng quan", icon: LayoutDashboard },
    { id: "courses" as const, label: "Khóa học", icon: BookOpen },
    { id: "calendar" as const, label: "Lịch học", icon: CalendarDays },
    { id: "deadlines" as const, label: "Deadline", icon: CalendarClock },
    { id: "groups" as const, label: "Nhóm học tập", icon: Users },
    { id: "leaderboard" as const, label: "Bảng xếp hạng", icon: Trophy },
    { id: "shop" as const, label: "Cửa hàng XP", icon: ShoppingBag },
    { id: "profile" as const, label: "Hồ sơ", icon: UserCircle2 },
    { id: "settings" as const, label: "Cài đặt", icon: Settings },
  ];

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

  return (
    <div className={isDark ? "dark" : ""}>
    <div
      className="min-h-screen flex bg-[#FFF8F0] dark:bg-[#0A1628] transition-colors duration-300"
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex-1 min-w-0 px-10 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p
              className="font-sans text-sm uppercase tracking-wider text-[#0A1628]/60 dark:text-[#FFF8F0]/60"
              style={{ fontWeight: 600 }}
            >
              {navItems.find((n) => n.id === active)?.label}
            </p>
            <h1
              className="font-serif text-[#0A1628] dark:text-[#FFF8F0]"
              style={{ fontWeight: 700, fontSize: "2.25rem" }}
            >
              {active === "overview"
                ? "Bảng điều khiển"
                : active === "courses"
                ? selectedCourse ? selectedCourse.title : "Khóa học"
                : active === "deadlines"
                ? "Deadline"
                : active === "profile"
                ? "Hồ sơ"
                : active === "leaderboard"
                ? "Bảng xếp hạng"
                : active === "calendar"
                ? "Lịch học"
                : active === "groups"
                ? "Nhóm học tập"
                : active === "shop"
                ? "Cửa hàng XP"
                : "Cài đặt"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDark((v) => !v)}
              className="border-[3px] border-black bg-[#FFF8F0] dark:bg-[#11203A] dark:bg-[#11203A] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
              style={{ boxShadow: SHADOW_SM }}
            >
              {isDark ? (
                <Sun size={20} className="text-[#FF6B35]" />
              ) : (
                <Moon size={20} className="text-[#0A1628] dark:text-[#FFF8F0]" />
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="group relative border-[3px] border-black bg-[#FFF8F0] dark:bg-[#11203A] dark:bg-[#11203A] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-[#FF6B35] dark:hover:bg-[#FF6B35] active:translate-x-1 active:translate-y-1"
                style={{ boxShadow: SHADOW_SM }}
              >
                <Bell
                  size={20}
                  className="text-[#0A1628] dark:text-[#FFF8F0] dark:text-[#FFF8F0] transition-colors duration-200 group-hover:text-white group-hover:rotate-12 group-hover:scale-110"
                  style={{ transition: "color 200ms, transform 200ms" }}
                />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 border-[2px] border-black bg-[#991B1B] text-white font-sans text-[10px] flex items-center justify-center"
                    style={{ fontWeight: 700 }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifOpen(false)}
                  ></div>
                  <div
                    className="absolute right-0 mt-3 w-[380px] max-w-[calc(100vw-2rem)] z-50 border-[4px] border-black bg-[#FFF8F0] dark:bg-[#11203A]"
                    style={{ boxShadow: SHADOW }}
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b-[3px] border-black bg-[#FF6B35]">
                      <div className="flex items-center gap-2">
                        <Bell size={18} className="text-white" />
                        <p
                          className="font-serif text-white"
                          style={{ fontWeight: 700, fontSize: "1rem" }}
                        >
                          Thông báo
                        </p>
                        {unreadCount > 0 && (
                          <span
                            className="font-sans text-[10px] px-1.5 py-0.5 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628]"
                            style={{ fontWeight: 700 }}
                          >
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          setNotifications((ns) => ns.map((n) => ({ ...n, unread: false })))
                        }
                        className="font-sans text-[10px] uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628]"
                        style={{ fontWeight: 700, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
                      >
                        Đánh dấu đã đọc
                      </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
                      {notifications.length === 0 ? (
                        <p
                          className="font-sans text-sm text-center py-6 text-[#0A1628]/60 dark:text-[#FFF8F0]/60"
                          style={{ fontWeight: 500 }}
                        >
                          Không có thông báo nào
                        </p>
                      ) : (
                        notifications.map((n) => {
                          const tone =
                            n.icon === "deadline"
                              ? { bg: "#991B1B", icon: "⏰" }
                              : n.icon === "xp"
                              ? { bg: "#FF6B35", icon: "✨" }
                              : n.icon === "rank"
                              ? { bg: "#FFD166", icon: "👑" }
                              : n.icon === "course"
                              ? { bg: "#0A1628", icon: "📚" }
                              : { bg: "#16A34A", icon: "🔥" };
                          return (
                            <div
                              key={n.id}
                              className="border-[3px] border-black p-3 flex items-start gap-3 transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 cursor-pointer"
                              style={{
                                backgroundColor: n.unread
                                  ? isDark
                                    ? "#3A1A10"
                                    : "#FFE4D6"
                                  : isDark
                                  ? "#0A1628"
                                  : "#FFFFFF",
                                boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)",
                              }}
                              onClick={() =>
                                setNotifications((ns) =>
                                  ns.map((x) => (x.id === n.id ? { ...x, unread: false } : x))
                                )
                              }
                            >
                              <div
                                className="w-9 h-9 border-[2px] border-black flex items-center justify-center text-base flex-shrink-0"
                                style={{ backgroundColor: tone.bg }}
                              >
                                <span>{tone.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="font-sans text-sm text-[#0A1628] dark:text-[#FFF8F0]"
                                  style={{ fontWeight: n.unread ? 700 : 500 }}
                                >
                                  {n.title}
                                </p>
                                <p
                                  className="font-sans text-xs text-[#0A1628]/60 dark:text-[#FFF8F0]/60 mt-0.5"
                                  style={{ fontWeight: 500 }}
                                >
                                  {n.time}
                                </p>
                              </div>
                              {n.unread && (
                                <span className="w-2.5 h-2.5 bg-[#FF6B35] border-[1.5px] border-black flex-shrink-0 mt-1"></span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="border-t-[3px] border-black p-3 text-center">
                      <a
                        href="#"
                        className="font-sans text-sm text-[#FF6B35] hover:underline"
                        style={{ fontWeight: 700 }}
                      >
                        Xem tất cả thông báo →
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
            {(() => {
              const currentXP = 2450;
              const currentLevelXP = 2000;
              const nextLevelXP = 3000;
              const levelPct = Math.round(
                ((currentXP - currentLevelXP) /
                  (nextLevelXP - currentLevelXP)) *
                  100
              );
              return (
                <div
                  className="flex items-center gap-3 border-[3px] border-black bg-[#FFF8F0] dark:bg-[#11203A] pl-3 pr-4 py-2"
                  style={{ boxShadow: SHADOW_SM }}
                >
                  <div className="w-11 h-11 border-[3px] border-black overflow-hidden bg-[#FFF8F0] dark:bg-[#11203A]">
                    <img
                      src="/imports/image-4.png"
                      alt="Trần Song Hoài Nam"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <div className="flex items-baseline gap-2">
                      <p
                        className="font-sans text-sm text-[#0A1628] dark:text-[#FFF8F0] leading-tight"
                        style={{ fontWeight: 700 }}
                      >
                        Trần Song Hoài Nam
                      </p>
                      <span
                        className="font-sans text-[10px] uppercase tracking-wider px-1.5 py-0.5 border-[1.5px] border-black bg-[#FF6B35] text-white"
                        style={{ fontWeight: 700 }}
                      >
                        Lv.12
                      </span>
                    </div>
                    <p
                      className="font-sans text-xs text-[#0A1628]/60 dark:text-[#FFF8F0]/60 leading-tight"
                      style={{ fontWeight: 500 }}
                    >
                      DE170001 · Học giả
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="w-32 h-2 border-[1.5px] border-black bg-white dark:bg-[#11203A] overflow-hidden">
                        <div
                          className="h-full bg-[#FF6B35] transition-all duration-500"
                          style={{ width: `${levelPct}%` }}
                        ></div>
                      </div>
                      <span
                        className="font-sans text-[10px] text-[#0A1628]/70 dark:text-[#FFF8F0]/70 whitespace-nowrap"
                        style={{ fontWeight: 600 }}
                      >
                        {currentXP}/{nextLevelXP} XP
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {children}
      </main>

      {/* Floating AI Assistant */}
      <>
        {/* Chat panel */}
        {chatOpen && (
          <div
            className="fixed bottom-28 right-8 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-10rem)] border-[4px] border-black bg-[#FFF8F0] dark:bg-[#11203A] flex flex-col"
            style={{ boxShadow: SHADOW }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b-[3px] border-black bg-[#FF6B35]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 border-[3px] border-black bg-[#FFF8F0] flex items-center justify-center">
                  <Bot size={20} className="text-[#FF6B35]" />
                </div>
                <div>
                  <p
                    className="font-serif text-white leading-tight"
                    style={{ fontWeight: 700, fontSize: "1rem" }}
                  >
                    Trợ lý AI
                  </p>
                  <p
                    className="font-sans text-white/90 text-[10px] uppercase tracking-wider flex items-center gap-1"
                    style={{ fontWeight: 700 }}
                  >
                    <span className="w-1.5 h-1.5 bg-[#16A34A] border border-black inline-block"></span>
                    Đang hoạt động
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="w-8 h-8 border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] flex items-center justify-center hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)", fontWeight: 700 }}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[80%] border-[3px] border-black px-3 py-2 font-sans text-sm"
                    style={{
                      backgroundColor: m.role === "user" ? "#FF6B35" : "#FFFFFF",
                      color: m.role === "user" ? "#FFFFFF" : "#0A1628",
                      boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)",
                      fontWeight: 500,
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t-[3px] border-black p-3 flex items-center gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendChat();
                }}
                placeholder="Hỏi mình bất cứ điều gì..."
                className="flex-1 border-[3px] border-black bg-white dark:bg-[#0A1628] text-[#0A1628] dark:text-[#FFF8F0] px-3 py-2.5 font-sans text-sm outline-none focus:ring-0"
                style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)", fontWeight: 500 }}
              />
              <button
                onClick={sendChat}
                className="border-[3px] border-black bg-[#FF6B35] text-white px-4 py-2.5 font-sans text-sm hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1 transition-transform"
                style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)", fontWeight: 700 }}
              >
                Gửi
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setChatOpen((v) => !v)}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 border-[4px] border-black bg-[#FF6B35] text-white px-5 py-3.5 transition-all duration-150 hover:-translate-y-1 hover:-translate-x-1 active:translate-x-1 active:translate-y-1"
          style={{ boxShadow: SHADOW, fontWeight: 700 }}
        >
          <Bot size={22} />
          <span className="font-sans">{chatOpen ? "Đóng chat" : "Trợ lý AI"}</span>
        </button>
      </>
    </div>
    </div>
  );
}



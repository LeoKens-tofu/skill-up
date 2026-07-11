'use client';
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import HeaderBar, { NotificationItem } from "./HeaderBar";
import { StudentProfileProvider, useStudentProfile } from "@/context/StudentProfileContext";


type HomeProps = {
  onLogout: () => void;
};

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

const NAV_ITEMS = [
  { id: "/student/dashboard", label: "Tổng quan" },
  { id: "/student/course", label: "Khóa học" },
  { id: "/student/quizzes", label: "Câu hỏi kỹ năng" },
  { id: "/student/time-table", label: "Lịch học" },
  { id: "/student/deadline", label: "Deadline" },
  { id: "/student/groups", label: "Nhóm học tập" },
  { id: "/student/leaderboard", label: "Bảng xếp hạng" },
  { id: "/student/shop", label: "Cửa hàng XP" },
  { id: "/student/profile", label: "Hồ sơ" },
  { id: "/student/settings", label: "Cài đặt" },
];

export default function StudentLayoutShell({ children, onLogout }: { children: React.ReactNode; onLogout?: () => void }) {
  return (
    <StudentProfileProvider>
      <ShellInner onLogout={onLogout}>{children}</ShellInner>
    </StudentProfileProvider>
  );
}

function ShellInner({ children }: { children: React.ReactNode; onLogout?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading } = useStudentProfile();

  const handleLogout = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.code === "success") {
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [chatOpen, setChatOpen] = useState(false);
  const studentNotifications: NotificationItem[] = [
    { id: 1, icon: "deadline", title: "Deadline sắp tới: Bài tập lớn SWP391", time: "2 giờ nữa", unread: true },
    { id: 2, icon: "xp", title: "Bạn vừa nhận được +50 XP từ Quiz Chương 3", time: "1 giờ trước", unread: true },
    { id: 3, icon: "rank", title: "Bạn đã lên hạng #2 toàn trường! 🎉", time: "3 giờ trước", unread: true },
    { id: 4, icon: "course", title: "Khóa học mới: React Server Components đã mở", time: "Hôm qua", unread: false },
    { id: 5, icon: "badge", title: "Đạt huy hiệu Streak 14 ngày", time: "2 ngày trước", unread: false },
  ];
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    {
      role: "ai",
      text: "Xin chào! Tôi là trợ lý AI của Skill Up. Bạn cần giúp gì hôm nay — ôn tập, gợi ý khóa học, hay nhắc deadline?",
    },
  ]);

  // Cá nhân hóa lời chào AI khi có hồ sơ (chỉ thay lời chào mặc định)
  useEffect(() => {
    const name = profile?.fullName?.trim().split(/\s+/).slice(-1)[0];
    if (!name) return;
    setChatMessages((prev) => {
      if (!prev[0] || prev[0].role !== "ai" || !prev[0].text.startsWith("Xin chào")) return prev;
      const copy = [...prev];
      copy[0] = { ...copy[0], text: `Xin chào ${name}! Tôi là trợ lý AI của Skill Up. Bạn cần giúp gì hôm nay — ôn tập, gợi ý khóa học, hay nhắc deadline?` };
      return copy;
    });
  }, [profile]);
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


  return (
    <div
      className="min-h-screen flex bg-[#FFF8F0] transition-colors duration-300"
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex-1 min-w-0 px-10 py-8">
        {/* Top bar */}
        <HeaderBar
          role="student"
          areaLabel="Khu vực học viên"
          sectionTitle={NAV_ITEMS.find((n) => pathname.startsWith(n.id))?.label || "Bảng điều khiển"}
          profile={profile}
          loading={loading}
          onLogout={handleLogout}
          initialNotifications={studentNotifications}
        />

        {children}
      </main>

      {/* Floating AI Assistant */}
      <>
        {/* Chat panel */}
        {chatOpen && (
          <div
            className="fixed bottom-28 right-8 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-10rem)] border-[4px] border-black bg-[#FFF8F0] flex flex-col"
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
                className="flex-1 border-[3px] border-black bg-white text-[#0A1628] px-3 py-2.5 font-sans text-sm outline-none focus:ring-0"
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
  );
}



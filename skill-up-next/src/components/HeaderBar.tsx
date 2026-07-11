'use client';
import { useState } from "react";
import { Bell, LogOut } from "lucide-react";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

export type NotificationItem = {
  id: number;
  icon: string;
  title: string;
  time: string;
  unread: boolean;
};

// Mỗi cấp hiển thị mốc 1000 XP (chỉ để vẽ thanh tiến độ — số XP hiển thị là tổng thật)
const XP_PER_LEVEL = 1000;

const notifTone = (icon: string): { bg: string; emoji: string } => {
  switch (icon) {
    case "deadline": return { bg: "#991B1B", emoji: "⏰" };
    case "xp": return { bg: "#FF6B35", emoji: "✨" };
    case "rank": return { bg: "#FFD166", emoji: "👑" };
    case "course": return { bg: "#0A1628", emoji: "📚" };
    case "badge": return { bg: "#16A34A", emoji: "🔥" };
    case "submit": return { bg: "#16A34A", emoji: "📥" };
    case "quiz": return { bg: "#7C3AED", emoji: "📝" };
    default: return { bg: "#16A34A", emoji: "🔔" };
  }
};

function ProfileChipSkeleton({ student }: { student: boolean }) {
  return (
    <div className="text-left animate-pulse">
      <div className="h-3.5 w-28 bg-[#0A1628]/15 mb-1.5" />
      <div className="h-2.5 w-20 bg-[#0A1628]/10" />
      {student && <div className="h-2 w-32 bg-[#0A1628]/10 mt-2" />}
    </div>
  );
}

export default function HeaderBar({
  role,
  areaLabel,
  sectionTitle,
  profile,
  loading = false,
  onLogout,
  initialNotifications = [],
}: {
  role: "student" | "teacher";
  areaLabel: string;
  sectionTitle: string;
  profile: any;
  loading?: boolean;
  onLogout: () => void;
  initialNotifications?: NotificationItem[];
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const accent = role === "teacher" ? "#FF6B35" : "#FF6B35";
  const isLoading = loading && !profile; // đang tải hồ sơ lần đầu → hiện skeleton
  const displayName = profile?.fullName || (role === "teacher" ? "Giảng viên" : "Học viên");
  const avatarSrc = profile?.avatar || "/imports/image-4.png";

  // Dữ liệu XP/level thật (chỉ dùng cho student)
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const xpInto = xp % XP_PER_LEVEL;
  const levelPct = Math.min(100, Math.round((xpInto / XP_PER_LEVEL) * 100));
  const roleTitle = profile?.title || (role === "teacher" ? "Giảng viên" : "Học viên");

  return (
    <div
      className="sticky top-0 z-30 -mt-8 -mx-10 px-10 pt-6 pb-4 mb-8 bg-[#FFF8F0] border-b-[4px] border-black flex items-center justify-between gap-4"
    >
      {/* Left: context */}
      <div className="min-w-0">
        <p className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#0A1628]/50" style={{ fontWeight: 700 }}>
          {areaLabel}
        </p>
        <h1 className="font-serif text-[#0A1628] truncate" style={{ fontWeight: 800, fontSize: "1.6rem", lineHeight: 1.1 }}>
          {sectionTitle}
        </h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="group relative border-[3px] border-black bg-[#FFF8F0] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-[#FF6B35] active:translate-x-1 active:translate-y-1"
            style={{ boxShadow: SHADOW_SM }}
            aria-label="Thông báo"
          >
            <Bell size={20} className="text-[#0A1628] transition-all duration-200 group-hover:text-white group-hover:rotate-12 group-hover:scale-110" />
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
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-3 w-[380px] max-w-[calc(100vw-2rem)] z-50 border-[4px] border-black bg-[#FFF8F0]" style={{ boxShadow: SHADOW }}>
                <div className="flex items-center justify-between px-4 py-3 border-b-[3px] border-black bg-[#FF6B35]">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-white" />
                    <p className="font-serif text-white" style={{ fontWeight: 700, fontSize: "1rem" }}>Thông báo</p>
                    {unreadCount > 0 && (
                      <span className="font-sans text-[10px] px-1.5 py-0.5 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628]" style={{ fontWeight: 700 }}>
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setNotifications((ns) => ns.map((n) => ({ ...n, unread: false })))}
                      className="font-sans text-[10px] uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628]"
                      style={{ fontWeight: 700, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
                  {notifications.length === 0 ? (
                    <p className="font-sans text-sm text-center py-6 text-[#0A1628]/60" style={{ fontWeight: 500 }}>
                      Không có thông báo nào
                    </p>
                  ) : (
                    notifications.map((n) => {
                      const tone = notifTone(n.icon);
                      return (
                        <div
                          key={n.id}
                          className="border-[3px] border-black p-3 flex items-start gap-3 transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 cursor-pointer"
                          style={{ backgroundColor: n.unread ? "#FFE4D6" : "#FFFFFF", boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}
                          onClick={() => setNotifications((ns) => ns.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))}
                        >
                          <div className="w-9 h-9 border-[2px] border-black flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: tone.bg }}>
                            <span>{tone.emoji}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-sm text-[#0A1628]" style={{ fontWeight: n.unread ? 700 : 500 }}>{n.title}</p>
                            <p className="font-sans text-xs text-[#0A1628]/60 mt-0.5" style={{ fontWeight: 500 }}>{n.time}</p>
                          </div>
                          {n.unread && <span className="w-2.5 h-2.5 bg-[#FF6B35] border-[1.5px] border-black flex-shrink-0 mt-1" />}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t-[3px] border-black p-3 text-center">
                  <span className="font-sans text-sm text-[#0A1628]/40" style={{ fontWeight: 600 }}>
                    Bảng thông báo mẫu
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile chip */}
        <div className="flex items-center gap-3 border-[3px] border-black bg-[#FFF8F0] pl-2 pr-4 py-2" style={{ boxShadow: SHADOW_SM }}>
          <div
            className="w-11 h-11 border-[3px] border-black overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: isLoading ? "#E5E1DA" : "#FF6B35" }}
          >
            {isLoading ? (
              <span className="w-full h-full bg-[#0A1628]/10 animate-pulse" />
            ) : (
              <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
            )}
          </div>

          {isLoading ? (
            <ProfileChipSkeleton student={role === "student"} />
          ) : role === "student" ? (
            <div className="text-left">
              <div className="flex items-baseline gap-2">
                <p className="font-sans text-sm text-[#0A1628] leading-tight" style={{ fontWeight: 700 }}>{displayName}</p>
                <span className="font-sans text-[10px] uppercase tracking-wider px-1.5 py-0.5 border-[1.5px] border-black bg-[#FF6B35] text-white" style={{ fontWeight: 700 }}>
                  Lv.{level}
                </span>
              </div>
              <p className="font-sans text-xs text-[#0A1628]/60 leading-tight" style={{ fontWeight: 500 }}>
                {profile?.studentId ? `${profile.studentId} · ` : ""}{roleTitle}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="w-32 h-2 border-[1.5px] border-black bg-white overflow-hidden">
                  <div className="h-full bg-[#FF6B35] transition-all duration-500" style={{ width: `${levelPct}%` }} />
                </div>
                <span className="font-sans text-[10px] text-[#0A1628]/70 whitespace-nowrap" style={{ fontWeight: 600 }}>
                  {xp.toLocaleString("vi-VN")} XP
                </span>
              </div>
            </div>
          ) : (
            <div className="text-left">
              <p className="font-sans text-sm text-[#0A1628] leading-tight" style={{ fontWeight: 700 }}>{displayName}</p>
              <p className="font-sans text-xs text-[#0A1628]/60 leading-tight mt-0.5" style={{ fontWeight: 500 }}>{roleTitle}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Đăng xuất"
          className="group border-[3px] border-black bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-[#991B1B] active:translate-x-1 active:translate-y-1"
          style={{ boxShadow: SHADOW_SM }}
          aria-label="Đăng xuất"
        >
          <LogOut size={20} className="text-[#0A1628] transition-colors duration-200 group-hover:text-white" />
        </button>
      </div>
    </div>
  );
}

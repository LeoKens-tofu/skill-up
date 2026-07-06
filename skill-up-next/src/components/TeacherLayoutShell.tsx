'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Sun, Moon, GraduationCap, LogOut } from "lucide-react";
import { TeacherSidebar } from "./TeacherSidebar";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
export default function TeacherLayoutShell({ children }: { children: React.ReactNode }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

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

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/teacher/account/profile`, {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "success") {
          setProfile(data.data);
        }
      })
      .catch((err) => console.error("Failed to fetch profile", err));
  }, []);

  return (
      <div className="min-h-screen flex bg-[#FFF8F0] transition-colors duration-300">
        <TeacherSidebar />
        
        <main className="flex-1 min-w-0 px-10 py-8">
          {/* Top bar */}
          <div className="flex items-center justify-end mb-8 border-b-[4px] border-black pb-4">
            <div className="flex items-center gap-4">

              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="group relative border-[3px] border-black bg-[#FFF8F0] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-[#FF6B35]"
                style={{ boxShadow: SHADOW_SM }}
              >
                <Bell
                  size={20}
                  className="text-[#0A1628] transition-colors duration-200 group-hover:text-white group-hover:rotate-12 group-hover:scale-110"
                />
              </button>

              <div
                className="flex items-center gap-3 border-[3px] border-black bg-[#FFF8F0] pl-3 pr-4 py-2"
                style={{ boxShadow: SHADOW_SM }}
              >
                <div className="w-11 h-11 border-[3px] border-black bg-[#FF6B35] overflow-hidden flex items-center justify-center text-white">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile?.fullName || "Giảng viên"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <GraduationCap size={24} />
                  )}
                </div>
                <div className="text-left">
                  <p
                    className="font-sans text-sm text-[#0A1628] leading-tight"
                    style={{ fontWeight: 700 }}
                  >
                    {profile?.fullName || "Giảng viên"}
                  </p>
                  <p
                    className="font-sans text-xs text-[#0A1628]/60 leading-tight"
                    style={{ fontWeight: 500 }}
                  >
                    Giảng viên IT
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="group border-[3px] border-black bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-[#991B1B] active:translate-x-1 active:translate-y-1"
                style={{ boxShadow: SHADOW_SM }}
              >
                <LogOut size={20} className="text-[#0A1628] transition-colors duration-200 group-hover:text-white" />
              </button>
            </div>
          </div>

          {children}
        </main>
      </div>
  );
}

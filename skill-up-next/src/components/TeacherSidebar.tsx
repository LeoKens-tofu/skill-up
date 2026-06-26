'use client';
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Users, Settings,
  TrendingUp, ChevronsLeft, ChevronsRight, FileQuestion, BookCheck, UserCircle2
} from "lucide-react";

const navItems = [
  { id: "/teacher/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { id: "/teacher/classes", label: "Lớp học phụ trách", icon: Users },
  { id: "/teacher/quizzes", label: "Quản lý câu hỏi", icon: FileQuestion },
  { id: "/teacher/assessments", label: "Đánh giá năng lực", icon: BookCheck },
  { id: "/teacher/courses", label: "Khóa học", icon: BookOpen },
  { id: "/teacher/profile", label: "Hồ sơ", icon: UserCircle2 },
  { id: "/teacher/settings", label: "Cài đặt", icon: Settings },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-64"} sticky top-0 self-start h-screen flex flex-col border-r-[5px] border-black transition-all duration-300`}
      style={{ backgroundColor: "#0A1628" }}
    >
      {/* Floating collapse tab */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
        className="absolute top-1/2 -right-4 z-30 -translate-y-1/2 w-8 h-12 border-[3px] border-black bg-[#FF6B35] text-white flex items-center justify-center transition-all duration-150 hover:-translate-y-[calc(50%+2px)] hover:-translate-x-0.5 active:translate-x-1"
        style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}
      >
        {collapsed ? <ChevronsRight size={18} strokeWidth={3} /> : <ChevronsLeft size={18} strokeWidth={3} />}
      </button>

      {/* Brand */}
      <div className={`${collapsed ? "px-3" : "px-6"} pt-8 pb-6 border-b-[4px] border-black flex justify-center`}>
        {collapsed ? (
          <div
            className="w-12 h-12 bg-[#FF6B35] border-[4px] border-black flex items-center justify-center"
            style={{ boxShadow: SHADOW_SM }}
          >
            <TrendingUp size={20} strokeWidth={3} className="text-white" />
          </div>
        ) : (
          <div
            className="inline-flex items-center gap-2 bg-[#FF6B35] border-[4px] border-black px-4 py-2"
            style={{ boxShadow: SHADOW_SM }}
          >
            <span
              className="font-serif text-white text-lg leading-none"
              style={{ fontWeight: 700 }}
            >
              Skill Up
            </span>
            <div className="w-6 h-6 border-[2.5px] border-black bg-[#FFF8F0] flex items-center justify-center">
              <TrendingUp size={14} strokeWidth={3} className="text-[#FF6B35]" />
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 ${collapsed ? "px-3" : "px-4"} py-6 space-y-2`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.id);
          return (
            <Link
              key={item.id}
              href={item.id}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center ${collapsed ? "justify-center px-0" : "gap-3 px-4"} py-3 border-[3px] font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5`}
              style={{
                backgroundColor: isActive ? "#FF6B35" : "transparent",
                color: isActive ? "#FFFFFF" : "#FFF8F0",
                borderColor: isActive ? "#000000" : "transparent",
                boxShadow: isActive ? SHADOW_SM : "none",
                fontWeight: isActive ? 700 : 500,
              }}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

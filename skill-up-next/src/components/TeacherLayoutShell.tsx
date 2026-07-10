'use client';
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TeacherSidebar } from "./TeacherSidebar";
import HeaderBar, { NotificationItem } from "./HeaderBar";

const TEACHER_NAV = [
  { id: "/teacher/dashboard", label: "Tổng quan" },
  { id: "/teacher/classes", label: "Lớp học phụ trách" },
  { id: "/teacher/quizzes", label: "Quản lý câu hỏi" },
  { id: "/teacher/assessments", label: "Đánh giá năng lực" },
  { id: "/teacher/courses", label: "Khóa học" },
  { id: "/teacher/profile", label: "Hồ sơ" },
  { id: "/teacher/settings", label: "Cài đặt" },
];

const TEACHER_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, icon: "submit", title: "Sinh viên vừa nộp bài tập cần chấm", time: "15 phút trước", unread: true },
  { id: 2, icon: "quiz", title: "Lớp Lập trình Web: 3 bài đang chờ chấm", time: "1 giờ trước", unread: true },
  { id: 3, icon: "course", title: "Khóa 'React cơ bản' đạt 50 lượt ghi danh", time: "Hôm qua", unread: false },
];

export default function TeacherLayoutShell({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

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
          <HeaderBar
            role="teacher"
            areaLabel="Khu vực giảng viên"
            sectionTitle={TEACHER_NAV.find((n) => pathname.startsWith(n.id))?.label || "Bảng điều khiển"}
            profile={profile}
            onLogout={handleLogout}
            initialNotifications={TEACHER_NOTIFICATIONS}
          />

          {children}
        </main>
      </div>
  );
}

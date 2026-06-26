import { Metadata } from "next";
import TeacherLayoutShell from "@/components/TeacherLayoutShell";

export const metadata: Metadata = {
  title: "Giảng viên - Skill Up",
  description: "Trang dành cho giảng viên quản lý lớp học và bộ câu hỏi",
};

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <TeacherLayoutShell>
      {children}
    </TeacherLayoutShell>
  );
}

import { Metadata } from "next";
import StudentLayoutShell from "@/components/StudentLayoutShell";

export const metadata: Metadata = {
  title: "Sinh viên - Skill Up",
  description: "Trang dành cho sinh viên",
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentLayoutShell>
      {children}
    </StudentLayoutShell>
  );
}

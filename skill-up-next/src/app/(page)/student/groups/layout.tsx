import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nhóm học tập | Skill Up",
  description: "Trang nhóm học tập của bạn",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

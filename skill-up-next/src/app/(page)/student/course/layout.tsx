import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khóa học | Skill Up",
  description: "Trang khóa học của bạn",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

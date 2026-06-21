import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cửa hàng XP | Skill Up",
  description: "Trang cửa hàng xp của bạn",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

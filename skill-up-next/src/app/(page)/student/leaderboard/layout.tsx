import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng xếp hạng | Skill Up",
  description: "Trang bảng xếp hạng của bạn",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

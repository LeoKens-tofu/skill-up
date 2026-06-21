import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lịch học | Skill Up",
  description: "Trang lịch học của bạn",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

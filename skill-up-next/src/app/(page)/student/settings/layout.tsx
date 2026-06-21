import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cài đặt | Skill Up",
  description: "Trang cài đặt của bạn",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tổng quan | Skill Up",
  description: "Trang tổng quan của bạn",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

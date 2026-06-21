import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deadline | Skill Up",
  description: "Trang deadline của bạn",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

import { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Đăng ký | Skill Up",
  description: "Tạo tài khoản mới để tham gia hệ thống",
};

export default function RegisterPage() {
  return <RegisterClient />;
}

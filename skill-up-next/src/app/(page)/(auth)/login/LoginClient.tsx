'use client';
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { Sun, Moon, User, Lock, Eye, EyeOff, TrendingUp } from "lucide-react";



export default function App() {
  const [view, setView] = useState<"login" | "home">("login");
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(true);

  
  const router = useRouter();
  if (view === "home") {
    router.push("/student/dashboard");
    return null;
  }


  // Harmonious theme palette
  const theme = isDark
    ? {
        pageBg: "#0A1628",
        panelBg: "#0A1628",
        text: "#FFF8F0",
        subText: "rgba(255,248,240,0.75)",
        inputBg: "#11203A",
        inputText: "#FFF8F0",
        inputPlaceholder: "rgba(255,248,240,0.4)",
        border: "#000000",
        segBg: "#11203A",
        segText: "#FFF8F0",
      }
    : {
        pageBg: "#FFF8F0",
        panelBg: "#FFF8F0",
        text: "#0A1628",
        subText: "rgba(10,22,40,0.7)",
        inputBg: "#FFFFFF",
        inputText: "#0A1628",
        inputPlaceholder: "rgba(10,22,40,0.4)",
        border: "#000000",
        segBg: "#FFF8F0",
        segText: "#0A1628",
      };

  const placeholder =
    activeTab === "student" ? "VD: DE170001" : "VD: giang.vien@fpt.edu.vn";
  const idLabel =
    activeTab === "student" ? "Mã sinh viên" : "Email giảng viên";

  return (
    <div
      className="min-h-screen flex transition-colors duration-500"
      style={{ backgroundColor: theme.pageBg }}
    >
      {/* Left Panel - with background image */}
      <div
        className="w-[55%] flex flex-col border-r-[5px] border-black relative overflow-hidden"
      >
        {/* Background Image with Blur */}
        <div className="absolute inset-0 z-0">
          <img
            src="/imports/image-3.png"
            alt="FPT University Da Nang Campus"
            className="w-full h-full object-cover"
            style={{ filter: "blur(1px)" }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-[#0A1628]/40"></div>
        </div>

        {/* Content - relative to stack above background */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Top: brand */}
          <div className="px-14 pt-10">
            <div
              className="inline-flex items-center gap-2.5 bg-[#FF6B35] border-[4px] border-black px-5 py-2 hover:-translate-y-0.5 hover:translate-x-0.5 transition-transform duration-150 cursor-pointer"
              style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}
            >
              <span
                className="font-serif text-white text-xl leading-none"
                style={{ fontWeight: 700 }}
              >
                Skill Up
              </span>
              <div className="w-7 h-7 border-[3px] border-black bg-[#FFF8F0] flex items-center justify-center">
                <TrendingUp
                  size={16}
                  strokeWidth={3}
                  className="text-[#FF6B35]"
                />
              </div>
            </div>
          </div>

          {/* Content: headline + description + inline stats */}
          <div className="px-14 pt-28 pb-8 flex-1 flex flex-col">
            <h1
              className="font-serif text-[#FFF8F0] tracking-tight leading-[1.1]"
              style={{ fontWeight: 700, fontSize: "3.5rem" }}
            >
              Trải nghiệm <span className="text-[#FF6B35]">nâng cấp kĩ năng</span> bản thân của Đại học FPT.
            </h1>

            <p
              className="font-sans text-[#FFF8F0]/90 text-lg leading-relaxed mt-6 max-w-xl"
              style={{ fontWeight: 400 }}
            >
              Tham gia dự án học thuật hàng đầu campus, nơi những kĩ năng của bản thân
              được nâng cấp qua từng ngày.
            </p>

            {/* Inline stats */}
            <div className="flex items-baseline gap-8 mt-12">
              {[
                { v: "12k+", l: "Sinh viên" },
                { v: "450+", l: "Giảng viên" },
                { v: "98%", l: "Việc làm" },
              ].map((s) => (
                <div key={s.l} className="flex items-baseline gap-2">
                  <span
                    className="font-serif text-[#FF6B35]"
                    style={{ fontWeight: 700, fontSize: "2rem" }}
                  >
                    {s.v}
                  </span>
                  <span
                    className="font-sans text-[#FFF8F0]/85 text-sm"
                    style={{ fontWeight: 500 }}
                  >
                    {s.l}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-14 py-5 flex gap-6 text-[#FFF8F0]/70 font-sans text-sm border-t-[5px] border-black backdrop-blur-sm"
            style={{ fontWeight: 400, backgroundColor: "rgba(0,0,0,0.55)" }}
          >
            <span>© 2026 Đại học FPT Đà Nẵng</span>
            <a href="#" className="hover:text-[#FF6B35] transition-colors">
              Chính sách bảo mật
            </a>
            <a href="#" className="hover:text-[#FF6B35] transition-colors">
              Trạng thái hệ thống
            </a>
          </div>
        </div>
      </div>

      {/* Right Panel - no card frame */}
      <div className="w-[45%] flex items-center justify-center px-16 py-10 transition-colors duration-500">
        <div className="w-full max-w-md">
          {/* Theme Toggle */}
          <div className="flex justify-end mb-10">
            <button
              onClick={() => setIsDark((v) => !v)}
              className="border-[3px] border-black px-4 py-2 flex items-center gap-2 font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
              style={{
                backgroundColor: isDark ? "#11203A" : "#FFF8F0",
                color: theme.text,
                boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                fontWeight: 500,
              }}
            >
              {isDark ? <Moon size={18} /> : <Sun size={18} />}
              <span>{isDark ? "Tối" : "Sáng"}</span>
            </button>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2
              className="font-serif text-5xl mb-3"
              style={{ fontWeight: 700, color: theme.text }}
            >
              Chào mừng trở lại
            </h2>
            <p className="font-sans" style={{ fontWeight: 400, color: theme.subText }}>
              Đăng nhập để tiếp tục với Skill Up
            </p>
          </div>

          {/* Segmented Control */}
          <div
            className="mb-6 flex border-[4px] border-black"
            style={{
              backgroundColor: theme.segBg,
              boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)",
            }}
          >
            <button
              onClick={() => setActiveTab("student")}
              className="flex-1 py-3 font-sans transition-all duration-200 border-r-[4px] border-black"
              style={{
                backgroundColor:
                  activeTab === "student" ? "#FF6B35" : theme.segBg,
                color: activeTab === "student" ? "#FFFFFF" : theme.segText,
                fontWeight: 600,
              }}
            >
              Sinh viên
            </button>
            <button
              onClick={() => setActiveTab("teacher")}
              className="flex-1 py-3 font-sans transition-all duration-200"
              style={{
                backgroundColor:
                  activeTab === "teacher" ? "#FF6B35" : theme.segBg,
                color: activeTab === "teacher" ? "#FFFFFF" : theme.segText,
                fontWeight: 600,
              }}
            >
              Giảng viên
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-5 mb-6">
            <div>
              <label
                className="font-sans mb-2 block"
                style={{ fontWeight: 500, color: theme.text }}
              >
                {idLabel}
              </label>
              <div
                className="border-[4px] border-black flex items-center px-4 py-3 transition-all duration-150 focus-within:-translate-y-0.5 focus-within:-translate-x-0.5"
                style={{
                  backgroundColor: theme.inputBg,
                  boxShadow: "5px 5px 0px 0px rgba(0,0,0,1)",
                }}
              >
                <User size={20} style={{ color: theme.inputText }} className="mr-3" />
                <input
                  type="text"
                  placeholder={placeholder}
                  className="flex-1 bg-transparent outline-none font-sans"
                  style={{
                    color: theme.inputText,
                    fontWeight: 400,
                    // @ts-expect-error CSS var for placeholder
                    "--ph": theme.inputPlaceholder,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  className="font-sans"
                  style={{ fontWeight: 500, color: theme.text }}
                >
                  Mật khẩu
                </label>
                <a
                  href="#"
                  className="font-sans text-[#FF6B35] hover:underline"
                  style={{ fontWeight: 500 }}
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div
                className="border-[4px] border-black flex items-center px-4 py-3 transition-all duration-150 focus-within:-translate-y-0.5 focus-within:-translate-x-0.5"
                style={{
                  backgroundColor: theme.inputBg,
                  boxShadow: "5px 5px 0px 0px rgba(0,0,0,1)",
                }}
              >
                <Lock size={20} style={{ color: theme.inputText }} className="mr-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  className="flex-1 bg-transparent outline-none font-sans"
                  style={{ color: theme.inputText, fontWeight: 400 }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 hover:text-[#FF6B35] transition-colors"
                  style={{ color: theme.inputText }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setView("home")}
            className="w-full bg-[#FF6B35] border-[4px] border-black py-4 font-sans text-white mb-6 transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
            style={{
              boxShadow: "6px 6px 0px 0px rgba(255,107,53,0.9)",
              fontWeight: 700,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "9px 9px 0px 0px rgba(255,107,53,1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow =
                "6px 6px 0px 0px rgba(255,107,53,0.9)")
            }
            onMouseDown={(e) =>
              (e.currentTarget.style.boxShadow =
                "0px 0px 0px 0px rgba(255,107,53,1)")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.boxShadow =
                "9px 9px 0px 0px rgba(255,107,53,1)")
            }
          >
            Đăng nhập
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="flex-1 h-[2px]"
              style={{ backgroundColor: theme.text }}
            ></div>
            <span
              className="font-sans text-sm"
              style={{ fontWeight: 600, color: theme.text }}
            >
              HOẶC TIẾP TỤC VỚI
            </span>
            <div
              className="flex-1 h-[2px]"
              style={{ backgroundColor: theme.text }}
            ></div>
          </div>

          {/* Google */}
          <button
            className="w-full border-[4px] border-black py-3 flex items-center justify-center gap-3 font-sans mb-6 transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
            style={{
              backgroundColor: theme.inputBg,
              color: theme.inputText,
              boxShadow: "5px 5px 0px 0px rgba(0,0,0,1)",
              fontWeight: 500,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35Z"
                fill="#4285F4"
              />
              <path
                d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0 0 10 20Z"
                fill="#34A853"
              />
              <path
                d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 0 0 0 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59Z"
                fill="#FBBC05"
              />
              <path
                d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977Z"
                fill="#EA4335"
              />
            </svg>
            Đăng nhập với Google
          </button>

          <p
            className="text-center font-sans"
            style={{ fontWeight: 400, color: theme.text }}
          >
            Mới tham gia Skill Up?{" "}
            <a
              href="#"
              className="text-[#FF6B35] hover:underline"
              style={{ fontWeight: 600 }}
            >
              Tạo tài khoản
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

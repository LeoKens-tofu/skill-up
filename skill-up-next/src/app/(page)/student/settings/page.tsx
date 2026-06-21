'use client';
import { useState } from "react";
import {
  User,
  Bell,
  Mail,
  Moon,
  Sun,
  Lock,
  Languages,
  Shield,
  Eye,
  Smartphone,
  Trash2,
  LogOut,
  ChevronRight,
  KeyRound,
  Palette,
  Volume2,
} from "lucide-react";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

type Props = {
  isDark?: boolean;
  onToggleDark: () => void;
  onLogout: () => void;
};

export default function Settings({ isDark = false, onToggleDark, onLogout }: Props) {
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifDeadline, setNotifDeadline] = useState(true);
  const [notifSound, setNotifSound] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [accent, setAccent] = useState<"orange" | "navy" | "green">("orange");

  const cardBg = isDark ? "#11203A" : "#FFF8F0";
  const cardInner = isDark ? "#0A1628" : "#FFFFFF";
  const text = isDark ? "#FFF8F0" : "#0A1628";
  const muted = isDark ? "rgba(255,248,240,0.6)" : "rgba(10,22,40,0.6)";

  const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="w-14 h-8 border-[3px] border-black flex items-center transition-all duration-150 flex-shrink-0"
      style={{
        backgroundColor: on ? "#FF6B35" : isDark ? "#0A1628" : "#FFFFFF",
        boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)",
        justifyContent: on ? "flex-end" : "flex-start",
        padding: "2px",
      }}
    >
      <span
        className="block w-5 h-5 border-[2px] border-black"
        style={{ backgroundColor: on ? "#FFF8F0" : "#FF6B35" }}
      ></span>
    </button>
  );

  const Section = ({
    icon: Icon,
    title,
    desc,
    children,
  }: {
    icon: any;
    title: string;
    desc: string;
    children: any;
  }) => (
    <div
      className="border-[4px] border-black"
      style={{ backgroundColor: cardBg, boxShadow: SHADOW }}
    >
      <div
        className="flex items-center gap-3 px-6 py-4 border-b-[3px] border-black"
      >
        <div
          className="w-11 h-11 border-[3px] border-black bg-[#FF6B35] flex items-center justify-center"
        >
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <h3
            className="font-serif leading-tight"
            style={{ fontWeight: 700, fontSize: "1.2rem", color: text }}
          >
            {title}
          </h3>
          <p
            className="font-sans text-xs"
            style={{ fontWeight: 500, color: muted }}
          >
            {desc}
          </p>
        </div>
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  );

  const Row = ({
    icon: Icon,
    label,
    sub,
    right,
  }: {
    icon: any;
    label: string;
    sub?: string;
    right: any;
  }) => (
    <div
      className="border-[3px] border-black p-4 flex items-center gap-3"
      style={{ backgroundColor: cardInner, boxShadow: SHADOW_SM }}
    >
      <div
        className="w-9 h-9 border-[2px] border-black flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: isDark ? "#11203A" : "#FFF8F0" }}
      >
        <Icon size={18} style={{ color: "#FF6B35" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-sans"
          style={{ fontWeight: 700, color: text }}
        >
          {label}
        </p>
        {sub && (
          <p
            className="font-sans text-xs mt-0.5"
            style={{ fontWeight: 500, color: muted }}
          >
            {sub}
          </p>
        )}
      </div>
      {right}
    </div>
  );

  return (
    <div className="space-y-6">
      <p className="font-sans max-w-3xl" style={{ fontWeight: 500, color: muted }}>
        Tuỳ chỉnh trải nghiệm Skill Up của bạn: tài khoản, thông báo, giao diện, bảo mật và nhiều hơn nữa.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account */}
        <Section icon={User} title="Tài khoản" desc="Thông tin cá nhân và đăng nhập">
          <Row
            icon={Mail}
            label="Email"
            sub="namtshde170001@fpt.edu.vn"
            right={
              <button
                className="font-sans text-xs px-3 py-1.5 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628]"
                style={{ fontWeight: 700, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
              >
                Đổi
              </button>
            }
          />
          <Row
            icon={KeyRound}
            label="Mật khẩu"
            sub="Đổi gần nhất 2 tháng trước"
            right={
              <button
                className="font-sans text-xs px-3 py-1.5 border-[2px] border-black bg-[#FF6B35] text-white"
                style={{ fontWeight: 700, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
              >
                Đặt lại
              </button>
            }
          />
          <Row
            icon={Languages}
            label="Ngôn ngữ"
            sub="Ngôn ngữ hiển thị giao diện"
            right={
              <div className="flex border-[2px] border-black" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>
                {(["vi", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className="font-sans text-xs px-3 py-1.5"
                    style={{
                      fontWeight: 700,
                      backgroundColor: language === l ? "#FF6B35" : isDark ? "#11203A" : "#FFF8F0",
                      color: language === l ? "#FFFFFF" : text,
                      borderRight: l === "vi" ? "2px solid black" : "none",
                    }}
                  >
                    {l === "vi" ? "VI" : "EN"}
                  </button>
                ))}
              </div>
            }
          />
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Giao diện" desc="Chế độ hiển thị và màu nhấn">
          <Row
            icon={isDark ? Sun : Moon}
            label="Chế độ tối"
            sub={isDark ? "Đang bật chế độ tối" : "Đang bật chế độ sáng"}
            right={<Toggle on={isDark} onChange={onToggleDark} />}
          />
          <Row
            icon={Palette}
            label="Màu chủ đạo"
            sub="Áp dụng cho nút và điểm nhấn"
            right={
              <div className="flex gap-2">
                {([
                  { id: "orange", color: "#FF6B35" },
                  { id: "navy", color: "#0A1628" },
                  { id: "green", color: "#16A34A" },
                ] as const).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setAccent(c.id)}
                    className="w-8 h-8 border-[3px] border-black"
                    style={{
                      backgroundColor: c.color,
                      boxShadow:
                        accent === c.id
                          ? "3px 3px 0px 0px rgba(0,0,0,1)"
                          : "1px 1px 0px 0px rgba(0,0,0,1)",
                      transform: accent === c.id ? "translate(-2px,-2px)" : "none",
                    }}
                  ></button>
                ))}
              </div>
            }
          />
          <Row
            icon={Eye}
            label="Cỡ chữ lớn"
            sub="Tăng kích thước văn bản toàn ứng dụng"
            right={<Toggle on={false} onChange={() => {}} />}
          />
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Thông báo" desc="Quản lý cách bạn nhận thông tin">
          <Row
            icon={Mail}
            label="Email"
            sub="Tóm tắt hoạt động hằng tuần"
            right={<Toggle on={notifEmail} onChange={() => setNotifEmail((v) => !v)} />}
          />
          <Row
            icon={Smartphone}
            label="Thông báo đẩy"
            sub="Trên thiết bị di động"
            right={<Toggle on={notifPush} onChange={() => setNotifPush((v) => !v)} />}
          />
          <Row
            icon={Bell}
            label="Nhắc deadline"
            sub="Cảnh báo trước 24h"
            right={<Toggle on={notifDeadline} onChange={() => setNotifDeadline((v) => !v)} />}
          />
          <Row
            icon={Volume2}
            label="Âm thanh"
            sub="Phát âm thanh khi có thông báo mới"
            right={<Toggle on={notifSound} onChange={() => setNotifSound((v) => !v)} />}
          />
        </Section>

        {/* Privacy & Security */}
        <Section icon={Shield} title="Quyền riêng tư & Bảo mật" desc="Kiểm soát ai có thể thấy bạn">
          <Row
            icon={Lock}
            label="Xác thực 2 bước"
            sub="Bảo vệ tài khoản bằng mã OTP"
            right={<Toggle on={twoFA} onChange={() => setTwoFA((v) => !v)} />}
          />
          <Row
            icon={User}
            label="Hồ sơ công khai"
            sub="Cho phép sinh viên khác xem hồ sơ"
            right={<Toggle on={publicProfile} onChange={() => setPublicProfile((v) => !v)} />}
          />
          <Row
            icon={Eye}
            label="Hiển thị trong BXH"
            sub="Tên bạn xuất hiện trong bảng xếp hạng"
            right={<Toggle on={showLeaderboard} onChange={() => setShowLeaderboard((v) => !v)} />}
          />
        </Section>
      </div>

      {/* Danger zone */}
      <div
        className="border-[4px] border-black"
        style={{ backgroundColor: cardBg, boxShadow: SHADOW }}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b-[3px] border-black bg-[#991B1B]">
          <div className="w-11 h-11 border-[3px] border-black bg-[#FFF8F0] flex items-center justify-center">
            <Trash2 size={22} className="text-[#991B1B]" />
          </div>
          <div>
            <h3
              className="font-serif text-white leading-tight"
              style={{ fontWeight: 700, fontSize: "1.2rem" }}
            >
              Vùng nguy hiểm
            </h3>
            <p
              className="font-sans text-white/80 text-xs"
              style={{ fontWeight: 500 }}
            >
              Các hành động không thể hoàn tác
            </p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="border-[3px] border-black p-4 flex items-center justify-between gap-3"
            style={{ backgroundColor: cardInner, boxShadow: SHADOW_SM }}
          >
            <div>
              <p className="font-sans" style={{ fontWeight: 700, color: text }}>
                Đăng xuất khỏi thiết bị này
              </p>
              <p
                className="font-sans text-xs mt-0.5"
                style={{ fontWeight: 500, color: muted }}
              >
                Bạn sẽ cần đăng nhập lại
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 font-sans text-sm px-4 py-2.5 border-[3px] border-black bg-[#0A1628] text-white transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
              style={{ fontWeight: 700, boxShadow: SHADOW_SM }}
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>

          <div
            className="border-[3px] border-black p-4 flex items-center justify-between gap-3"
            style={{ backgroundColor: cardInner, boxShadow: SHADOW_SM }}
          >
            <div>
              <p className="font-sans" style={{ fontWeight: 700, color: text }}>
                Xoá tài khoản
              </p>
              <p
                className="font-sans text-xs mt-0.5"
                style={{ fontWeight: 500, color: muted }}
              >
                Toàn bộ dữ liệu sẽ bị xoá vĩnh viễn
              </p>
            </div>
            <button
              className="flex items-center gap-2 font-sans text-sm px-4 py-2.5 border-[3px] border-black bg-[#991B1B] text-white transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
              style={{ fontWeight: 700, boxShadow: SHADOW_SM }}
            >
              <Trash2 size={18} />
              Xoá
            </button>
          </div>
        </div>
      </div>

      <p
        className="font-sans text-xs text-center pt-2 pb-6 flex items-center justify-center gap-1"
        style={{ fontWeight: 500, color: muted }}
      >
        Skill Up v1.0 · Đại học FPT Đà Nẵng
        <ChevronRight size={12} />
      </p>
    </div>
  );
}


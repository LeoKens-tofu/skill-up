'use client';
import { useState } from "react";
import { ShoppingBag, Sparkles, Palette, Coffee, Crown, Check, Zap, Gift } from "lucide-react";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

const MY_XP = 5640;

type Item = {
  id: string;
  name: string;
  desc: string;
  price: number;
  category: "frame" | "theme" | "voucher" | "boost";
  color: string;
  badge?: string;
  owned?: boolean;
};

const items: Item[] = [
  { id: "f1", name: "Frame Vàng Á Quân", desc: "Khung avatar dát vàng cho top 2", price: 800, category: "frame", color: "#FFD166", badge: "HOT" },
  { id: "f2", name: "Frame Lửa Streak", desc: "Khung lửa cháy cho streak 30+ ngày", price: 600, category: "frame", color: "#FF6B35" },
  { id: "f3", name: "Frame Crown King", desc: "Vương miện dành cho top 1", price: 1500, category: "frame", color: "#0A1628", badge: "ĐỘC QUYỀN" },
  { id: "f4", name: "Frame Xanh Học Bá", desc: "Khung xanh thanh lịch", price: 400, category: "frame", color: "#16A34A", owned: true },
  { id: "t1", name: "Theme Đêm Tím", desc: "Giao diện tím huyền bí", price: 500, category: "theme", color: "#7C3AED" },
  { id: "t2", name: "Theme Hồng Pastel", desc: "Tông hồng dễ thương", price: 500, category: "theme", color: "#EC4899" },
  { id: "t3", name: "Theme Xanh Biển", desc: "Mát mắt, dễ tập trung", price: 500, category: "theme", color: "#0EA5E9" },
  { id: "v1", name: "Voucher Canteen 20K", desc: "Trừ 20.000đ tại canteen FPT", price: 1200, category: "voucher", color: "#16A34A", badge: "MỚI" },
  { id: "v2", name: "Voucher Trà sữa", desc: "1 ly trà sữa size M tại Phúc Long", price: 1800, category: "voucher", color: "#991B1B" },
  { id: "v3", name: "Voucher in tài liệu", desc: "In miễn phí 50 trang A4", price: 700, category: "voucher", color: "#0A1628" },
  { id: "b1", name: "XP Boost x2", desc: "Nhân đôi XP trong 24h", price: 1000, category: "boost", color: "#FF6B35", badge: "POWER" },
  { id: "b2", name: "Streak Shield", desc: "Bảo vệ streak 1 ngày nghỉ", price: 600, category: "boost", color: "#FFD166" },
];

const catLabels: Record<Item["category"], string> = {
  frame: "Avatar Frame",
  theme: "Theme màu",
  voucher: "Voucher",
  boost: "Power-up",
};

const catIcons = {
  frame: Crown,
  theme: Palette,
  voucher: Coffee,
  boost: Zap,
};

export default function Shop({ isDark = false }: { isDark?: boolean }) {
  const [cat, setCat] = useState<"all" | Item["category"]>("all");
  const [owned, setOwned] = useState<string[]>(items.filter((i) => i.owned).map((i) => i.id));
  const [xp, setXp] = useState(MY_XP);
  const [toast, setToast] = useState<string | null>(null);

  const text = isDark ? "#FFF8F0" : "#0A1628";
  const muted = isDark ? "rgba(255,248,240,0.6)" : "rgba(10,22,40,0.6)";
  const cardBg = isDark ? "#11203A" : "#FFF8F0";

  const list = cat === "all" ? items : items.filter((i) => i.category === cat);

  const buy = (it: Item) => {
    if (owned.includes(it.id)) return;
    if (xp < it.price) {
      setToast(`Không đủ XP! Cần thêm ${(it.price - xp).toLocaleString()} XP`);
      setTimeout(() => setToast(null), 2200);
      return;
    }
    setXp((v) => v - it.price);
    setOwned((arr) => [...arr, it.id]);
    setToast(`Đã đổi "${it.name}" — −${it.price} XP`);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div
        className="border-[4px] border-black p-6 flex items-center justify-between gap-4 flex-wrap"
        style={{ backgroundColor: "#FF6B35", color: "#FFF8F0", boxShadow: SHADOW }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 border-[4px] border-black bg-[#FFF8F0] flex items-center justify-center"
            style={{ boxShadow: SHADOW_SM }}
          >
            <ShoppingBag size={32} className="text-[#FF6B35]" />
          </div>
          <div>
            <p className="font-sans text-xs uppercase tracking-wider opacity-90" style={{ fontWeight: 700 }}>
              Cửa hàng XP
            </p>
            <p className="font-serif" style={{ fontWeight: 700, fontSize: "1.6rem" }}>
              Đổi XP lấy phần thưởng xịn xò
            </p>
          </div>
        </div>
        <div
          className="border-[4px] border-black bg-[#0A1628] px-5 py-3 flex items-center gap-3"
          style={{ boxShadow: SHADOW_SM }}
        >
          <Sparkles size={22} className="text-[#FFD166]" />
          <div>
            <p className="font-sans text-xs uppercase tracking-wider text-[#FFD166]" style={{ fontWeight: 700 }}>
              Số dư của bạn
            </p>
            <p className="font-serif text-white" style={{ fontWeight: 700, fontSize: "1.4rem" }}>
              {xp.toLocaleString()} XP
            </p>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-3">
        {(["all", "frame", "theme", "voucher", "boost"] as const).map((c) => {
          const active = cat === c;
          const Icon = c === "all" ? Gift : catIcons[c as Item["category"]];
          const label = c === "all" ? "Tất cả" : catLabels[c as Item["category"]];
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="flex items-center gap-2 font-sans px-4 py-2.5 border-[3px] border-black hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
              style={{
                backgroundColor: active ? "#FF6B35" : isDark ? "#11203A" : "#FFF8F0",
                color: active ? "#FFFFFF" : text,
                fontWeight: 700,
                boxShadow: SHADOW_SM,
              }}
            >
              <Icon size={16} /> {label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {list.map((it) => {
          const isOwned = owned.includes(it.id);
          const canAfford = xp >= it.price;
          const Icon = catIcons[it.category];
          return (
            <div
              key={it.id}
              className="border-[4px] border-black flex flex-col"
              style={{ backgroundColor: cardBg, boxShadow: SHADOW }}
            >
              <div
                className="border-b-[3px] border-black h-36 flex items-center justify-center relative"
                style={{ backgroundColor: it.color }}
              >
                <Icon size={56} className="text-[#0A1628]" />
                {it.badge && (
                  <span
                    className="absolute top-2 right-2 font-sans text-xs px-2 py-1 border-[2px] border-black bg-[#0A1628] text-[#FFD166]"
                    style={{ fontWeight: 700, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
                  >
                    {it.badge}
                  </span>
                )}
                {isOwned && (
                  <span
                    className="absolute top-2 left-2 font-sans text-xs px-2 py-1 border-[2px] border-black bg-[#16A34A] text-white flex items-center gap-1"
                    style={{ fontWeight: 700, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
                  >
                    <Check size={12} /> ĐÃ SỞ HỮU
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="font-sans text-xs uppercase tracking-wider" style={{ fontWeight: 700, color: muted }}>
                  {catLabels[it.category]}
                </p>
                <p
                  className="font-serif mt-0.5"
                  style={{ fontWeight: 700, fontSize: "1.1rem", color: text }}
                >
                  {it.name}
                </p>
                <p className="font-sans text-xs mt-1 flex-1" style={{ fontWeight: 500, color: muted }}>
                  {it.desc}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <Sparkles size={16} className="text-[#FF6B35]" />
                    <span className="font-serif" style={{ fontWeight: 700, color: "#FF6B35" }}>
                      {it.price.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => buy(it)}
                    disabled={isOwned}
                    className="font-sans text-xs px-3 py-2 border-[3px] border-black hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:opacity-70"
                    style={{
                      backgroundColor: isOwned ? "#16A34A" : canAfford ? "#0A1628" : isDark ? "#0A1628" : "#FFF8F0",
                      color: isOwned ? "#FFFFFF" : canAfford ? "#FF6B35" : muted,
                      fontWeight: 700,
                      boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)",
                    }}
                  >
                    {isOwned ? "Đã sở hữu" : canAfford ? "Đổi ngay" : "Thiếu XP"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {toast && (
        <div
          className="fixed bottom-8 right-8 z-50 border-[4px] border-black bg-[#0A1628] text-white px-5 py-3 flex items-center gap-3"
          style={{ boxShadow: SHADOW }}
        >
          <Sparkles size={20} className="text-[#FFD166]" />
          <p className="font-sans" style={{ fontWeight: 700 }}>
            {toast}
          </p>
        </div>
      )}
    </div>
  );
}


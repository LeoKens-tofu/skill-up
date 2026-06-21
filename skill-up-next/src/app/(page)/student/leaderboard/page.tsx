'use client';
import { useState } from "react";
import { Crown, Trophy, TrendingUp, TrendingDown, Minus, Users, Search } from "lucide-react";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

const ME_RANK = 2;

const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
const middleNames = ["Minh", "Phương", "Quốc", "Thanh", "Hoài", "Bảo", "Anh", "Đức", "Hữu", "Thị", "Văn", "Ngọc"];
const lastNames = ["An", "Linh", "Bảo", "Khang", "Hà", "Nam", "Tú", "Long", "Hùng", "My", "Vy", "Khoa", "Hiếu", "Trang"];
const depts = ["SE", "AI", "IS", "GD", "MC", "IB"];

function gen(n: number) {
  const arr: any[] = [];
  const rng = (i: number) => Math.abs(Math.sin(i * 9301 + 49297)) % 1;
  for (let i = 0; i < n; i++) {
    const rank = i + 1;
    const name = `${firstNames[Math.floor(rng(i + 1) * firstNames.length)]} ${middleNames[Math.floor(rng(i + 7) * middleNames.length)]} ${lastNames[Math.floor(rng(i + 13) * lastNames.length)]}`;
    const xp = 6000 - rank * 35 - Math.floor(rng(i + 23) * 20);
    const dept = depts[Math.floor(rng(i + 31) * depts.length)];
    const trend = Math.floor(rng(i + 41) * 30) - 15;
    arr.push({ rank, name, xp, dept, trend });
  }
  arr[1] = { rank: 2, name: "Trần Song Hoài Nam", xp: 5640, dept: "SE", trend: 40, you: true };
  return arr;
}

const allUsers = gen(100);

export default function Leaderboard({ isDark = false }: { isDark?: boolean }) {
  const [tab, setTab] = useState<"all" | "dept" | "friends">("all");
  const [dept, setDept] = useState("ALL");
  const [search, setSearch] = useState("");

  const text = isDark ? "#FFF8F0" : "#0A1628";
  const muted = isDark ? "rgba(255,248,240,0.6)" : "rgba(10,22,40,0.6)";
  const cardBg = isDark ? "#11203A" : "#FFF8F0";
  const innerBg = isDark ? "#0A1628" : "#FFFFFF";

  const friendsIds = [1, 2, 7, 12, 24, 38];

  let list = allUsers;
  if (tab === "dept" && dept !== "ALL") list = list.filter((u) => u.dept === dept);
  if (tab === "friends") list = list.filter((u) => friendsIds.includes(u.rank));
  if (search.trim()) list = list.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  const top3 = allUsers.slice(0, 3);

  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumHeights = ["h-28", "h-36", "h-24"];
  const podiumColors = ["#C0C0C0", "#FFD166", "#CD7F32"];

  return (
    <div className="space-y-6">
      <p className="font-sans max-w-3xl" style={{ fontWeight: 500, color: muted }}>
        Bảng xếp hạng XP toàn trường — cập nhật theo thời gian thực. So kè với bạn cùng khoa hoặc bạn bè của bạn!
      </p>

      {/* Podium */}
      <div
        className="border-[4px] border-black p-6"
        style={{ backgroundColor: cardBg, boxShadow: SHADOW }}
      >
        <div className="flex items-end justify-center gap-4 mb-2">
          {podiumOrder.map((u, i) => (
            <div key={u.rank} className="flex flex-col items-center" style={{ minWidth: 130 }}>
              <div
                className="w-16 h-16 border-[4px] border-black flex items-center justify-center mb-2 relative"
                style={{ backgroundColor: podiumColors[i], boxShadow: SHADOW_SM }}
              >
                {i === 1 ? (
                  <Crown size={28} className="text-[#0A1628]" fill="#0A1628" />
                ) : (
                  <Trophy size={26} className="text-[#0A1628]" />
                )}
              </div>
              <p
                className="font-sans text-xs text-center truncate w-full"
                style={{ fontWeight: u.you ? 700 : 600, color: u.you ? "#FF6B35" : text }}
              >
                {u.you ? "BẠN" : u.name.split(" ").slice(-2).join(" ")}
              </p>
              <p className="font-serif" style={{ fontWeight: 700, fontSize: "1.1rem", color: "#FF6B35" }}>
                {u.xp.toLocaleString()} XP
              </p>
              <div
                className={`w-full ${podiumHeights[i]} border-[4px] border-black border-b-0 mt-2 flex items-start justify-center pt-2 font-serif`}
                style={{ backgroundColor: podiumColors[i], color: "#0A1628", fontWeight: 700, fontSize: "1.5rem" }}
              >
                {u.rank}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + filters */}
      <div className="flex flex-wrap items-center gap-3">
        {(["all", "dept", "friends"] as const).map((t) => {
          const labels = { all: "Toàn trường", dept: "Theo khoa", friends: "Bạn bè" };
          const Icon = { all: Trophy, dept: Users, friends: Users }[t];
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex items-center gap-2 font-sans px-4 py-2.5 border-[3px] border-black transition-all hover:-translate-y-0.5 hover:-translate-x-0.5"
              style={{
                backgroundColor: active ? "#FF6B35" : isDark ? "#11203A" : "#FFF8F0",
                color: active ? "#FFFFFF" : text,
                fontWeight: 700,
                boxShadow: SHADOW_SM,
              }}
            >
              <Icon size={16} /> {labels[t]}
            </button>
          );
        })}
        {tab === "dept" && (
          <div className="flex flex-wrap gap-1">
            {["ALL", ...depts].map((d) => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className="font-sans text-xs px-3 py-1.5 border-[2px] border-black"
                style={{
                  backgroundColor: dept === d ? "#0A1628" : innerBg,
                  color: dept === d ? "#FF6B35" : text,
                  fontWeight: 700,
                  boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)",
                }}
              >
                {d === "ALL" ? "Tất cả" : d}
              </button>
            ))}
          </div>
        )}
        <div
          className="flex items-center gap-2 border-[3px] border-black bg-[#FFF8F0] dark:bg-[#11203A] px-3 py-2 ml-auto"
          style={{ boxShadow: SHADOW_SM }}
        >
          <Search size={16} className="text-[#0A1628] dark:text-[#FFF8F0]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm sinh viên..."
            className="bg-transparent outline-none font-sans text-sm w-44 text-[#0A1628] dark:text-[#FFF8F0]"
            style={{ fontWeight: 500 }}
          />
        </div>
      </div>

      {/* List */}
      <div
        className="border-[4px] border-black"
        style={{ backgroundColor: cardBg, boxShadow: SHADOW }}
      >
        <div className="grid grid-cols-[60px_1fr_80px_100px_80px] gap-3 px-5 py-3 border-b-[3px] border-black font-sans text-xs uppercase tracking-wider" style={{ fontWeight: 700, color: muted }}>
          <span>Hạng</span>
          <span>Sinh viên</span>
          <span className="text-center">Khoa</span>
          <span className="text-right">XP</span>
          <span className="text-center">Biến động</span>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {list.map((u) => {
            const TrendIcon = u.trend > 0 ? TrendingUp : u.trend < 0 ? TrendingDown : Minus;
            const trendColor = u.trend > 0 ? "#16A34A" : u.trend < 0 ? "#991B1B" : muted;
            return (
              <div
                key={u.rank}
                className="grid grid-cols-[60px_1fr_80px_100px_80px] gap-3 px-5 py-3 border-b-[2px] border-black items-center"
                style={{
                  backgroundColor: u.you ? (isDark ? "#3A1A10" : "#FFE4D6") : "transparent",
                  borderLeft: u.you ? "4px solid #FF6B35" : "none",
                }}
              >
                <div
                  className="w-9 h-9 border-[2px] border-black flex items-center justify-center font-serif"
                  style={{
                    backgroundColor:
                      u.rank === 1 ? "#FFD166" : u.rank === 2 ? "#C0C0C0" : u.rank === 3 ? "#CD7F32" : innerBg,
                    color: "#0A1628",
                    fontWeight: 700,
                  }}
                >
                  {u.rank}
                </div>
                <p
                  className="font-sans truncate"
                  style={{ fontWeight: u.you ? 700 : 600, color: text }}
                >
                  {u.you ? `${u.name} (Bạn)` : u.name}
                </p>
                <span
                  className="font-sans text-xs px-2 py-1 border-[2px] border-black bg-[#0A1628] text-[#FF6B35] text-center"
                  style={{ fontWeight: 700 }}
                >
                  {u.dept}
                </span>
                <span
                  className="font-serif text-right"
                  style={{ fontWeight: 700, color: "#FF6B35" }}
                >
                  {u.xp.toLocaleString()}
                </span>
                <div className="flex items-center justify-center gap-1" style={{ color: trendColor }}>
                  <TrendIcon size={14} />
                  <span className="font-sans text-xs" style={{ fontWeight: 700 }}>
                    {u.trend > 0 ? `+${u.trend}` : u.trend === 0 ? "—" : u.trend}
                  </span>
                </div>
              </div>
            );
          })}
          {list.length === 0 && (
            <p className="text-center py-8 font-sans" style={{ fontWeight: 500, color: muted }}>
              Không tìm thấy ai phù hợp
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


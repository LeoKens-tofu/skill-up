'use client';
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Pencil,
  Crown,
  Gift,
  Bell,
  Mail,
  Lock,
  Languages,
  Trophy,
  Flame,
  Sparkles,
  GraduationCap,
  Target,
  BookOpen,
  ChevronRight,
  Code2,
  Database,
  Palette,
  MessageCircle,
  Brain,
  Award,
  Upload,
  History,
  X
} from "lucide-react";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

const defaultSkills = [
  { skill: "Lập trình", value: 50, icon: Code2 },
  { skill: "Cơ sở dữ liệu", value: 50, icon: Database },
  { skill: "Giao tiếp", value: 50, icon: MessageCircle },
  { skill: "Tư duy logic", value: 50, icon: Brain },
  { skill: "Thiết kế UI", value: 50, icon: Palette },
  { skill: "Học thuật", value: 50, icon: GraduationCap },
];

const getIconForSkill = (skillName: string) => {
  const map: Record<string, any> = {
    "Lập trình": Code2,
    "Cơ sở dữ liệu": Database,
    "Giao tiếp": MessageCircle,
    "Tư duy logic": Brain,
    "Thiết kế UI": Palette,
    "Học thuật": GraduationCap,
  };
  return map[skillName] || Brain;
};

const weeklyXP = [
  { day: "T2", xp: 120, done: true },
  { day: "T3", xp: 180, done: true },
  { day: "T4", xp: 90, done: true },
  { day: "T5", xp: 220, done: true },
  { day: "T6", xp: 150, done: true },
  { day: "T7", xp: 60, done: false },
  { day: "CN", xp: 0, done: false },
];

const badges = [
  { icon: Trophy, label: "Top 1% kỳ", bg: "#FF6B35", color: "white" },
  { icon: Flame, label: "Streak 14", bg: "#FEF3C7", color: "#92400E" },
  { icon: Sparkles, label: "Học giả", bg: "#DBEAFE", color: "#1E40AF" },
  { icon: GraduationCap, label: "Tốt nghiệp K1", bg: "#FCE7F3", color: "#9F1239" },
  { icon: Target, label: "Săn deadline", bg: "#D1FAE5", color: "#065F46" },
  { icon: BookOpen, label: "Mọt sách", bg: "#E0E7FF", color: "#3730A3" },
  { icon: Award, label: "Giải nhì hackathon", bg: "#FFF8F0", color: "#FF6B35" },
  { icon: Crown, label: "Lớp trưởng", bg: "#FFF8F0", color: "#0A1628" },
];

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [mySkills, setMySkills] = useState<any[]>(defaultSkills);
  const [skillHistory, setSkillHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toggles, setToggles] = useState({
    notif: true,
    email: false,
    twoFa: true,
    lang: false,
  });

  const fetchProfileAndSkills = async () => {
    try {
      const [profRes, skillsRes] = await Promise.all([
        fetch("http://localhost:4000/api/client/student/account/profile", { credentials: "include" }),
        fetch("http://localhost:4000/api/client/student/skills", { credentials: "include" })
      ]);
      const profJson = await profRes.json();
      const skillsJson = await skillsRes.json();

      if (profJson.code === "success") {
        setProfile(profJson.data);
      }
      if (skillsJson.code === "success" && skillsJson.data?.length > 0) {
        const enriched = skillsJson.data.map((s: any) => ({
          ...s,
          icon: getIconForSkill(s.skill)
        }));
        setMySkills(enriched);
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillHistory = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/client/student/skills/history", { credentials: "include" });
      const json = await res.json();
      if (json.code === "success") {
        setSkillHistory(json.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfileAndSkills();
  }, []);

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setAnalyzing(true);
      toast.info("Đang nhờ Groq AI phân tích bảng điểm...");

      try {
        const res = await fetch("http://localhost:4000/api/client/student/skills/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ imageBase64: base64 })
        });
        const json = await res.json();
        
        if (json.code === "success") {
          toast.success("Cập nhật năng lực thành công!");
          const enriched = json.data.map((s: any) => ({
            ...s,
            icon: getIconForSkill(s.skill)
          }));
          setMySkills(enriched);
        } else {
          toast.error(json.message || "Lỗi khi phân tích");
        }
      } catch (err) {
        console.error(err);
        toast.error("Lỗi kết nối đến máy chủ");
      } finally {
        setAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const openHistory = () => {
    setShowHistory(true);
    fetchSkillHistory();
  };

  const weeklyTotal = weeklyXP.reduce((s, d) => s + d.xp, 0);
  const weeklyGoal = 1500;
  const weeklyPct = Math.min((weeklyTotal / weeklyGoal) * 100, 100);

  const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void; }) => (
    <button
      onClick={onChange}
      className="relative w-14 h-8 border-[3px] border-black transition-colors duration-200"
      style={{
        backgroundColor: on ? "#FF6B35" : "#E5E7EB",
        boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)",
      }}
    >
      <div
        className="absolute top-0 w-[22px] h-[22px] border-[2px] border-black bg-white transition-all duration-200"
        style={{ left: on ? "24px" : "0px" }}
      ></div>
    </button>
  );

  const settings = [
    {
      key: "notif" as const,
      icon: Bell,
      title: "Thông báo đẩy",
      sub: "Nhận nhắc nhở deadline và XP mới",
    },
    {
      key: "email" as const,
      icon: Mail,
      title: "Email thông báo",
      sub: "Tổng kết tuần gửi vào email",
    },
    {
      key: "twoFa" as const,
      icon: Lock,
      title: "Xác thực 2 lớp",
      sub: "Bảo vệ tài khoản bằng mã OTP",
    },
    {
      key: "lang" as const,
      icon: Languages,
      title: "Giao diện tiếng Anh",
      sub: "Chuyển toàn bộ UI sang English",
    },
  ];

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-[4px] border-black border-t-[#FF6B35] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Profile Banner */}
      <div
        className="relative border-[4px] border-black overflow-hidden"
        style={{ backgroundColor: "#FF6B35", boxShadow: SHADOW }}
      >
        <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none">
          <div
            className="absolute top-0 right-0 border-l-[40px] border-b-[40px]"
            style={{
              borderLeftColor: "transparent",
              borderBottomColor: "#FFF8F0",
            }}
          ></div>
        </div>

        <div className="px-8 py-7 flex items-center gap-6 flex-wrap">
          <div
            className="w-24 h-24 border-[4px] border-black bg-[#FFF8F0] overflow-hidden flex-shrink-0"
            style={{ boxShadow: SHADOW }}
          >
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.fullName || "Sinh viên"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#0A1628]">
                <GraduationCap size={40} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-[240px]">
            <p
              className="font-serif italic text-white/90 mb-1"
              style={{ fontWeight: 500, fontSize: "1rem" }}
            >
              "Học để khác biệt."
            </p>
            <h2
              className="font-serif text-white"
              style={{ fontWeight: 700, fontSize: "2rem" }}
            >
              {profile?.fullName || "Sinh viên"}
            </h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span
                className="font-sans text-xs uppercase tracking-wider px-2.5 py-1 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628]"
                style={{ fontWeight: 700 }}
              >
                {profile?.studentId || "MSSV"}
              </span>
              <span
                className="font-sans text-xs uppercase tracking-wider px-2.5 py-1 border-[2px] border-black bg-[#0A1628] text-[#FFF8F0]"
                style={{ fontWeight: 700 }}
              >
                {profile?.email || "Chưa có email"}
              </span>
              <span
                className="font-sans text-xs uppercase tracking-wider px-2.5 py-1 border-[2px] border-black bg-white text-[#0A1628]"
                style={{ fontWeight: 700 }}
              >
                Level {profile?.level || 1} - {profile?.title || "Tân sinh viên"}
              </span>
            </div>
          </div>
          <button
            className="border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-2.5 flex items-center gap-2 font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1 flex-shrink-0"
            style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
          >
            <Pencil size={16} />
            Chỉnh sửa hồ sơ
          </button>
        </div>
      </div>

      {/* Ranking panel */}
      <div
        className="border-[4px] border-black"
        style={{ backgroundColor: "#FFF8F0", boxShadow: SHADOW }}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b-[3px] border-black bg-[#FFD166]">
          <Crown size={22} className="text-[#0A1628]" />
          <h3
            className="font-serif text-[#0A1628]"
            style={{ fontWeight: 700, fontSize: "1.25rem" }}
          >
            Bảng xếp hạng & Kinh nghiệm
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 p-6 items-center">
          {/* Trophy */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              className="relative w-24 h-24 border-[4px] border-black bg-[#FF6B35] flex items-center justify-center rotate-[-4deg]"
              style={{ boxShadow: SHADOW_SM }}
            >
              <Trophy size={50} strokeWidth={2.5} className="text-white" fill="white" />
              <div
                className="absolute -top-2 -right-2 w-9 h-9 border-[3px] border-black bg-[#FFD166] flex items-center justify-center rotate-[8deg]"
                style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
              >
                <Crown size={16} strokeWidth={3} className="text-[#0A1628]" fill="#0A1628" />
              </div>
            </div>
            <div
              className="w-28 h-3 border-[3px] border-black bg-[#FFD166] -mt-1"
              style={{ boxShadow: "0px 3px 0px 0px rgba(0,0,0,1)" }}
            ></div>
          </div>

          {/* Rank info */}
          <div className="min-w-0">
            <p
              className="font-sans text-xs uppercase tracking-wider mb-1 text-[#C2410C]"
              style={{ fontWeight: 700 }}
            >
              ⚡ Tổng điểm kinh nghiệm
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span
                className="font-serif text-[#FF6B35] leading-none"
                style={{ fontWeight: 700, fontSize: "3rem" }}
              >
                {profile?.xp || 0} XP
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className="font-sans text-xs px-2 py-1 border-[2px] border-black bg-[#16A34A] text-white"
                style={{ fontWeight: 700 }}
              >
                ▲ Chăm chỉ
              </span>
              <span
                className="font-sans text-xs px-2 py-1 border-[2px] border-black bg-[#FFD166] text-[#0A1628]"
                style={{ fontWeight: 700 }}
              >
                ĐANG HỌC TỐT
              </span>
            </div>
            <div className="w-full h-3 border-[2px] border-black bg-white overflow-hidden">
              <div className="h-full bg-[#FF6B35]" style={{ width: "45%" }}></div>
            </div>
            <p
              className="font-sans text-xs mt-1.5 text-[#0A1628]/70"
              style={{ fontWeight: 600 }}
            >
              Cố lên! Hãy làm thêm bài kiểm tra để gia tăng điểm XP của bạn. 🔥👑
            </p>
          </div>

          {/* Top 3 mini leaderboard */}
          <div
            className="border-[3px] border-black p-4 min-w-[220px] bg-white"
            style={{ boxShadow: SHADOW_SM }}
          >
            <p
              className="font-sans text-[10px] uppercase tracking-wider mb-2 text-[#0A1628]/60"
              style={{ fontWeight: 700 }}
            >
              Top 3 toàn trường
            </p>
            {[
              { rank: 1, name: "Nguyễn Minh An", xp: "5,820", color: "#FFD166", you: false },
              { rank: 2, name: profile?.fullName || "Bạn", xp: profile?.xp || 0, color: "#C0C0C0", you: true },
              { rank: 3, name: "Phạm Quốc Bảo", xp: "5,210", color: "#CD7F32", you: false },
            ].map((u) => (
              <div
                key={u.rank}
                className="flex items-center gap-2 py-1.5 px-1"
                style={{
                  backgroundColor: u.you ? "#FFE4D6" : "transparent",
                  border: u.you ? "2px solid #FF6B35" : "none",
                  borderRadius: 0,
                }}
              >
                <div
                  className="w-7 h-7 border-[2px] border-black flex items-center justify-center font-serif text-sm"
                  style={{ backgroundColor: u.color, color: "#0A1628", fontWeight: 700 }}
                >
                  {u.rank}
                </div>
                <p
                  className="font-sans text-sm flex-1 truncate text-[#0A1628]"
                  style={{ fontWeight: u.you ? 700 : 600 }}
                >
                  {u.you ? `${u.name} (Bạn)` : u.name}
                </p>
                <span
                  className="font-sans text-xs"
                  style={{ fontWeight: 700, color: "#FF6B35" }}
                >
                  {u.xp}
                </span>
              </div>
            ))}
            <div
              className="border-t-[2px] border-dashed border-black mt-2 pt-2 font-sans text-xs text-center"
              style={{ fontWeight: 700, color: "#FF6B35" }}
            >
              🎉 Bạn đang ở vị trí á quân toàn trường
            </div>
          </div>
        </div>
      </div>

      {/* Skills: Radar + Progress bars */}
      <div
        className="border-[4px] border-black bg-white relative"
        style={{ boxShadow: SHADOW }}
      >
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b-[3px] border-black bg-[#E0E7FF] gap-4">
          <div className="flex items-center gap-2">
            <Brain size={22} className="text-[#0A1628]" />
            <h3
              className="font-serif text-[#0A1628]"
              style={{ fontWeight: 700, fontSize: "1.25rem" }}
            >
              Năng lực học tập
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openHistory}
              className="flex items-center gap-2 px-3 py-1.5 border-[2px] border-black bg-white text-[#0A1628] font-sans hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
              style={{ fontWeight: 700, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
            >
              <History size={16} /> Lịch sử
            </button>
            <label
              className={`flex items-center gap-2 px-3 py-1.5 border-[2px] border-black bg-[#16A34A] text-white font-sans ${analyzing ? 'opacity-70 cursor-wait' : 'cursor-pointer hover:-translate-y-0.5 hover:-translate-x-0.5'} active:translate-x-0.5 active:translate-y-0.5 transition-all`}
              style={{ fontWeight: 700, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
            >
              {analyzing ? (
                <div className="w-4 h-4 border-[2px] border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Upload size={16} />
              )}
              {analyzing ? "Đang AI phân tích..." : "Cập nhật ảnh điểm"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleUploadImage}
                disabled={analyzing}
              />
            </label>
          </div>
        </div>

        {analyzing && (
          <div className="absolute inset-0 bg-white/60 z-10 flex flex-col items-center justify-center backdrop-blur-[1px]">
            <div className="w-12 h-12 border-[4px] border-black border-t-[#FF6B35] rounded-full animate-spin mb-4"></div>
            <p className="font-sans font-bold text-[#0A1628] text-lg bg-white px-4 py-2 border-[2px] border-black">
              Groq Vision đang phân tích ảnh...
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Radar */}
          <div
            className="border-[3px] border-black bg-[#FFF8F0] p-4 flex items-center justify-center"
            style={{ boxShadow: SHADOW_SM, minHeight: "340px" }}
          >
            {(() => {
              const axisColor = "#0A1628";
              const size = 320;
              const cx = size / 2;
              const cy = size / 2;
              const radius = 110;
              const n = mySkills.length;
              if (n === 0) return null;
              
              const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
              const point = (i: number, r: number) => {
                const a = angleFor(i);
                return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
              };
              const rings = [0.25, 0.5, 0.75, 1];
              const polygon = mySkills
                .map((s, i) => {
                  const val = Math.max(0, Math.min(100, s.value));
                  const [x, y] = point(i, radius * (val / 100));
                  return `${x},${y}`;
                })
                .join(" ");
              return (
                <svg width={size} height={size}>
                  {rings.map((r) => (
                    <circle
                      key={r}
                      cx={cx}
                      cy={cy}
                      r={radius * r}
                      fill="none"
                      stroke={axisColor}
                      strokeWidth={1.5}
                    />
                  ))}
                  {mySkills.map((_, i) => {
                    const [x, y] = point(i, radius);
                    return (
                      <line
                        key={`spoke-${i}`}
                        x1={cx}
                        y1={cy}
                        x2={x}
                        y2={y}
                        stroke={axisColor}
                        strokeWidth={1}
                        opacity={0.4}
                      />
                    );
                  })}
                  <polygon
                    points={polygon}
                    fill="#FF6B35"
                    fillOpacity={0.6}
                    stroke="#0A1628"
                    strokeWidth={3}
                  />
                  {mySkills.map((s, i) => {
                    const [x, y] = point(i, radius + 22);
                    return (
                      <text
                        key={`label-${s.skill}`}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={axisColor}
                        fontSize={12}
                        fontWeight={600}
                      >
                        {s.skill}
                      </text>
                    );
                  })}
                </svg>
              );
            })()}
          </div>

          {/* Progress bars */}
          <div className="space-y-4">
            {mySkills.map((s) => {
              const Icon = s.icon || Brain;
              const val = Math.max(0, Math.min(100, s.value));
              return (
                <div
                  key={s.skill}
                  className="border-[3px] border-black bg-[#FFF8F0] p-3"
                  style={{ boxShadow: SHADOW_SM }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 border-[2px] border-black bg-white flex items-center justify-center">
                        <Icon size={14} className="text-[#0A1628]" />
                      </div>
                      <span
                        className="font-sans text-sm text-[#0A1628]"
                        style={{ fontWeight: 600 }}
                      >
                        {s.skill}
                      </span>
                    </div>
                    <span
                      className="font-serif text-[#0A1628]"
                      style={{ fontWeight: 700, fontSize: "1rem" }}
                    >
                      {val}%
                    </span>
                  </div>
                  <div className="w-full h-3 border-[2px] border-black bg-white">
                    <div
                      className="h-full bg-[#FF6B35] transition-all duration-500"
                      style={{ width: `${val}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1628]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl border-[4px] border-black bg-white flex flex-col max-h-[85vh]" style={{ boxShadow: SHADOW }}>
            <div className="flex items-center justify-between p-4 border-b-[4px] border-black bg-[#FFD166]">
              <h3 className="font-serif text-xl text-[#0A1628]" style={{ fontWeight: 700 }}>Lịch sử cập nhật năng lực</h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 border-[2px] border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {skillHistory.length === 0 ? (
                <p className="text-center font-sans font-bold text-[#0A1628]/60">Chưa có lịch sử cập nhật nào.</p>
              ) : (
                skillHistory.map((record: any, idx: number) => {
                  const date = new Date(record.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  });
                  return (
                    <div key={record._id} className="border-[3px] border-black bg-[#FFF8F0] p-4 relative" style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}>
                      <div className="absolute -top-3 -left-3 bg-[#0A1628] text-white px-2 py-1 border-[2px] border-black font-sans text-xs font-bold">
                        #{skillHistory.length - idx}
                      </div>
                      <p className="font-sans font-bold text-[#FF6B35] mb-3 text-right text-sm">{date}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {record.skills.map((s: any) => (
                          <div key={s.skill} className="flex justify-between items-center border-b-[2px] border-black/10 pb-1">
                            <span className="font-sans text-sm font-semibold text-[#0A1628]">{s.skill}</span>
                            <span className="font-serif font-bold text-[#16A34A]">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weekly XP Goal + Dark certificate card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly XP */}
        <div
          className="lg:col-span-2 border-[4px] border-black bg-white"
          style={{ boxShadow: SHADOW }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black bg-[#DBEAFE]">
            <div className="flex items-center gap-2">
              <Target size={22} className="text-[#0A1628]" />
              <h3
                className="font-serif text-[#0A1628]"
                style={{ fontWeight: 700, fontSize: "1.25rem" }}
              >
                Mục tiêu XP tuần này
              </h3>
            </div>
            <button
              className="flex items-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-3 py-1.5 font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
              style={{ boxShadow: SHADOW_SM, fontWeight: 700, fontSize: "0.85rem" }}
            >
              <Gift size={16} />
              Nhận quà cấp độ
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span
                  className="font-serif text-[#0A1628]"
                  style={{ fontWeight: 700, fontSize: "2rem" }}
                >
                  {weeklyTotal.toLocaleString()}
                </span>
                <span
                  className="font-sans text-[#0A1628]/60 ml-2"
                  style={{ fontWeight: 500 }}
                >
                  / {weeklyGoal.toLocaleString()} XP
                </span>
              </div>
              <span
                className="font-serif text-[#FF6B35]"
                style={{ fontWeight: 700, fontSize: "1.5rem" }}
              >
                {Math.round(weeklyPct)}%
              </span>
            </div>
            <div className="w-full h-4 border-[3px] border-black bg-[#FFF8F0] mb-6">
              <div
                className="h-full bg-[#FF6B35] transition-all duration-500"
                style={{ width: `${weeklyPct}%` }}
              ></div>
            </div>

            {/* Daily bars */}
            <div className="grid grid-cols-7 gap-2">
              {weeklyXP.map((d) => {
                const maxXp = 250;
                const h = Math.max((d.xp / maxXp) * 100, 6);
                return (
                  <div key={d.day} className="flex flex-col items-center gap-1.5">
                    <div className="relative w-full h-24 border-[2px] border-black bg-[#FFF8F0] flex items-end">
                      <div
                        className="w-full transition-all duration-500"
                        style={{
                          height: `${h}%`,
                          backgroundColor: d.done ? "#FF6B35" : "#FEE2C9",
                        }}
                      ></div>
                    </div>
                    <span
                      className="font-sans text-xs text-[#0A1628]"
                      style={{ fontWeight: 700 }}
                    >
                      {d.day}
                    </span>
                    <span
                      className="font-sans text-[10px] text-[#0A1628]/60"
                      style={{ fontWeight: 500 }}
                    >
                      {d.xp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Certificate Card */}
        <div
          className="relative border-[4px] border-black overflow-hidden bg-white flex flex-col h-full"
          style={{ boxShadow: SHADOW }}
        >
          <div className="p-6 flex flex-col h-full">
            <div
              className="inline-flex self-start px-2.5 py-1 border-[2px] border-black bg-[#FFD166] text-[#0A1628] mb-4"
            >
              <span
                className="font-sans text-[10px] uppercase tracking-wider"
                style={{ fontWeight: 700 }}
              >
                Chứng chỉ đang theo
              </span>
            </div>

            <h3
              className="font-serif text-[#0A1628] leading-tight mb-2"
              style={{ fontWeight: 700, fontSize: "1.4rem" }}
            >
              Full-Stack React Developer
            </h3>
            <p
              className="font-sans text-[#0A1628]/70 text-sm mb-5"
              style={{ fontWeight: 400 }}
            >
              Hoàn thành 24/30 modules để nhận chứng chỉ chính thức từ trung tâm SkillUp.
            </p>

            <div className="mb-2 flex items-baseline justify-between">
              <span
                className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60"
                style={{ fontWeight: 600 }}
              >
                Tiến độ
              </span>
              <span
                className="font-serif text-[#FF6B35]"
                style={{ fontWeight: 700, fontSize: "1.5rem" }}
              >
                80%
              </span>
            </div>
            <div className="w-full h-3 border-[2px] border-black bg-[#FFF8F0] mb-6">
              <div
                className="h-full bg-[#FF6B35]"
                style={{ width: "80%" }}
              ></div>
            </div>

            <button
              className="mt-auto w-full border-[3px] border-black bg-[#0A1628] text-white px-4 py-3 flex items-center justify-center gap-2 font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
              style={{
                boxShadow: SHADOW_SM,
                fontWeight: 700,
              }}
            >
              Tiếp tục khóa học
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Badges + Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badges */}
        <div
          className="border-[4px] border-black bg-[#FFF8F0]"
          style={{ boxShadow: SHADOW }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black bg-[#FCE7F3]">
            <div className="flex items-center gap-2">
              <Award size={22} className="text-[#0A1628]" />
              <h3
                className="font-serif text-[#0A1628]"
                style={{ fontWeight: 700, fontSize: "1.25rem" }}
              >
                Bộ sưu tập huy hiệu
              </h3>
            </div>
            <span
              className="font-sans text-xs text-[#0A1628]/60"
              style={{ fontWeight: 600 }}
            >
              {badges.length} / 24
            </span>
          </div>
          <div className="p-5 grid grid-cols-4 gap-3">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.label}
                  className="border-[3px] border-black p-3 flex flex-col items-center text-center gap-1.5 transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 cursor-default"
                  style={{ backgroundColor: b.bg, boxShadow: SHADOW_SM }}
                >
                  <Icon size={28} style={{ color: b.color }} />
                  <span
                    className="font-sans text-[11px] leading-tight"
                    style={{ fontWeight: 700, color: b.color }}
                  >
                    {b.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings */}
        <div
          className="border-[4px] border-black bg-white"
          style={{ boxShadow: SHADOW }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black bg-[#D1FAE5]">
            <div className="flex items-center gap-2">
              <Lock size={22} className="text-[#0A1628]" />
              <h3
                className="font-serif text-[#0A1628]"
                style={{ fontWeight: 700, fontSize: "1.25rem" }}
              >
                Cài đặt tài khoản
              </h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {settings.map((s) => {
              const Icon = s.icon;
              const on = toggles[s.key];
              return (
                <div
                  key={s.key}
                  className="border-[3px] border-black bg-[#FFF8F0] p-3 flex items-center gap-3"
                  style={{ boxShadow: SHADOW_SM }}
                >
                  <div
                    className="w-10 h-10 border-[3px] border-black flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: on ? "#FF6B35" : "white" }}
                  >
                    <Icon
                      size={18}
                      style={{ color: on ? "white" : "#0A1628" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-sans text-sm text-[#0A1628] leading-tight"
                      style={{ fontWeight: 700 }}
                    >
                      {s.title}
                    </p>
                    <p
                      className="font-sans text-xs text-[#0A1628]/60 mt-0.5 leading-tight"
                      style={{ fontWeight: 500 }}
                    >
                      {s.sub}
                    </p>
                  </div>
                  <Toggle
                    on={on}
                    onChange={() =>
                      setToggles((t) => ({ ...t, [s.key]: !t[s.key] }))
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

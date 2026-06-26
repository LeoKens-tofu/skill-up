'use client';
import {
  Users,
  FileQuestion,
  BookOpen,
  TrendingUp,
  Activity,
  PlusCircle,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  Award
} from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

const stats = [
  {
    label: "Lớp học phụ trách",
    value: "4",
    sub: "Học kỳ Spring 2026",
    icon: Users,
    bg: "#FFE4D6",
    accent: "#C2410C",
    iconBg: "#FF6B35",
  },
  {
    label: "Tổng Sinh Viên",
    value: "128",
    sub: "+12 sinh viên mới",
    icon: Users,
    bg: "#FFF8F0",
    accent: "#0A1628",
    iconBg: "#FFF8F0",
  },
  {
    label: "Bộ câu hỏi (Quizzes)",
    value: "15",
    sub: "Đã xuất bản 12",
    icon: FileQuestion,
    bg: "#FFF8F0",
    accent: "#0A1628",
    iconBg: "#FFF8F0",
  },
  {
    label: "Tỉ lệ nộp bài",
    value: "86%",
    sub: "Tăng 5% so với tuần trước",
    icon: TrendingUp,
    bg: "#FFF8F0",
    accent: "#0A1628",
    iconBg: "#FFF8F0",
  },
];

const chartData = [
  { name: "Tuần 1", completion: 65 },
  { name: "Tuần 2", completion: 72 },
  { name: "Tuần 3", completion: 68 },
  { name: "Tuần 4", completion: 80 },
  { name: "Tuần 5", completion: 86 },
];

const recentSubmissions = [
  { student: "Nguyễn Văn A", studentId: "SE160001", quiz: "Quiz Chương 4 — CSDL", score: 90, time: "10 phút trước" },
  { student: "Trần Thị B", studentId: "SE160002", quiz: "Quiz Chương 4 — CSDL", score: 85, time: "25 phút trước" },
  { student: "Lê Văn C", studentId: "SE160003", quiz: "Bài tập lớn — Lập trình Web", score: 95, time: "1 giờ trước" },
  { student: "Phạm Thị D", studentId: "SE160004", quiz: "Báo cáo nhóm — Kỹ năng mềm", score: 88, time: "2 giờ trước" },
];

export default function TeacherDashboard() {
  return (
    <>
      {/* Greeting Banner */}
      <div
        className="border-[4px] border-black mb-8 relative overflow-hidden"
        style={{ backgroundColor: "#0A1628", boxShadow: SHADOW }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BookOpen size={180} className="text-white" />
        </div>
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-white">
            <h1 className="font-serif text-3xl md:text-5xl mb-2" style={{ fontWeight: 800 }}>
              Chào mừng trở lại, Giảng viên!
            </h1>
            <p className="font-sans text-lg md:text-xl opacity-90" style={{ fontWeight: 500 }}>
              Hôm nay là một ngày tuyệt vời để chia sẻ kiến thức.
            </p>
          </div>
          <Link
            href="/teacher/quizzes/create"
            className="inline-flex items-center gap-2 border-[3px] border-black bg-[#FFD166] text-[#0A1628] px-6 py-3 font-sans hover:-translate-y-1 hover:-translate-x-1 transition-transform"
            style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
          >
            <PlusCircle size={20} />
            Soạn bài kiểm tra mới
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="border-[4px] border-black p-5 relative overflow-hidden hover:-translate-y-1 transition-transform"
              style={{ backgroundColor: stat.bg, boxShadow: SHADOW }}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className="w-12 h-12 border-[3px] border-black flex items-center justify-center relative z-10"
                  style={{ backgroundColor: stat.iconBg }}
                >
                  <Icon size={24} className={i === 0 ? "text-white" : "text-[#0A1628]"} />
                </div>
              </div>
              <div className="relative z-10">
                <p className="font-sans text-sm uppercase tracking-wider mb-1" style={{ fontWeight: 700, color: stat.accent }}>
                  {stat.label}
                </p>
                <p className="font-serif text-4xl mb-1 text-[#0A1628]" style={{ fontWeight: 800 }}>
                  {stat.value}
                </p>
                <p className="font-sans text-sm font-medium text-[#0A1628]/70">
                  {stat.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-5">
          <button
            className="w-full border-[4px] border-black bg-[#FF6B35] text-white p-5 text-left hover:-translate-y-1 hover:-translate-x-1 transition-transform flex items-center gap-4"
            style={{ boxShadow: SHADOW }}
          >
            <div className="w-14 h-14 border-[3px] border-black bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
              <Users size={28} className="text-[#FF6B35]" />
            </div>
            <div className="flex-1">
              <p className="font-sans text-xs uppercase tracking-wider opacity-90" style={{ fontWeight: 700 }}>
                Quản lý
              </p>
              <p className="font-serif" style={{ fontWeight: 700, fontSize: "1.15rem" }}>
                Tạo lớp học mới
              </p>
            </div>
          </button>

          <button
            className="w-full border-[4px] border-black bg-white text-[#0A1628] p-5 text-left hover:-translate-y-1 hover:-translate-x-1 transition-transform flex items-center gap-4"
            style={{ boxShadow: SHADOW }}
          >
            <div className="w-14 h-14 border-[3px] border-black bg-[#16A34A] flex items-center justify-center flex-shrink-0">
              <FileText size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-sans text-xs uppercase tracking-wider opacity-90" style={{ fontWeight: 700 }}>
                Báo cáo
              </p>
              <p className="font-serif" style={{ fontWeight: 700, fontSize: "1.15rem" }}>
                Xem đánh giá năng lực
              </p>
            </div>
          </button>
        </div>

        {/* Chart */}
        <div
          className="lg:col-span-2 border-[4px] border-black bg-white p-6"
          style={{ boxShadow: SHADOW }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl text-[#0A1628]" style={{ fontWeight: 800 }}>
                Tỉ lệ nộp bài trung bình
              </h2>
              <p className="font-sans text-sm text-[#0A1628]/70 mt-1" style={{ fontWeight: 500 }}>
                Dựa trên tất cả các lớp học bạn phụ trách (5 tuần gần nhất)
              </p>
            </div>
            <div className="w-12 h-12 border-[3px] border-black bg-[#FFD166] flex items-center justify-center">
              <Activity size={24} className="text-[#0A1628]" />
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#0A1628", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)" }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#0A1628", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)" }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    border: "3px solid #000", 
                    boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                    borderRadius: 0,
                    fontWeight: 700,
                    fontFamily: "var(--font-sans)"
                  }} 
                  itemStyle={{ color: "#FF6B35", fontWeight: 800 }}
                />
                <Line
                  type="monotone"
                  dataKey="completion"
                  stroke="#FF6B35"
                  strokeWidth={4}
                  dot={{ r: 6, fill: "#FFF8F0", stroke: "#000", strokeWidth: 3 }}
                  activeDot={{ r: 8, fill: "#FFD166", stroke: "#000", strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="border-[4px] border-black bg-white overflow-hidden" style={{ boxShadow: SHADOW }}>
        <div className="flex items-center justify-between p-6 border-b-[4px] border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-[3px] border-black bg-[#FF6B35] flex items-center justify-center">
              <CheckCircle2 size={20} className="text-white" />
            </div>
            <h2 className="font-serif text-xl md:text-2xl text-[#0A1628]" style={{ fontWeight: 800 }}>
              Sinh viên vừa nộp bài
            </h2>
          </div>
          <Link
            href="/teacher/assessments"
            className="flex items-center gap-2 text-sm font-bold text-[#0A1628] hover:text-[#FF6B35] transition-colors"
          >
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="bg-[#FFF8F0] border-b-[3px] border-black">
              <tr>
                <th className="p-4 font-bold text-[#0A1628]">Sinh viên</th>
                <th className="p-4 font-bold text-[#0A1628]">Bài kiểm tra</th>
                <th className="p-4 font-bold text-[#0A1628]">Điểm số</th>
                <th className="p-4 font-bold text-[#0A1628]">Thời gian nộp</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.map((sub, i) => (
                <tr key={i} className="border-b-[2px] border-[#0A1628]/10 hover:bg-[#FFF8F0]/50 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-bold text-[#0A1628]">{sub.student}</p>
                      <p className="text-xs font-semibold text-[#0A1628]/60 mt-0.5">{sub.studentId}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-3 py-1 bg-[#16A34A]/10 text-[#16A34A] border-[2px] border-[#16A34A] text-sm font-bold">
                      {sub.quiz}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Award size={18} className="text-[#FFD166]" />
                      <span className="font-serif text-xl font-bold">{sub.score}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0A1628]/60">
                      <Clock size={14} />
                      {sub.time}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

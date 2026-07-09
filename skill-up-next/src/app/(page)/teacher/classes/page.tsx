'use client';
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, Users, TrendingUp, Award, ArrowRight, ChevronLeft, ChevronRight,
  Sparkles, BookOpen, GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const API = process.env.NEXT_PUBLIC_API_URL;

export default function ClassesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [classes, setClasses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: page.toString(), limit: "12", search });
      const res = await fetch(`${API}/client/teacher/classes?${query}`, { credentials: "include" });
      const json = await res.json();
      if (json.code === "success") {
        setClasses(json.data);
        setTotal(json.pagination?.total || 0);
        setTotalPages(json.pagination?.totalPages || 1);
      } else {
        toast.error(json.message || "Không thể tải danh sách lớp");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(fetchClasses, 300);
    return () => clearTimeout(t);
  }, [fetchClasses]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-[#0A1628]" style={{ fontWeight: 700 }}>
            Lớp học phụ trách
          </h1>
          <p className="font-sans text-[#0A1628]/70 mt-2" style={{ fontWeight: 500 }}>
            Theo dõi sinh viên đã ghi danh và tiến độ học tập của từng lớp.
          </p>
        </div>
        <div className="flex items-center gap-2 border-[3px] border-black bg-[#0A1628] text-white px-5 py-3 flex-shrink-0" style={{ boxShadow: SHADOW_SM }}>
          <GraduationCap size={20} className="text-[#FF6B35]" />
          <span className="font-serif text-2xl" style={{ fontWeight: 700 }}>{total}</span>
          <span className="font-sans text-sm" style={{ fontWeight: 500 }}>lớp</span>
        </div>
      </div>

      <div className="bg-[#FFF8F0] border-[4px] border-black p-4" style={{ boxShadow: SHADOW_SM }}>
        <div className="flex items-center border-[3px] border-black bg-white px-4 py-2 w-full md:w-96 transition-all focus-within:-translate-y-0.5 focus-within:-translate-x-0.5">
          <Search size={20} className="text-[#0A1628]/50 mr-2" />
          <input
            type="text"
            placeholder="Tìm lớp theo tên khóa học..."
            className="bg-transparent outline-none font-sans w-full text-[#0A1628]"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {loading ? (
        <div className="border-[4px] border-black border-dashed bg-[#FFF8F0] p-10 text-center font-sans text-[#0A1628]/60" style={{ fontWeight: 600 }}>
          Đang tải danh sách lớp...
        </div>
      ) : classes.length === 0 ? (
        <div className="border-[4px] border-black border-dashed bg-[#FFF8F0] p-12 text-center" style={{ boxShadow: SHADOW }}>
          <BookOpen size={44} className="mx-auto text-[#FF6B35] mb-3" />
          <p className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.35rem" }}>Chưa có lớp nào</p>
          <p className="font-sans text-[#0A1628]/60 mt-1 mb-5" style={{ fontWeight: 500 }}>
            Lớp học được tạo tự động khi bạn xuất bản một khóa học và có sinh viên ghi danh.
          </p>
          <Link
            href="/teacher/courses"
            className="inline-flex items-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-5 py-2.5 font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5"
            style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
          >
            <BookOpen size={18} /> Tới trang Khóa học
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {classes.map((c) => (
            <Link
              key={c._id}
              href={`/teacher/classes/${c._id}`}
              className="group border-[4px] border-black bg-white flex flex-col transition-all duration-150 hover:-translate-y-1 hover:-translate-x-1"
              style={{ boxShadow: SHADOW }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "10px 10px 0px 0px rgba(0,0,0,1)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = SHADOW)}
            >
              <div
                className="relative h-28 border-b-[4px] border-black overflow-hidden"
                style={{
                  backgroundColor: c.coverColor || "#FF6B35",
                  backgroundImage: c.thumbnail ? undefined : `repeating-linear-gradient(45deg, ${c.stripeColor || "#0A1628"} 0 12px, transparent 12px 28px)`,
                }}
              >
                {c.thumbnail && <img src={`${API}${c.thumbnail}`} alt={c.title} className="w-full h-full object-cover" />}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628]" style={{ fontWeight: 700 }}>{c.category}</span>
                  <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#0A1628] text-[#FFF8F0]" style={{ fontWeight: 700 }}>{c.level}</span>
                </div>
                {c.newThisWeek > 0 && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 border-[2px] border-black bg-[#FFD166] text-black" style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}>
                    <Sparkles size={12} />
                    <span className="font-sans text-[10px] uppercase tracking-wider" style={{ fontWeight: 700 }}>+{c.newThisWeek} mới</span>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-serif text-[#0A1628] leading-tight flex-1" style={{ fontWeight: 700, fontSize: "1.15rem" }}>{c.title}</h3>
                  {c.status === "draft" && (
                    <span className="text-[10px] border-[2px] border-black px-1.5 py-0.5 bg-[#FFD166] text-black flex-shrink-0" style={{ fontWeight: 700 }}>NHÁP</span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="border-[2px] border-black bg-[#FFF8F0] px-3 py-2">
                    <div className="flex items-center gap-1.5 text-[#0A1628]/60 mb-0.5">
                      <Users size={13} />
                      <span className="font-sans text-[11px] uppercase tracking-wide" style={{ fontWeight: 700 }}>Sinh viên</span>
                    </div>
                    <span className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.35rem" }}>{c.totalStudents}</span>
                  </div>
                  <div className="border-[2px] border-black bg-[#FFF8F0] px-3 py-2">
                    <div className="flex items-center gap-1.5 text-[#0A1628]/60 mb-0.5">
                      <Award size={13} />
                      <span className="font-sans text-[11px] uppercase tracking-wide" style={{ fontWeight: 700 }}>Hoàn thành</span>
                    </div>
                    <span className="font-serif text-[#16A34A]" style={{ fontWeight: 700, fontSize: "1.35rem" }}>{c.completedStudents}</span>
                  </div>
                </div>

                {/* Avg progress */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1 font-sans text-xs text-[#0A1628]/70" style={{ fontWeight: 600 }}>
                      <TrendingUp size={13} /> Tiến độ trung bình
                    </span>
                    <span className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1rem" }}>{c.avgProgress}%</span>
                  </div>
                  <div className="w-full h-3 border-[2px] border-black bg-[#FFF8F0] mb-4">
                    <div className="h-full bg-[#FF6B35] transition-all duration-500" style={{ width: `${c.avgProgress}%` }} />
                  </div>

                  <div className="flex items-center justify-between border-t-[2px] border-dashed border-black/20 pt-3">
                    <span className="font-sans text-xs text-[#0A1628]/60" style={{ fontWeight: 500 }}>{c.totalLessons} bài học</span>
                    <span className="flex items-center gap-1.5 font-sans text-sm text-[#FF6B35] group-hover:gap-2.5 transition-all" style={{ fontWeight: 700 }}>
                      Xem lớp <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-10 h-10 border-[3px] border-black bg-white flex items-center justify-center hover:-translate-y-0.5 transition-transform disabled:opacity-50"
            style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
          >
            <ChevronLeft size={20} className="text-[#0A1628]" />
          </button>
          <span className="font-sans font-bold text-[#0A1628]">Trang {page} / {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-10 h-10 border-[3px] border-black bg-white flex items-center justify-center hover:-translate-y-0.5 transition-transform disabled:opacity-50"
            style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
          >
            <ChevronRight size={20} className="text-[#0A1628]" />
          </button>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Calendar, CheckCircle2, User, Search, ArrowRight } from "lucide-react";

const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";

export default function QuizHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/student/quizzes/history?${params}`, {
        credentials: "include"
      });
      const json = await res.json();
      if (json.code === "success") {
        setHistory(json.data);
        setTotalPages(json.pagination.totalPages);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch sử", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link 
          href="/student/quizzes"
          className="inline-flex items-center gap-2 font-sans text-sm text-[#0A1628]/60 hover:text-[#FF6B35] mb-2 transition-colors"
          style={{ fontWeight: 600 }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách câu hỏi
        </Link>
        <h1 className="font-serif text-4xl text-[#0A1628]" style={{ fontWeight: 700 }}>
          Lịch sử làm bài
        </h1>
        <p className="font-sans text-[#0A1628]/70 mt-2" style={{ fontWeight: 500 }}>
          Xem lại các bài kiểm tra kỹ năng bạn đã hoàn thành và điểm số đạt được.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <div 
            className="flex items-center border-[3px] border-black bg-white px-4 py-2 w-full md:w-80 transition-all focus-within:-translate-y-0.5 focus-within:-translate-x-0.5"
            style={{ boxShadow: SHADOW_SM }}
          >
            <Search size={20} className="text-[#0A1628]/50 mr-2" />
            <input 
              type="text"
              placeholder="Tìm kiếm theo tên bài..."
              className="bg-transparent outline-none font-sans w-full text-[#0A1628]"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="hidden">Tìm</button>
        </form>
      </div>

      {/* History List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-[4px] border-black border-t-[#FF6B35] rounded-full animate-spin"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="py-20 text-center border-[4px] border-black border-dashed bg-white">
          <p className="font-sans text-lg text-[#0A1628]/60" style={{ fontWeight: 600 }}>
            Bạn chưa hoàn thành bài kiểm tra nào hoặc không tìm thấy kết quả.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div 
              key={item._id}
              className="border-[4px] border-black bg-[#FFF8F0] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-1 hover:-translate-x-1"
              style={{ boxShadow: SHADOW }}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span 
                    className="font-sans text-xs border-[2px] border-black px-2 py-1 bg-white text-[#0A1628]"
                    style={{ fontWeight: 700 }}
                  >
                    {item.quizId?.subject || "Không rõ"}
                  </span>
                  <span className="flex items-center gap-1 font-sans text-sm text-[#0A1628]/60" style={{ fontWeight: 600 }}>
                    <Calendar size={14} /> {formatDate(item.createdAt)}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-[#0A1628]" style={{ fontWeight: 700 }}>
                  {item.quizId?.title || "Bài kiểm tra đã bị xóa"}
                </h3>
              </div>

              <div className="flex items-center gap-6 border-t-[3px] border-black md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                <div className="text-center">
                  <p className="font-sans text-xs text-[#0A1628]/60 uppercase tracking-wider mb-1" style={{ fontWeight: 700 }}>Điểm số</p>
                  <p className="font-sans text-2xl text-[#16A34A] flex items-center justify-center gap-2" style={{ fontWeight: 800 }}>
                    <CheckCircle2 size={24} strokeWidth={3} />
                    {item.score}/10
                  </p>
                  <p className="text-xs font-bold text-[#0A1628]/60">({item.correctAnswers}/{item.totalQuestions})</p>
                </div>
                <div className="w-[3px] h-12 bg-black hidden md:block"></div>
                <div className="text-center">
                  <p className="font-sans text-xs text-[#0A1628]/60 uppercase tracking-wider mb-1" style={{ fontWeight: 700 }}>Kinh nghiệm</p>
                  <p className="font-sans text-2xl text-[#FF6B35] flex items-center justify-center gap-2" style={{ fontWeight: 800 }}>
                    <Trophy size={24} strokeWidth={3} />
                    +{item.xpEarned} XP
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-8">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-10 h-10 border-[3px] border-black bg-white flex items-center justify-center disabled:opacity-50 hover:-translate-y-0.5 transition-transform" 
            style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
          >
            <ArrowLeft size={20} className="text-[#0A1628]" />
          </button>
          <span className="font-sans font-bold text-[#0A1628]">Trang {page} / {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-10 h-10 border-[3px] border-black bg-white flex items-center justify-center disabled:opacity-50 hover:-translate-y-0.5 transition-transform" 
            style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
          >
            <ArrowRight size={20} className="text-[#0A1628]" />
          </button>
        </div>
      )}
    </div>
  );
}

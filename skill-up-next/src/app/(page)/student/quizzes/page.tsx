'use client';
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Play, CheckCircle2, History, ArrowRight, ArrowLeft, User } from "lucide-react";

const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/client/student/quizzes?page=${page}&limit=9&search=${search}&subject=${subjectFilter}`, {
        credentials: "include"
      });
      const json = await res.json();
      if (json.code === "success") {
        setQuizzes(json.data);
        setTotalPages(json.pagination.totalPages);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách quiz", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, subjectFilter]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubjectFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Header section with Search and History Link */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <div 
            className="flex items-center border-[3px] border-black bg-white px-4 py-2 w-full md:w-80 transition-all focus-within:-translate-y-0.5 focus-within:-translate-x-0.5"
            style={{ boxShadow: SHADOW_SM }}
          >
            <Search size={20} className="text-[#0A1628]/50 mr-2" />
            <input 
              type="text"
              placeholder="Tìm kiếm bộ câu hỏi..."
              className="bg-transparent outline-none font-sans w-full text-[#0A1628]"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          
          <select 
            className="border-[3px] border-black bg-white text-[#0A1628] px-4 py-2.5 font-sans outline-none cursor-pointer hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all"
            style={{ boxShadow: SHADOW_SM, fontWeight: 500 }}
            value={subjectFilter}
            onChange={handleSubjectChange}
          >
            <option value="all">Tất cả môn học</option>
            <option value="SWP391">SWP391</option>
            <option value="DBI202">DBI202</option>
            <option value="PRU212">PRU212</option>
            <option value="SSL101c">SSL101c</option>
            <option value="SSG">SSG</option>
          </select>
          <button type="submit" className="hidden">Tìm</button>
        </form>

        <Link 
          href="/student/quizzes/history"
          className="flex items-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-5 py-2.5 font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-1 active:translate-x-1"
          style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
        >
          <History size={18} />
          Lịch sử làm bài
        </Link>
      </div>

      {/* Grid of Quizzes */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-[4px] border-black border-t-[#FF6B35] rounded-full animate-spin"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="py-20 text-center border-[4px] border-dashed border-black bg-white">
          <p className="font-sans text-lg text-[#0A1628]/60" style={{ fontWeight: 600 }}>
            Không tìm thấy bộ câu hỏi nào phù hợp.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <div 
              key={quiz._id}
              className="border-[4px] border-black bg-[#FFF8F0] flex flex-col transition-all duration-200 hover:-translate-y-1 hover:-translate-x-1 group"
              style={{ boxShadow: SHADOW }}
            >
              <div className="p-5 border-b-[3px] border-black flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span 
                    className="font-sans text-xs border-[2px] border-black px-2 py-1 bg-white text-[#0A1628]"
                    style={{ fontWeight: 700 }}
                  >
                    {quiz.subject}
                  </span>
                  {quiz.hasCompleted && (
                    <span className="flex items-center gap-1 text-[#16A34A] font-sans text-sm font-bold">
                      <CheckCircle2 size={16} strokeWidth={3} />
                      Đã hoàn thành
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-xl text-[#0A1628] mb-2 leading-tight" style={{ fontWeight: 700 }}>
                  {quiz.title}
                </h3>
                <div className="space-y-1">
                  <p className="font-sans text-sm text-[#0A1628]/70 flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                    <User size={14} /> Tác giả: {quiz.teacherId?.fullName || "Khuyết danh"}
                  </p>
                  <p className="font-sans text-sm text-[#0A1628]/70" style={{ fontWeight: 500 }}>
                    {quiz.questionCount} câu hỏi · {quiz.xp} XP · {quiz.plays} lượt chơi
                  </p>
                </div>
              </div>
              
              <Link 
                href={`/student/quizzes/${quiz._id}`}
                className="p-4 flex items-center justify-center gap-2 font-sans bg-[#FF6B35] text-white transition-colors duration-200 group-hover:bg-[#E85D2C]"
                style={{ fontWeight: 700 }}
              >
                {quiz.hasCompleted ? "Làm lại bài" : "Bắt đầu làm bài"}
                <Play size={18} fill="currentColor" />
              </Link>
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

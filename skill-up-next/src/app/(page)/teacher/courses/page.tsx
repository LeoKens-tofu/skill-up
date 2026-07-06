'use client';
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, Trash2, Edit, ChevronLeft, ChevronRight, Users, Layers } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";

const CATEGORIES = ["Lập trình", "Thiết kế", "Ngôn ngữ", "Kỹ năng mềm"];

const countLessons = (course: any): number =>
  (course.chapters || []).reduce(
    (sum: number, ch: any) => sum + (ch.lessons ? ch.lessons.length : 0),
    0
  );

export default function CoursesManagementPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [courses, setCourses] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status,
        category,
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/teacher/courses?${query}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.code === "success") {
        setCourses(json.data);
        setTotalPages(json.pagination.totalPages || 1);
      } else {
        toast.error(json.message || "Không thể tải danh sách khóa học");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, category]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchCourses]);

  const handleDelete = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/teacher/courses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message, { id: loadingToast });
        fetchCourses();
      } else {
        toast.error(json.message || "Lỗi xóa khóa học", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Lỗi kết nối", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-[#0A1628] " style={{ fontWeight: 700 }}>
            Quản lý Khóa học
          </h1>
          <p className="font-sans text-[#0A1628]/70 mt-2" style={{ fontWeight: 500 }}>
            Tạo, chỉnh sửa và xuất bản các khóa học của bạn.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/teacher/courses/trash"
            className="flex items-center gap-2 border-[3px] border-black bg-white text-[#0A1628] px-5 py-2.5 font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5"
            style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
          >
            <Trash2 size={18} />
            Thùng rác
          </Link>
          <Link
            href="/teacher/courses/create"
            className="flex items-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-5 py-2.5 font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-1 active:translate-x-1"
            style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
          >
            <Plus size={18} strokeWidth={3} />
            Tạo khóa học
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFF8F0] border-[4px] border-black p-4" style={{ boxShadow: SHADOW_SM }}>
        <div className="flex items-center border-[3px] border-black bg-white px-4 py-2 w-full md:w-96 transition-all focus-within:-translate-y-0.5 focus-within:-translate-x-0.5">
          <Search size={20} className="text-[#0A1628]/50 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            className="bg-transparent outline-none font-sans w-full text-[#0A1628]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border-[3px] border-black bg-white text-[#0A1628] px-4 py-2.5 font-sans outline-none cursor-pointer">
            <option value="all">Tất cả danh mục</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border-[3px] border-black bg-white text-[#0A1628] px-4 py-2.5 font-sans outline-none cursor-pointer">
            <option value="all">Mọi trạng thái</option>
            <option value="public">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border-[4px] border-black bg-white" style={{ boxShadow: SHADOW }}>
        <table className="w-full text-left font-sans min-w-[900px]">
          <thead>
            <tr className="border-b-[4px] border-black bg-[#FF6B35] text-white">
              <th className="p-4" style={{ fontWeight: 700 }}>Tên khóa học</th>
              <th className="p-4" style={{ fontWeight: 700 }}>Danh mục</th>
              <th className="p-4" style={{ fontWeight: 700 }}>Trình độ</th>
              <th className="p-4" style={{ fontWeight: 700 }}>Nội dung</th>
              <th className="p-4" style={{ fontWeight: 700 }}>Học viên</th>
              <th className="p-4" style={{ fontWeight: 700 }}>Trạng thái</th>
              <th className="p-4 text-center" style={{ fontWeight: 700 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center font-sans text-lg text-[#0A1628]/60 font-semibold">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center font-sans text-lg text-[#0A1628]/60 font-semibold">
                  Chưa có khóa học nào. Hãy bấm "Tạo khóa học" để bắt đầu.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course._id} className="border-b-[3px] border-black text-[#0A1628] transition-colors hover:bg-[#FFF8F0]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 border-[2px] border-black flex-shrink-0"
                        style={{
                          backgroundColor: course.coverColor || "#FF6B35",
                          backgroundImage: `repeating-linear-gradient(45deg, ${course.stripeColor || "#0A1628"} 0 5px, transparent 5px 11px)`,
                        }}
                      />
                      <span className="font-serif" style={{ fontWeight: 700, fontSize: "1.125rem" }}>{course.title}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs border-[2px] border-black px-2 py-1 bg-[#FFF8F0]" style={{ fontWeight: 700 }}>
                      {course.category}
                    </span>
                  </td>
                  <td className="p-4" style={{ fontWeight: 600 }}>{course.level}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3 text-sm" style={{ fontWeight: 600 }}>
                      <span className="flex items-center gap-1" title="Số chương">
                        <Layers size={15} className="text-[#FF6B35]" /> {course.chapters?.length || 0}
                      </span>
                      <span className="text-[#0A1628]/40">·</span>
                      <span title="Số bài học">{countLessons(course)} bài</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1" style={{ fontWeight: 600 }}>
                      <Users size={15} className="text-[#0A1628]/60" /> {course.enrollmentCount || 0}
                    </span>
                  </td>
                  <td className="p-4">
                    {course.status === "public" ? (
                      <span className="text-xs border-[2px] border-black px-2 py-1 bg-[#16A34A] text-white" style={{ fontWeight: 700 }}>Xuất bản</span>
                    ) : (
                      <span className="text-xs border-[2px] border-black px-2 py-1 bg-[#FFD166] text-black" style={{ fontWeight: 700 }}>Bản nháp</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <Link href={`/teacher/courses/${course._id}/edit`} className="p-2 border-[2px] border-black bg-[#FFD166] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform text-black" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>
                        <Edit size={16} />
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-2 border-[2px] border-black bg-[#991B1B] text-white hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>
                            <Trash2 size={16} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-[4px] border-black bg-white rounded-none" style={{ boxShadow: SHADOW }}>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-serif text-2xl text-[#0A1628]" style={{ fontWeight: 700 }}>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription className="font-sans text-base text-[#0A1628]/70" style={{ fontWeight: 500 }}>
                              Bạn có chắc chắn muốn xóa khóa học này vào thùng rác không? Bạn có thể khôi phục lại sau đó.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-[3px] border-black rounded-none bg-white font-bold hover:bg-gray-100 text-[#0A1628] hover:-translate-y-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(course._id)} className="border-[3px] border-black rounded-none bg-[#991B1B] font-bold hover:bg-[#991B1B]/90 text-white hover:-translate-y-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>Chuyển vào thùng rác</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
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

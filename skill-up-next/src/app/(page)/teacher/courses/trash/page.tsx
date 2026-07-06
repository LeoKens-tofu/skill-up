'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
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

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";

export default function CourseTrashPage() {
  const [trash, setTrash] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/teacher/courses/trash`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.code === "success") {
        setTrash(json.data);
      } else {
        toast.error(json.message || "Lỗi tải thùng rác");
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id: string) => {
    const loadingToast = toast.loading("Đang khôi phục...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/teacher/courses/restore/${id}`, {
        method: "PATCH",
        credentials: "include",
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message, { id: loadingToast });
        fetchTrash();
      } else {
        toast.error(json.message || "Lỗi khôi phục", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Lỗi kết nối", { id: loadingToast });
    }
  };

  const handleHardDelete = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa vĩnh viễn...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/teacher/courses/hard/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message, { id: loadingToast });
        fetchTrash();
      } else {
        toast.error(json.message || "Lỗi xóa vĩnh viễn", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Lỗi kết nối", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/teacher/courses"
          className="inline-flex items-center gap-2 font-sans text-sm text-[#0A1628]/60 hover:text-[#FF6B35] mb-2 transition-colors"
          style={{ fontWeight: 600 }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>
        <h1 className="font-serif text-4xl text-[#0A1628] " style={{ fontWeight: 700 }}>
          Thùng rác
        </h1>
        <p className="font-sans text-[#0A1628]/70 mt-2" style={{ fontWeight: 500 }}>
          Các khóa học đã xóa sẽ nằm ở đây. Bạn có thể khôi phục hoặc xóa vĩnh viễn.
        </p>
      </div>

      <div className="overflow-x-auto border-[4px] border-black bg-white" style={{ boxShadow: SHADOW }}>
        <table className="w-full text-left font-sans min-w-[800px]">
          <thead>
            <tr className="border-b-[4px] border-black bg-[#991B1B] text-white">
              <th className="p-4" style={{ fontWeight: 700 }}>Tên khóa học</th>
              <th className="p-4" style={{ fontWeight: 700 }}>Danh mục</th>
              <th className="p-4" style={{ fontWeight: 700 }}>Ngày xóa</th>
              <th className="p-4 text-center" style={{ fontWeight: 700 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-10 text-center font-sans text-lg text-[#0A1628]/60 font-semibold">
                  Đang tải thùng rác...
                </td>
              </tr>
            ) : trash.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center font-sans text-lg text-[#0A1628]/60 font-semibold">
                  Thùng rác trống.
                </td>
              </tr>
            ) : (
              trash.map((course) => (
                <tr key={course._id} className="border-b-[3px] border-black text-[#0A1628] transition-colors hover:bg-[#FFF8F0]">
                  <td className="p-4 font-serif" style={{ fontWeight: 700, fontSize: "1.125rem" }}>{course.title}</td>
                  <td className="p-4">
                    <span className="text-xs border-[2px] border-black px-2 py-1 bg-[#FFF8F0]" style={{ fontWeight: 700 }}>
                      {course.category}
                    </span>
                  </td>
                  <td className="p-4" style={{ fontWeight: 600 }}>
                    {course.deletedAt ? format(new Date(course.deletedAt), "dd/MM/yyyy HH:mm") : "N/A"}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button title="Khôi phục" className="p-2 border-[2px] border-black bg-[#16A34A] text-white hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>
                            <RefreshCw size={16} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-[4px] border-black bg-white rounded-none" style={{ boxShadow: SHADOW }}>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-serif text-2xl text-[#0A1628]" style={{ fontWeight: 700 }}>Xác nhận khôi phục</AlertDialogTitle>
                            <AlertDialogDescription className="font-sans text-base text-[#0A1628]/70" style={{ fontWeight: 500 }}>
                              Bạn có chắc chắn muốn khôi phục khóa học này không?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-[3px] border-black rounded-none bg-white font-bold hover:bg-gray-100 text-[#0A1628] hover:-translate-y-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRestore(course._id)} className="border-[3px] border-black rounded-none bg-[#16A34A] font-bold hover:bg-[#16A34A]/90 text-white hover:-translate-y-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>Khôi phục</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button title="Xóa vĩnh viễn" className="p-2 border-[2px] border-black bg-[#0A1628] text-white hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>
                            <Trash2 size={16} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-[4px] border-black bg-white rounded-none" style={{ boxShadow: SHADOW }}>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-serif text-2xl text-[#0A1628]" style={{ fontWeight: 700 }}>Xóa vĩnh viễn</AlertDialogTitle>
                            <AlertDialogDescription className="font-sans text-base text-[#991B1B]" style={{ fontWeight: 600 }}>
                              CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn khóa học (cùng toàn bộ chương, bài học) và không thể khôi phục. Bạn chắc chắn chứ?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-[3px] border-black rounded-none bg-white font-bold hover:bg-gray-100 text-[#0A1628] hover:-translate-y-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleHardDelete(course._id)} className="border-[3px] border-black rounded-none bg-[#991B1B] font-bold hover:bg-[#991B1B]/90 text-white hover:-translate-y-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>Xóa vĩnh viễn</AlertDialogAction>
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
    </div>
  );
}

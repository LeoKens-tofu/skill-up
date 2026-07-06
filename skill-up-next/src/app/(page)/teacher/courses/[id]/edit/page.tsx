'use client';
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import CourseBuilder, { CourseInitial } from "../../CourseBuilder";

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [initial, setInitial] = useState<CourseInitial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/teacher/courses/${courseId}`, {
          credentials: "include",
        });
        const json = await res.json();
        if (json.code === "success") {
          setInitial(json.data);
        } else {
          toast.error(json.message || "Không thể tải khóa học");
          router.push("/teacher/courses");
        }
      } catch {
        toast.error("Lỗi kết nối đến máy chủ");
        router.push("/teacher/courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, router]);

  if (loading) {
    return <div className="p-10 text-center font-bold font-sans">Đang tải dữ liệu...</div>;
  }

  if (!initial) return null;

  return <CourseBuilder mode="edit" courseId={courseId} initial={initial} />;
}

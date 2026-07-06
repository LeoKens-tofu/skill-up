'use client';
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, Play, CheckCircle2, Lock, Users, Award, BookOpen, Zap,
  Video, FileText, Paperclip, HelpCircle, Compass, Eye,
} from "lucide-react";
import { toast } from "sonner";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const API = process.env.NEXT_PUBLIC_API_URL;

const TYPE_ICON: Record<string, any> = {
  video: Video, article: FileText, resource: Paperclip, quiz: HelpCircle,
};

export default function CourseDetail({
  courseId, onBack, onOpenLesson,
}: {
  courseId: string;
  onBack: () => void;
  onOpenLesson: (lessonId: string) => void;
}) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`${API}/client/student/courses/${courseId}`, { credentials: "include" });
      const json = await res.json();
      if (json.code === "success") {
        setCourse(json.data);
      } else {
        toast.error(json.message || "Không tải được khóa học");
        onBack();
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, [courseId, onBack]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const handleEnroll = async () => {
    setEnrolling(true);
    const t = toast.loading("Đang tham gia khóa học...");
    try {
      const res = await fetch(`${API}/client/student/courses/${courseId}/enroll`, {
        method: "POST", credentials: "include",
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message, { id: t });
        fetchDetail();
      } else {
        toast.error(json.message || "Lỗi tham gia", { id: t });
      }
    } catch {
      toast.error("Lỗi kết nối", { id: t });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center font-bold font-sans text-[#0A1628]">Đang tải khóa học...</div>;
  }
  if (!course) return null;

  const allLessons = (course.chapters || []).flatMap((ch: any) => ch.lessons || []);
  const firstOpenable =
    allLessons.find((l: any) => l._id === course.lastLessonId && !l.locked) ||
    allLessons.find((l: any) => !l.completed && !l.locked) ||
    allLessons.find((l: any) => !l.locked);

  const instructor = course.teacherId?.fullName || "Giảng viên";
  const completedCount = allLessons.filter((l: any) => l.completed).length;

  return (
    <div className="space-y-6">
      <button onClick={onBack}
        className="flex items-center gap-2 font-sans text-sm px-3 py-2 border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
        style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
        <ArrowLeft size={16} /> Quay lại danh sách khóa học
      </button>

      {/* Header */}
      <div className="border-[4px] border-black bg-[#FFF8F0]" style={{ boxShadow: SHADOW }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative aspect-video border-r-[4px] border-black overflow-hidden"
            style={{
              backgroundColor: course.coverColor || "#0A1628",
              backgroundImage: course.thumbnail ? undefined : "repeating-linear-gradient(45deg, #FF6B35 0 12px, transparent 12px 24px)",
            }}>
            {course.thumbnail && <img src={`${API}${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" />}
          </div>

          <div className="p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="font-sans text-xs uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#FF6B35] text-white" style={{ fontWeight: 700 }}>{course.category}</span>
              <span className="font-sans text-xs uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#0A1628] text-[#FF6B35]" style={{ fontWeight: 700 }}>{course.level}</span>
            </div>
            <h2 className="font-serif mb-1 text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.6rem" }}>{course.title}</h2>
            {course.subtitle && <p className="font-sans text-sm text-[#0A1628]/70 mb-2" style={{ fontWeight: 500 }}>{course.subtitle}</p>}
            <p className="font-sans text-sm mb-4 text-[#0A1628]/70" style={{ fontWeight: 500 }}>
              Giảng viên: <span className="text-[#0A1628]" style={{ fontWeight: 700 }}>{instructor}</span>
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { icon: BookOpen, label: `${course.totalLessons} bài` },
                { icon: Users, label: `${course.enrollmentCount || 0} SV` },
                { icon: Zap, label: `+${course.totalXp} XP` },
              ].map((s, i) => (
                <div key={i} className="border-[2px] border-black p-2 text-center bg-white">
                  <s.icon size={16} className="mx-auto text-[#FF6B35]" />
                  <p className="font-sans text-xs mt-1 text-[#0A1628]" style={{ fontWeight: 700 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {course.isEnrolled ? (
              <>
                <div className="mb-2 flex items-baseline justify-between">
                  <p className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60" style={{ fontWeight: 700 }}>Tiến độ</p>
                  <p className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.25rem" }}>{course.progressPercent}%</p>
                </div>
                <div className="w-full h-3 border-[2px] border-black bg-white overflow-hidden mb-4">
                  <div className="h-full bg-[#FF6B35]" style={{ width: `${course.progressPercent}%` }} />
                </div>
                <button onClick={() => firstOpenable && onOpenLesson(firstOpenable._id)}
                  disabled={!firstOpenable}
                  className="mt-auto flex items-center justify-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-4 py-3 font-sans hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1 transition-transform disabled:opacity-50"
                  style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
                  <Play size={18} fill="white" />
                  {completedCount > 0 ? "Tiếp tục học" : "Bắt đầu học"}
                </button>
              </>
            ) : (
              <button onClick={handleEnroll} disabled={enrolling}
                className="mt-auto flex items-center justify-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-4 py-3 font-sans hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1 transition-transform disabled:opacity-50"
                style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
                <Compass size={18} /> Tham gia khóa học
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mô tả + học được gì */}
      {(course.description || (course.whatYouWillLearn?.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {course.description && (
            <div className="border-[4px] border-black bg-white p-6" style={{ boxShadow: SHADOW }}>
              <h3 className="font-serif text-[#0A1628] mb-3" style={{ fontWeight: 700, fontSize: "1.2rem" }}>Giới thiệu khóa học</h3>
              <p className="font-sans text-sm text-[#0A1628]/80 whitespace-pre-line" style={{ fontWeight: 500 }}>{course.description}</p>
            </div>
          )}
          {course.whatYouWillLearn?.length > 0 && (
            <div className="border-[4px] border-black bg-white p-6" style={{ boxShadow: SHADOW }}>
              <h3 className="font-serif text-[#0A1628] mb-3" style={{ fontWeight: 700, fontSize: "1.2rem" }}>Bạn sẽ học được gì</h3>
              <ul className="space-y-2">
                {course.whatYouWillLearn.map((w: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#16A34A] mt-0.5 flex-shrink-0" />
                    <span className="font-sans text-sm text-[#0A1628]/80" style={{ fontWeight: 500 }}>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Danh sách chương / bài học */}
      <div className="border-[4px] border-black bg-[#FFF8F0]" style={{ boxShadow: SHADOW }}>
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black">
          <div className="flex items-center gap-2">
            <BookOpen size={22} className="text-[#FF6B35]" />
            <h3 className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>Nội dung khóa học</h3>
          </div>
          <span className="font-sans text-sm text-[#0A1628]/60" style={{ fontWeight: 600 }}>
            {completedCount} / {course.totalLessons} hoàn thành
          </span>
        </div>

        <div className="p-4 space-y-5">
          {(course.chapters || []).map((ch: any, ci: number) => (
            <div key={ch._id || ci}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                  Chương {ci + 1}: {ch.title}
                </span>
                <span className="font-sans text-xs text-[#0A1628]/50" style={{ fontWeight: 600 }}>({ch.lessons?.length || 0} bài)</span>
              </div>
              <div className="space-y-2">
                {(ch.lessons || []).map((l: any, li: number) => {
                  const Icon = TYPE_ICON[l.type] || Video;
                  const clickable = !l.locked;
                  return (
                    <div key={l._id || li}
                      onClick={() => clickable && onOpenLesson(l._id)}
                      className="border-[3px] border-black p-3 flex items-center gap-3 transition-all bg-white"
                      style={{
                        boxShadow: SHADOW_SM,
                        opacity: l.locked ? 0.55 : 1,
                        cursor: clickable ? "pointer" : "not-allowed",
                      }}>
                      <div className="w-10 h-10 border-[2px] border-black flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: l.completed ? "#16A34A" : l.locked ? "#FFF8F0" : "#FF6B35" }}>
                        {l.completed ? <CheckCircle2 size={20} className="text-white" />
                          : l.locked ? <Lock size={18} className="text-[#0A1628]" />
                          : <Icon size={18} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[#0A1628]" style={{ fontWeight: 600 }}>Bài {li + 1}: {l.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-sans text-xs text-[#0A1628]/60" style={{ fontWeight: 500 }}>
                            {TYPE_LABEL[l.type] || "Bài học"}{l.duration ? ` · ${l.duration}` : ""} · +{l.xp} XP
                          </span>
                        </div>
                      </div>
                      {l.isPreview && !course.isEnrolled && (
                        <span className="flex items-center gap-1 font-sans text-[10px] uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#FFD166] text-black" style={{ fontWeight: 700 }}>
                          <Eye size={12} /> Học thử
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {allLessons.length === 0 && (
            <div className="text-center py-8 font-sans text-[#0A1628]/60" style={{ fontWeight: 600 }}>
              Khóa học chưa có bài học nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TYPE_LABEL: Record<string, string> = {
  video: "Video", article: "Bài viết", resource: "Tài liệu", quiz: "Quiz",
};

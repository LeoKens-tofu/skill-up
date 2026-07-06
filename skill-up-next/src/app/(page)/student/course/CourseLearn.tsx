'use client';
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, CheckCircle2, Lock, Download, ChevronRight, Award,
  Video, FileText, Paperclip, HelpCircle, Play,
} from "lucide-react";
import { toast } from "sonner";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const API = process.env.NEXT_PUBLIC_API_URL;

const TYPE_ICON: Record<string, any> = {
  video: Video, article: FileText, resource: Paperclip, quiz: HelpCircle,
};

// Chuyển link YouTube (mọi định dạng) sang dạng nhúng
const toEmbed = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([\w-]+)/,
    /youtu\.be\/([\w-]+)/,
    /youtube\.com\/shorts\/([\w-]+)/,
    /youtube\.com\/embed\/([\w-]+)/,
    /youtube\.com\/live\/([\w-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
};

export default function CourseLearn({
  courseId, initialLessonId, onBack,
}: {
  courseId: string;
  initialLessonId: string | null;
  onBack: () => void;
}) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState<string | null>(initialLessonId);
  const [submitting, setSubmitting] = useState(false);

  // State làm quiz
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);

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

  const allLessons: any[] = course
    ? (course.chapters || []).flatMap((ch: any) => ch.lessons || [])
    : [];

  const current = allLessons.find((l) => l._id === currentId) || allLessons.find((l) => !l.locked);
  const currentIndex = current ? allLessons.findIndex((l) => l._id === current._id) : -1;
  const nextLesson = allLessons.slice(currentIndex + 1).find((l) => !l.locked);

  // Reset quiz state khi đổi bài
  useEffect(() => {
    setAnswers({});
    setQuizResult(null);
  }, [current?._id]);

  const goTo = (lessonId: string, locked: boolean) => {
    if (locked) return;
    setCurrentId(lessonId);
  };

  const submitComplete = async (quizAnswers?: { questionId: string; selectedOptionIndex: number }[]) => {
    if (!current) return;
    setSubmitting(true);
    const t = toast.loading("Đang lưu tiến độ...");
    try {
      const res = await fetch(`${API}/client/student/courses/${courseId}/lessons/${current._id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answers: quizAnswers || [] }),
      });
      const json = await res.json();
      if (json.code === "success") {
        const d = json.data;
        if (d.quizResult) setQuizResult(d.quizResult);
        if (d.xpEarned > 0) toast.success(`Hoàn thành! +${d.xpEarned} XP`, { id: t });
        else toast.success(json.message, { id: t });
        if (d.isCompleted && d.courseBonus > 0) {
          toast.success(`🎉 Bạn đã hoàn thành cả khóa học! +${d.courseBonus} XP thưởng`);
        }
        await fetchDetail(); // cập nhật trạng thái completed + tiến độ
      } else {
        toast.error(json.message || "Lỗi lưu tiến độ", { id: t });
      }
    } catch {
      toast.error("Lỗi kết nối", { id: t });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQuiz = () => {
    if (!current) return;
    const unanswered = (current.questions || []).filter((q: any) => answers[q._id] === undefined);
    if (unanswered.length > 0) return toast.error(`Còn ${unanswered.length} câu chưa trả lời`);
    const payload = (current.questions || []).map((q: any) => ({
      questionId: q._id,
      selectedOptionIndex: answers[q._id],
    }));
    submitComplete(payload);
  };

  if (loading) {
    return <div className="p-10 text-center font-bold font-sans text-[#0A1628]">Đang tải bài học...</div>;
  }
  if (!course || !current) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-2 font-sans text-sm px-3 py-2 border-[3px] border-black bg-[#FFF8F0] text-[#0A1628]" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <p className="font-sans text-[#0A1628]/60" style={{ fontWeight: 600 }}>Không có bài học khả dụng.</p>
      </div>
    );
  }

  // Nhúng dựa trên chính URL (không phụ thuộc videoSource cho chắc chắn)
  const embed = current.type === "video" ? toEmbed(current.videoUrl || "") : null;
  const isAbsoluteVideo = /^https?:\/\//i.test(current.videoUrl || "");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button onClick={onBack} className="flex items-center gap-2 font-sans text-sm px-3 py-2 border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
          <ArrowLeft size={16} /> {course.title}
        </button>
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs text-[#0A1628]/60" style={{ fontWeight: 700 }}>Tiến độ khóa: {course.progressPercent}%</span>
          <div className="w-32 h-3 border-[2px] border-black bg-[#FFF8F0]">
            <div className="h-full bg-[#FF6B35]" style={{ width: `${course.progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Nội dung bài học */}
        <div className="space-y-4">
          <div className="border-[4px] border-black bg-white" style={{ boxShadow: SHADOW }}>
            {/* Video */}
            {current.type === "video" && (
              <div className="aspect-video bg-black border-b-[4px] border-black">
                {embed ? (
                  <iframe src={embed} className="w-full h-full" allowFullScreen title={current.title} />
                ) : current.videoUrl ? (
                  <video src={isAbsoluteVideo ? current.videoUrl : `${API}${current.videoUrl}`} controls className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/60 font-sans">Chưa có video</div>
                )}
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-sans text-xs uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#FF6B35] text-white" style={{ fontWeight: 700 }}>
                  {TYPE_LABEL[current.type]}
                </span>
                {current.completed && (
                  <span className="flex items-center gap-1 font-sans text-xs uppercase tracking-wider px-2 py-1 border-[2px] border-black bg-[#16A34A] text-white" style={{ fontWeight: 700 }}>
                    <CheckCircle2 size={12} /> Đã hoàn thành
                  </span>
                )}
              </div>
              <h1 className="font-serif text-[#0A1628] mb-4" style={{ fontWeight: 700, fontSize: "1.5rem" }}>{current.title}</h1>

              {/* Article */}
              {current.type === "article" && (
                <div className="font-sans text-[#0A1628]/85 whitespace-pre-line leading-relaxed" style={{ fontWeight: 500 }}>
                  {current.content}
                </div>
              )}

              {/* Resource */}
              {current.type === "resource" && (
                <div className="space-y-2">
                  {(current.resources || []).map((r: any, i: number) => (
                    <a key={i} href={`${API}${r.url}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 border-[3px] border-black p-3 bg-[#FFF8F0] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" style={{ boxShadow: SHADOW_SM }}>
                      <div className="w-10 h-10 border-[2px] border-black bg-[#FFD166] flex items-center justify-center flex-shrink-0">
                        <FileText size={20} className="text-[#0A1628]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[#0A1628] truncate" style={{ fontWeight: 700 }}>{r.name}</p>
                        <p className="font-sans text-xs text-[#0A1628]/50" style={{ fontWeight: 500 }}>{r.size}</p>
                      </div>
                      <Download size={18} className="text-[#FF6B35]" />
                    </a>
                  ))}
                </div>
              )}

              {/* Quiz */}
              {current.type === "quiz" && (
                <div className="space-y-4">
                  {(current.questions || []).map((q: any, qi: number) => {
                    const detail = quizResult?.details?.find((d: any) => d.questionId === q._id);
                    return (
                      <div key={q._id} className="border-[3px] border-black p-4 bg-[#FFF8F0]" style={{ boxShadow: SHADOW_SM }}>
                        <p className="font-sans text-[#0A1628] mb-3" style={{ fontWeight: 700 }}>Câu {qi + 1}: {q.questionText}</p>
                        <div className="space-y-2">
                          {q.options.map((opt: string, oi: number) => {
                            const selected = answers[q._id] === oi;
                            let bg = "bg-white";
                            if (detail) {
                              if (oi === detail.correctAnswerIndex) bg = "bg-[#16A34A]/20 border-[#16A34A]";
                              else if (oi === detail.selectedOptionIndex && !detail.isCorrect) bg = "bg-[#991B1B]/15 border-[#991B1B]";
                            } else if (selected) bg = "bg-[#FF6B35]/15 border-[#FF6B35]";
                            return (
                              <label key={oi}
                                className={`flex items-center gap-3 border-[2px] border-black p-2.5 ${bg} ${quizResult ? "" : "cursor-pointer hover:-translate-x-0.5"} transition-transform`}>
                                <input type="radio" name={`q-${q._id}`} disabled={!!quizResult}
                                  checked={selected}
                                  onChange={() => setAnswers((a) => ({ ...a, [q._id]: oi }))}
                                  className="w-4 h-4 accent-[#FF6B35] cursor-pointer" />
                                <span className="font-sans text-sm text-[#0A1628]" style={{ fontWeight: 500 }}>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                        {detail?.explanation && (
                          <p className="mt-3 font-sans text-xs text-[#0A1628]/70 border-l-[3px] border-[#FF6B35] pl-3" style={{ fontWeight: 500 }}>
                            💡 {detail.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {quizResult ? (
                    <div className="border-[3px] border-black bg-[#0A1628] text-white p-4 flex items-center justify-between" style={{ boxShadow: SHADOW_SM }}>
                      <span className="font-serif" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                        Kết quả: {quizResult.correctAnswers}/{quizResult.totalQuestions} đúng (điểm {quizResult.score}/10)
                      </span>
                      <Award size={24} className="text-[#FFD166]" />
                    </div>
                  ) : (
                    <button onClick={handleSubmitQuiz} disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white py-3 font-sans hover:-translate-y-0.5 transition-transform disabled:opacity-50" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
                      Nộp bài & Hoàn thành
                    </button>
                  )}
                </div>
              )}

              {/* Tài liệu đính kèm — hiển thị cho mọi loại bài (trừ type resource đã là nội dung chính) */}
              {current.type !== "resource" && (current.resources || []).length > 0 && (
                <div className="mt-6 pt-5 border-t-[3px] border-dashed border-black/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip size={18} className="text-[#FF6B35]" />
                    <h3 className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Tài liệu đính kèm</h3>
                  </div>
                  <div className="space-y-2">
                    {(current.resources || []).map((r: any, i: number) => (
                      <a key={i} href={`${API}${r.url}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 border-[3px] border-black p-3 bg-[#FFF8F0] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" style={{ boxShadow: SHADOW_SM }}>
                        <div className="w-10 h-10 border-[2px] border-black bg-[#FFD166] flex items-center justify-center flex-shrink-0">
                          <FileText size={20} className="text-[#0A1628]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-[#0A1628] truncate" style={{ fontWeight: 700 }}>{r.name}</p>
                          <p className="font-sans text-xs text-[#0A1628]/50" style={{ fontWeight: 500 }}>{r.size}</p>
                        </div>
                        <Download size={18} className="text-[#FF6B35]" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Nút hoàn thành cho bài không phải quiz */}
              {current.type !== "quiz" && (
                <div className="mt-6 flex items-center gap-3 flex-wrap">
                  <button onClick={() => submitComplete()} disabled={submitting}
                    className="flex items-center gap-2 border-[3px] border-black bg-[#16A34A] text-white px-5 py-3 font-sans hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform disabled:opacity-50" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
                    <CheckCircle2 size={18} /> {current.completed ? "Đánh dấu lại hoàn thành" : "Đánh dấu hoàn thành"}
                  </button>
                  {nextLesson && (
                    <button onClick={() => goTo(nextLesson._id, false)}
                      className="flex items-center gap-2 border-[3px] border-black bg-[#0A1628] text-white px-5 py-3 font-sans hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
                      Bài tiếp theo <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              )}

              {current.type === "quiz" && quizResult && nextLesson && (
                <button onClick={() => goTo(nextLesson._id, false)}
                  className="mt-4 flex items-center gap-2 border-[3px] border-black bg-[#0A1628] text-white px-5 py-3 font-sans hover:-translate-y-0.5 transition-transform" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
                  Bài tiếp theo <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar mục lục */}
        <div className="border-[4px] border-black bg-[#FFF8F0] h-fit lg:sticky lg:top-4" style={{ boxShadow: SHADOW }}>
          <div className="px-4 py-3 border-b-[3px] border-black">
            <h3 className="font-serif text-[#0A1628]" style={{ fontWeight: 700 }}>Nội dung khóa học</h3>
          </div>
          <div className="p-3 space-y-4 max-h-[70vh] overflow-y-auto">
            {(course.chapters || []).map((ch: any, ci: number) => (
              <div key={ch._id || ci}>
                <p className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 mb-2 px-1" style={{ fontWeight: 700 }}>
                  Chương {ci + 1}: {ch.title}
                </p>
                <div className="space-y-1.5">
                  {(ch.lessons || []).map((l: any) => {
                    const Icon = TYPE_ICON[l.type] || Video;
                    const active = l._id === current._id;
                    return (
                      <button key={l._id} onClick={() => goTo(l._id, l.locked)} disabled={l.locked}
                        className="w-full flex items-center gap-2 border-[2px] border-black p-2 text-left transition-transform hover:-translate-x-0.5 disabled:cursor-not-allowed"
                        style={{ backgroundColor: active ? "#FF6B35" : "white", opacity: l.locked ? 0.5 : 1 }}>
                        <div className="flex-shrink-0">
                          {l.completed ? <CheckCircle2 size={16} className={active ? "text-white" : "text-[#16A34A]"} />
                            : l.locked ? <Lock size={14} className="text-[#0A1628]" />
                            : active ? <Play size={14} className="text-white" fill="white" />
                            : <Icon size={16} className="text-[#0A1628]" />}
                        </div>
                        <span className="font-sans text-xs flex-1 min-w-0 truncate" style={{ fontWeight: active ? 700 : 500, color: active ? "#fff" : "#0A1628" }}>
                          {l.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const TYPE_LABEL: Record<string, string> = {
  video: "Video", article: "Bài viết", resource: "Tài liệu", quiz: "Quiz",
};

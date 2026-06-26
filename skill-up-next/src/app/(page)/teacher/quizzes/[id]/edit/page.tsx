'use client';
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
// @ts-expect-error just-validate types are broken in Next.js
import JustValidate from 'just-validate';
import { toast } from "sonner";

const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";

type Question = {
  id?: number | string;
  _id?: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
};

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("draft");
  const [xp, setXp] = useState<number>(50);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch current quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/client/teacher/quizzes/${quizId}`, {
          credentials: "include"
        });
        const json = await res.json();
        if (json.code === "success") {
          setTitle(json.data.title);
          setSubject(json.data.subject);
          setStatus(json.data.status);
          setXp(json.data.xp);
          // ensure questions have a unique id for UI rendering
          const loadedQuestions = json.data.questions.map((q: any) => ({
            ...q,
            id: q._id || Date.now() + Math.random()
          }));
          setQuestions(loadedQuestions);
        } else {
          toast.error(json.message || "Không thể tải bộ câu hỏi");
          router.push("/teacher/quizzes");
        }
      } catch (error) {
        toast.error("Lỗi kết nối đến máy chủ");
        router.push("/teacher/quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, router]);

  useEffect(() => {
    if (loading || !formRef.current) return;

    if (validatorRef.current) {
      validatorRef.current.destroy();
    }

    validatorRef.current = new JustValidate(formRef.current, {
      validateBeforeSubmitting: true,
      focusInvalidField: true,
    });

    validatorRef.current
      .addField('#title', [
        { rule: 'required', errorMessage: 'Vui lòng nhập tên bộ câu hỏi' },
      ])
      .addField('#subject', [
        { rule: 'required', errorMessage: 'Vui lòng nhập môn học' },
      ])
      .onSuccess(async (event: any) => {
        event.preventDefault();
        
        if (questions.length === 0) {
          return toast.error("Phải có ít nhất 1 câu hỏi");
        }

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (!q.questionText.trim()) return toast.error(`Câu hỏi ${i + 1} không được để trống tiêu đề`);
          for (let j = 0; j < q.options.length; j++) {
            if (!q.options[j].trim()) return toast.error(`Lựa chọn ${j + 1} của câu hỏi ${i + 1} không được để trống`);
          }
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Đang cập nhật bộ câu hỏi...");

        // Remove UI-specific IDs before sending
        const payloadQuestions = questions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex
        }));

        try {
          const res = await fetch(`http://localhost:4000/api/client/teacher/quizzes/${quizId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title, subject, status, xp: Number(xp), questions: payloadQuestions }),
          });
          const json = await res.json();
          if (json.code === "success") {
            toast.success(json.message, { id: loadingToast });
            router.push("/teacher/quizzes");
          } else {
            toast.error(json.message || "Đã xảy ra lỗi", { id: loadingToast });
          }
        } catch (error) {
          toast.error("Lỗi kết nối đến máy chủ", { id: loadingToast });
        } finally {
          setIsSubmitting(false);
        }
      });

    return () => {
      if (validatorRef.current) validatorRef.current.destroy();
    };
  }, [questions, status, xp, router, loading, quizId, title, subject]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now(), questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 }
    ]);
  };

  const updateQuestionText = (id: any, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, questionText: text } : q));
  };

  const updateOption = (qId: any, optIdx: number, val: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOpts = [...q.options];
        newOpts[optIdx] = val;
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };

  const updateCorrectAnswer = (qId: any, correctIdx: number) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, correctAnswerIndex: correctIdx } : q));
  };

  const removeQuestion = (id: any) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;
    setQuestions(questions.filter(q => q.id !== id));
  };

  if (loading) {
    return <div className="p-10 text-center font-bold font-sans">Đang tải dữ liệu...</div>;
  }

  return (
    <form ref={formRef} className="max-w-5xl mx-auto space-y-8" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link 
            href="/teacher/quizzes"
            className="inline-flex items-center gap-2 font-sans text-sm text-[#0A1628]/60 hover:text-[#FF6B35] mb-2 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
          <h1 className="font-serif text-4xl text-[#0A1628] " style={{ fontWeight: 700 }}>
            Chỉnh Sửa Bộ Câu Hỏi
          </h1>
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-6 py-3 font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-1 active:translate-x-1 disabled:opacity-50" 
          style={{ boxShadow: SHADOW, fontWeight: 700 }}
        >
          <Save size={20} /> Cập nhật
        </button>
      </div>

      <div className="border-[4px] border-black bg-white p-6 space-y-6" style={{ boxShadow: SHADOW }}>
        <h2 className="font-serif text-2xl text-[#0A1628] border-b-[3px] border-black pb-4" style={{ fontWeight: 700 }}>
          Thông tin chung
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-sans text-[#0A1628] mb-2" style={{ fontWeight: 700 }}>Tên bộ câu hỏi</label>
            <input 
              type="text" 
              name="title"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Ôn tập Giữa kỳ Web"
              className="w-full border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-3 font-sans outline-none focus:border-[#FF6B35] transition-colors"
              style={{ fontWeight: 500 }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[#0A1628] mb-2" style={{ fontWeight: 700 }}>Môn học</label>
              <input 
                type="text" 
                name="subject"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="VD: SWP391"
                className="w-full border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-3 font-sans outline-none focus:border-[#FF6B35] transition-colors"
                style={{ fontWeight: 500 }}
              />
            </div>
            <div>
              <label className="block font-sans text-[#0A1628] mb-2" style={{ fontWeight: 700 }}>Tổng điểm XP</label>
              <input 
                type="number" 
                value={xp}
                onChange={(e) => setXp(Number(e.target.value))}
                className="w-full border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-3 font-sans outline-none focus:border-[#FF6B35] transition-colors"
                style={{ fontWeight: 500 }}
              />
            </div>
          </div>
          <div>
            <label className="block font-sans text-[#0A1628] mb-2" style={{ fontWeight: 700 }}>Trạng thái</label>
            <select 
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-3 font-sans outline-none cursor-pointer focus:border-[#FF6B35] transition-colors"
              style={{ fontWeight: 500 }}
            >
              <option value="draft">Bản nháp (Sinh viên không thấy)</option>
              <option value="public">Xuất bản (Sinh viên có thể làm)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-[4px] border-black bg-white p-6" style={{ boxShadow: SHADOW }}>
        <div className="flex items-center justify-between border-b-[3px] border-black pb-4 mb-6">
          <h2 className="font-serif text-2xl text-[#0A1628] " style={{ fontWeight: 700 }}>
            Danh sách câu hỏi ({questions.length})
          </h2>
          <button type="button" onClick={addQuestion} className="flex items-center gap-2 border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-2 font-sans transition-all hover:-translate-y-0.5 hover:-translate-x-0.5" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
            <Plus size={18} strokeWidth={3} /> Thêm câu hỏi
          </button>
        </div>

        <div className="space-y-8">
          {questions.map((q, index) => (
            <div key={q.id} className="border-[3px] border-black p-5 relative bg-[#FFF8F0] " style={{ boxShadow: SHADOW_SM }}>
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#FF6B35] border-[3px] border-black flex items-center justify-center text-white font-bold" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>
                {index + 1}
              </div>
              <button 
                type="button"
                onClick={() => removeQuestion(q.id)}
                className="absolute -top-4 -right-4 w-8 h-8 bg-[#991B1B] border-[3px] border-black flex items-center justify-center text-white hover:scale-110 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
              >
                <Trash2 size={16} />
              </button>

              <div className="mb-4">
                <textarea 
                  value={q.questionText}
                  onChange={e => updateQuestionText(q.id, e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full border-[3px] border-black bg-white text-[#0A1628] p-3 font-sans outline-none min-h-[80px] resize-y focus:border-[#FF6B35] transition-colors"
                  style={{ fontWeight: 500 }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name={`correct-${q.id}`} 
                      checked={q.correctAnswerIndex === optIdx}
                      onChange={() => updateCorrectAnswer(q.id, optIdx)}
                      className="w-5 h-5 accent-[#16A34A] cursor-pointer"
                      title="Chọn làm đáp án đúng"
                    />
                    <input 
                      type="text" 
                      value={opt}
                      onChange={e => updateOption(q.id, optIdx, e.target.value)}
                      placeholder={`Đáp án ${optIdx + 1}`}
                      className={`flex-1 border-[2px] border-black p-2 font-sans outline-none ${q.correctAnswerIndex === optIdx ? 'bg-[#16A34A]/20 border-[#16A34A]' : 'bg-white '} text-[#0A1628] transition-colors`}
                      style={{ fontWeight: 500 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-10 border-[3px] border-black border-dashed bg-[#FFF8F0] font-sans text-[#0A1628]/60 " style={{ fontWeight: 600 }}>
              Chưa có câu hỏi nào. Hãy bấm "Thêm câu hỏi" để bắt đầu.
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

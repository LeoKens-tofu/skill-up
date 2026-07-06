'use client';
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";

export default function QuizTakingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/student/quizzes/${id}`, {
          credentials: "include"
        });
        const json = await res.json();
        if (json.code === "success") {
          setQuiz(json.data);
        } else {
          toast.error(json.message);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết quiz", error);
        toast.error("Lỗi hệ thống");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-[4px] border-black border-t-[#FF6B35] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="py-20 text-center border-[4px] border-dashed border-black bg-white">
        <p className="font-sans text-lg text-[#0A1628]/60" style={{ fontWeight: 600 }}>
          Không tìm thấy bộ câu hỏi.
        </p>
        <Link href="/student/quizzes" className="mt-4 inline-block text-[#FF6B35] font-bold hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const questionsToDisplay = isSubmitted && result ? result.quizResult.questions : quiz.questions;
  const currentQuestion = questionsToDisplay[currentQuestionIdx];

  const handleSelectOption = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion._id]: optionIdx
    }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < questionsToDisplay.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    // Format answers
    const answersPayload = Object.entries(selectedAnswers).map(([questionId, selectedOptionIndex]) => ({
      questionId,
      selectedOptionIndex
    }));

    // Thêm các câu chưa làm
    quiz.questions.forEach((q: any) => {
      if (selectedAnswers[q._id] === undefined) {
        answersPayload.push({
          questionId: q._id,
          selectedOptionIndex: -1
        });
      }
    });

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/student/quizzes/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answers: answersPayload })
      });
      const json = await res.json();
      if (json.code === "success") {
        setResult(json.data);
        setIsSubmitted(true);
        setCurrentQuestionIdx(0); 
        toast.success(json.message);
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Nộp bài thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-[4px] border-black pb-6 mb-6">
        <div>
          <Link 
            href="/student/quizzes"
            className="inline-flex items-center gap-2 font-sans text-sm text-[#0A1628]/60 hover:text-[#FF6B35] mb-2 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
          <h1 className="font-serif text-3xl text-[#0A1628]" style={{ fontWeight: 700 }}>
            Bài kiểm tra: {quiz.title}
          </h1>
        </div>
        {!isSubmitted && (
          <div className="flex items-center gap-2 border-[3px] border-black bg-white px-4 py-2" style={{ boxShadow: SHADOW_SM }}>
            <Clock size={20} className="text-[#FF6B35]" />
            <span className="font-sans text-lg font-bold text-[#0A1628]">Không giới hạn</span>
          </div>
        )}
      </div>

      {/* Result Card (if submitted) */}
      {isSubmitted && result && (
        <div 
          className="border-[4px] border-black p-8 text-center transition-all duration-500"
          style={{ backgroundColor: result.correctAnswers === result.totalQuestions ? "#16A34A" : "#FF6B35", boxShadow: SHADOW }}
        >
          <Trophy size={48} className="text-white mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-white mb-2" style={{ fontWeight: 700 }}>
            Hoàn thành bài kiểm tra!
          </h2>
          <p className="font-sans text-xl text-white/90" style={{ fontWeight: 500 }}>
            Điểm số của bạn: <strong>{result.score} / 10</strong> ({result.correctAnswers}/{result.totalQuestions} câu)
          </p>
          <p className="font-sans text-white/80 mt-2">
            Bạn nhận được <strong>+{result.xpEarned} XP</strong>
          </p>
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center justify-between font-sans mb-4">
        <span className="text-[#0A1628]" style={{ fontWeight: 700 }}>
          Câu hỏi {currentQuestionIdx + 1} / {questionsToDisplay.length}
        </span>
        <div className="flex-1 mx-6 h-3 border-[2px] border-black bg-white">
          <div 
            className="h-full bg-[#FF6B35] transition-all duration-300"
            style={{ width: `${((currentQuestionIdx + 1) / questionsToDisplay.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="border-[4px] border-black bg-[#FFF8F0] p-8" style={{ boxShadow: SHADOW }}>
        <h3 className="font-sans text-xl text-[#0A1628] mb-6 leading-relaxed" style={{ fontWeight: 600 }}>
          {currentQuestion.questionText}
        </h3>

        <div className="space-y-4">
          {currentQuestion.options.map((option: string, idx: number) => {
            const isSelected = selectedAnswers[currentQuestion._id] === idx;
            const isCorrect = isSubmitted ? currentQuestion.correctAnswerIndex === idx : false;
            
            let bgClass = "bg-white";
            let borderClass = "border-black";
            let icon = null;

            if (isSubmitted) {
              if (isCorrect) {
                bgClass = "bg-[#16A34A] text-white";
                icon = <CheckCircle2 size={20} />;
                borderClass = "border-black";
              } else if (isSelected && !isCorrect) {
                bgClass = "bg-[#991B1B] text-white";
                icon = <XCircle size={20} />;
                borderClass = "border-black";
              }
            } else if (isSelected) {
              bgClass = "bg-[#FFE4D6]";
              borderClass = "border-[#FF6B35]";
            }

            return (
              <div 
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`flex items-center justify-between border-[3px] p-4 cursor-pointer transition-all duration-150 ${bgClass} ${borderClass} ${!isSubmitted && 'hover:-translate-y-0.5 hover:-translate-x-0.5'}`}
                style={{ 
                  boxShadow: (!isSubmitted && isSelected) ? "4px 4px 0px 0px #FF6B35" : (!isSubmitted ? "2px 2px 0px 0px rgba(0,0,0,1)" : "none"),
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 border-[2px] flex items-center justify-center ${isSelected ? 'border-[#FF6B35]' : 'border-black'}`}>
                    {isSelected && <div className="w-3 h-3 rounded-full bg-[#FF6B35]"></div>}
                  </div>
                  <span className="font-sans" style={{ fontWeight: 500 }}>
                    {option}
                  </span>
                </div>
                {icon}
              </div>
            );
          })}
        </div>
        
        {/* Lời giải thích nếu có */}
        {isSubmitted && currentQuestion.explanation && (
          <div className="mt-6 p-4 border-[3px] border-black bg-[#E0F2FE]">
            <h4 className="font-bold flex items-center gap-2 mb-2 text-[#0284C7]">
              <AlertCircle size={18} /> Giải thích đáp án
            </h4>
            <p className="font-sans text-[#0A1628] leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 pb-10">
        <button 
          onClick={handlePrev}
          disabled={currentQuestionIdx === 0}
          className="border-[3px] border-black bg-white text-[#0A1628] px-6 py-3 font-sans disabled:opacity-50 transition-all hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-1 active:translate-x-1"
          style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
        >
          Câu trước
        </button>

        {!isSubmitted ? (
          currentQuestionIdx === questionsToDisplay.length - 1 ? (
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="border-[3px] border-black bg-[#FF6B35] text-white px-8 py-3 font-sans disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-1 active:translate-x-1 flex items-center gap-2"
              style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
            >
              {submitting && <div className="w-4 h-4 border-[2px] border-white border-t-transparent rounded-full animate-spin"></div>}
              Nộp bài
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="border-[3px] border-black bg-[#FF6B35] text-white px-6 py-3 font-sans transition-all hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-1 active:translate-x-1"
              style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
            >
              Câu tiếp
            </button>
          )
        ) : (
          <button 
            onClick={handleNext}
            disabled={currentQuestionIdx === questionsToDisplay.length - 1}
            className="border-[3px] border-black bg-white text-[#0A1628] px-6 py-3 font-sans disabled:opacity-50 transition-all hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-1 active:translate-x-1"
            style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
          >
            Câu tiếp
          </button>
        )}
      </div>
    </div>
  );
}

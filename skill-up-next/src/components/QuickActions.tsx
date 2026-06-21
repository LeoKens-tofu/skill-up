'use client';
import { useEffect, useRef, useState } from "react";
import { Timer, CheckCircle2, Play, Pause, RotateCcw, Sparkles, Flame, X } from "lucide-react";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

export default function QuickActions({ isDark = false }: { isDark?: boolean }) {
  const [pomoOpen, setPomoOpen] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (running && seconds > 0) {
      timerRef.current = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    }
    if (seconds === 0) setRunning(false);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [running, seconds]);

  const text = isDark ? "#FFF8F0" : "#0A1628";
  const muted = isDark ? "rgba(255,248,240,0.6)" : "rgba(10,22,40,0.6)";

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const pct = (1 - seconds / (25 * 60)) * 100;

  const onCheckIn = () => {
    if (checkedIn) return;
    setCheckedIn(true);
    setShowReward(true);
    setTimeout(() => setShowReward(false), 2500);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Pomodoro */}
        <button
          onClick={() => setPomoOpen(true)}
          className="border-[4px] border-black bg-[#FF6B35] text-white p-5 text-left hover:-translate-y-1 hover:-translate-x-1 transition-transform flex items-center gap-4"
          style={{ boxShadow: SHADOW }}
        >
          <div className="w-14 h-14 border-[3px] border-black bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
            <Timer size={28} className="text-[#FF6B35]" />
          </div>
          <div className="flex-1">
            <p className="font-sans text-xs uppercase tracking-wider opacity-90" style={{ fontWeight: 700 }}>
              Tập trung
            </p>
            <p className="font-serif" style={{ fontWeight: 700, fontSize: "1.15rem" }}>
              Bắt đầu Pomodoro 25 phút
            </p>
            <p className="font-sans text-xs opacity-90 mt-0.5" style={{ fontWeight: 500 }}>
              +25 XP khi hoàn thành
            </p>
          </div>
        </button>

        {/* Check-in */}
        <button
          onClick={onCheckIn}
          disabled={checkedIn}
          className="border-[4px] border-black p-5 text-left hover:-translate-y-1 hover:-translate-x-1 transition-transform flex items-center gap-4 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          style={{
            backgroundColor: checkedIn ? "#16A34A" : isDark ? "#11203A" : "#FFF8F0",
            color: checkedIn ? "#FFFFFF" : text,
            boxShadow: SHADOW,
          }}
        >
          <div
            className="w-14 h-14 border-[3px] border-black flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: checkedIn ? "#FFF8F0" : "#FF6B35" }}
          >
            {checkedIn ? (
              <CheckCircle2 size={28} className="text-[#16A34A]" />
            ) : (
              <Flame size={28} className="text-white" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-sans text-xs uppercase tracking-wider opacity-90" style={{ fontWeight: 700 }}>
              {checkedIn ? "Đã điểm danh" : "Streak hôm nay"}
            </p>
            <p className="font-serif" style={{ fontWeight: 700, fontSize: "1.15rem" }}>
              {checkedIn ? "Streak +1 ngày!" : "Check-in điểm danh"}
            </p>
            <p
              className="font-sans text-xs mt-0.5"
              style={{ fontWeight: 500, color: checkedIn ? "#FFFFFFCC" : muted }}
            >
              {checkedIn ? "Quay lại vào ngày mai" : "+10 XP · giữ chuỗi 14 ngày"}
            </p>
          </div>
        </button>

        {/* Quick quiz */}
        <button
          className="border-[4px] border-black bg-[#0A1628] text-white p-5 text-left hover:-translate-y-1 hover:-translate-x-1 transition-transform flex items-center gap-4"
          style={{ boxShadow: SHADOW }}
        >
          <div className="w-14 h-14 border-[3px] border-black bg-[#FFD166] flex items-center justify-center flex-shrink-0">
            <Sparkles size={28} className="text-[#0A1628]" />
          </div>
          <div className="flex-1">
            <p className="font-sans text-xs uppercase tracking-wider text-[#FFD166]" style={{ fontWeight: 700 }}>
              Thử thách 5 phút
            </p>
            <p className="font-serif" style={{ fontWeight: 700, fontSize: "1.15rem" }}>
              Quiz nhanh hôm nay
            </p>
            <p className="font-sans text-xs text-white/70 mt-0.5" style={{ fontWeight: 500 }}>
              5 câu · +30 XP nếu đạt 4/5
            </p>
          </div>
        </button>
      </div>

      {/* Pomodoro modal */}
      {pomoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPomoOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="border-[4px] border-black bg-[#FFF8F0] dark:bg-[#11203A] w-full max-w-md"
            style={{ boxShadow: SHADOW }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b-[3px] border-black bg-[#FF6B35]">
              <div className="flex items-center gap-2">
                <Timer size={20} className="text-white" />
                <p className="font-serif text-white" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  Pomodoro
                </p>
              </div>
              <button
                onClick={() => setPomoOpen(false)}
                className="w-8 h-8 border-[3px] border-black bg-[#FFF8F0] flex items-center justify-center hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
              >
                <X size={16} className="text-[#0A1628]" />
              </button>
            </div>
            <div className="p-8 text-center">
              <div
                className="font-serif mb-4 leading-none"
                style={{ fontWeight: 700, fontSize: "5rem", color: text }}
              >
                {mm}:{ss}
              </div>
              <div className="w-full h-3 border-[2px] border-black bg-white dark:bg-[#0A1628] overflow-hidden mb-6">
                <div className="h-full bg-[#FF6B35]" style={{ width: `${pct}%` }}></div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setRunning((r) => !r)}
                  className="flex items-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-5 py-2.5 font-sans hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                  style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
                >
                  {running ? <Pause size={18} /> : <Play size={18} fill="white" />}
                  {running ? "Tạm dừng" : "Bắt đầu"}
                </button>
                <button
                  onClick={() => {
                    setRunning(false);
                    setSeconds(25 * 60);
                  }}
                  className="flex items-center gap-2 border-[3px] border-black bg-[#FFF8F0] dark:bg-[#0A1628] text-[#0A1628] dark:text-[#FFF8F0] px-5 py-2.5 font-sans hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                  style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
                >
                  <RotateCcw size={18} /> Reset
                </button>
              </div>
              <p className="font-sans text-xs mt-5" style={{ fontWeight: 500, color: muted }}>
                Hoàn thành phiên Pomodoro để nhận <span className="text-[#FF6B35]">+25 XP</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reward toast */}
      {showReward && (
        <div
          className="fixed top-24 right-8 z-50 border-[4px] border-black bg-[#16A34A] text-white px-5 py-3 flex items-center gap-3"
          style={{ boxShadow: SHADOW }}
        >
          <div className="w-10 h-10 border-[3px] border-black bg-[#FFF8F0] flex items-center justify-center">
            <Flame size={20} className="text-[#FF6B35]" />
          </div>
          <div>
            <p className="font-serif" style={{ fontWeight: 700 }}>
              +10 XP · Streak 15 ngày!
            </p>
            <p className="font-sans text-xs opacity-90" style={{ fontWeight: 500 }}>
              Tuyệt vời, tiếp tục giữ phong độ
            </p>
          </div>
        </div>
      )}
    </>
  );
}


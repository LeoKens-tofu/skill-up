'use client';
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Plus, BookOpen, CalendarClock } from "lucide-react";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

type Event = {
  id: number;
  date: string; // YYYY-MM-DD
  title: string;
  type: "class" | "deadline" | "exam" | "event";
  time: string;
  course?: string;
};

const events: Event[] = [
  { id: 1, date: "2026-06-08", title: "Lập trình Web", type: "class", time: "07:30 - 09:50", course: "SWP391" },
  { id: 2, date: "2026-06-09", title: "Quiz Chương 4 — CSDL", type: "deadline", time: "23:59", course: "DBI202" },
  { id: 3, date: "2026-06-10", title: "Thiết kế UI/UX", type: "class", time: "10:00 - 12:20", course: "PRU212" },
  { id: 4, date: "2026-06-12", title: "Bài tập lớn SWP391", type: "deadline", time: "23:59", course: "SWP391" },
  { id: 5, date: "2026-06-15", title: "Thi giữa kỳ DBI202", type: "exam", time: "13:00 - 14:30", course: "DBI202" },
  { id: 6, date: "2026-06-17", title: "Workshop React Server Components", type: "event", time: "18:00 - 20:00" },
  { id: 7, date: "2026-06-20", title: "Báo cáo nhóm — Kỹ năng mềm", type: "deadline", time: "23:59", course: "SSL101c" },
  { id: 8, date: "2026-06-22", title: "Lập trình Web", type: "class", time: "07:30 - 09:50", course: "SWP391" },
  { id: 9, date: "2026-06-25", title: "Thuyết trình cuối kỳ UI/UX", type: "deadline", time: "23:59", course: "PRU212" },
  { id: 10, date: "2026-06-07", title: "Pomodoro 25 phút — Ôn tập", type: "event", time: "20:00" },
];

const typeColors: Record<Event["type"], string> = {
  class: "#0A1628",
  deadline: "#991B1B",
  exam: "#FF6B35",
  event: "#16A34A",
};
const typeLabel: Record<Event["type"], string> = {
  class: "Lớp học",
  deadline: "Deadline",
  exam: "Thi",
  event: "Sự kiện",
};

export default function Calendar({ isDark = false }: { isDark?: boolean }) {
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(new Date(2026, 5, 1)); // June 2026

  const text = isDark ? "#FFF8F0" : "#0A1628";
  const muted = isDark ? "rgba(255,248,240,0.6)" : "rgba(10,22,40,0.6)";
  const cardBg = isDark ? "#11203A" : "#FFF8F0";
  const innerBg = isDark ? "#0A1628" : "#FFFFFF";

  const today = new Date(2026, 5, 7);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekDay = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startWeekDay + daysInMonth) / 7) * 7;

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ];
  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const eventsForDate = (d: number) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return events.filter((e) => e.date === key);
  };

  const upcomingEvents = [...events]
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <p className="font-sans max-w-3xl" style={{ fontWeight: 500, color: muted }}>
        Lịch học, deadline và sự kiện trong tháng. Kéo thả để lên kế hoạch ôn tập của riêng bạn.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="border-[3px] border-black bg-[#FFF8F0] dark:bg-[#11203A] p-2.5 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
            style={{ boxShadow: SHADOW_SM }}
          >
            <ChevronLeft size={18} className="text-[#0A1628] dark:text-[#FFF8F0]" />
          </button>
          <div
            className="border-[3px] border-black bg-[#FF6B35] text-white px-5 py-2.5 font-serif"
            style={{ boxShadow: SHADOW_SM, fontWeight: 700, fontSize: "1.2rem" }}
          >
            {monthNames[month]} {year}
          </div>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="border-[3px] border-black bg-[#FFF8F0] dark:bg-[#11203A] p-2.5 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
            style={{ boxShadow: SHADOW_SM }}
          >
            <ChevronRight size={18} className="text-[#0A1628] dark:text-[#FFF8F0]" />
          </button>
          <button
            onClick={() => setCursor(new Date(today))}
            className="border-[3px] border-black bg-[#0A1628] text-[#FF6B35] px-4 py-2.5 font-sans text-sm hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
            style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
          >
            Hôm nay
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border-[3px] border-black" style={{ boxShadow: SHADOW_SM }}>
            {(["month", "week"] as const).map((v, i) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="font-sans text-sm px-4 py-2"
                style={{
                  backgroundColor: view === v ? "#FF6B35" : isDark ? "#11203A" : "#FFF8F0",
                  color: view === v ? "#FFFFFF" : text,
                  fontWeight: 700,
                  borderRight: i === 0 ? "3px solid black" : "none",
                }}
              >
                {v === "month" ? "Tháng" : "Tuần"}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-4 py-2.5 font-sans text-sm hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
            style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
          >
            <Plus size={16} /> Sự kiện mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Month grid */}
        <div
          className="border-[4px] border-black"
          style={{ backgroundColor: cardBg, boxShadow: SHADOW }}
        >
          <div className="grid grid-cols-7 border-b-[3px] border-black">
            {weekDays.map((d, i) => (
              <div
                key={d}
                className="px-3 py-2 font-sans text-xs uppercase tracking-wider text-center"
                style={{
                  fontWeight: 700,
                  color: i >= 5 ? "#FF6B35" : text,
                  borderRight: i < 6 ? "2px solid black" : "none",
                }}
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: totalCells }).map((_, idx) => {
              const dayNum = idx - startWeekDay + 1;
              const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
              const isToday =
                inMonth &&
                dayNum === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
              const dayEvents = inMonth ? eventsForDate(dayNum) : [];
              return (
                <div
                  key={idx}
                  className="min-h-[110px] p-2"
                  style={{
                    backgroundColor: isToday ? (isDark ? "#3A1A10" : "#FFE4D6") : "transparent",
                    borderRight: (idx + 1) % 7 !== 0 ? "2px solid black" : "none",
                    borderBottom: idx < totalCells - 7 ? "2px solid black" : "none",
                    opacity: inMonth ? 1 : 0.35,
                  }}
                >
                  {inMonth && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="font-serif"
                          style={{
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: isToday ? "#FF6B35" : text,
                          }}
                        >
                          {dayNum}
                        </span>
                        {isToday && (
                          <span
                            className="font-sans text-[9px] uppercase tracking-wider px-1 py-0.5 border-[1.5px] border-black bg-[#FF6B35] text-white"
                            style={{ fontWeight: 700 }}
                          >
                            Today
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((e) => (
                          <div
                            key={e.id}
                            className="font-sans text-[10px] px-1.5 py-0.5 border-[1.5px] border-black text-white truncate cursor-pointer"
                            style={{ backgroundColor: typeColors[e.type], fontWeight: 700 }}
                            title={`${e.title} • ${e.time}`}
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="font-sans text-[10px]" style={{ fontWeight: 600, color: muted }}>
                            +{dayEvents.length - 3} khác
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: legend + upcoming */}
        <div className="space-y-4">
          <div
            className="border-[4px] border-black p-4"
            style={{ backgroundColor: cardBg, boxShadow: SHADOW }}
          >
            <p className="font-sans text-xs uppercase tracking-wider mb-3" style={{ fontWeight: 700, color: muted }}>
              Chú thích
            </p>
            <div className="space-y-2">
              {(Object.keys(typeColors) as Event["type"][]).map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 border-[2px] border-black"
                    style={{ backgroundColor: typeColors[k] }}
                  ></span>
                  <span className="font-sans text-sm" style={{ fontWeight: 600, color: text }}>
                    {typeLabel[k]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="border-[4px] border-black"
            style={{ backgroundColor: cardBg, boxShadow: SHADOW }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b-[3px] border-black">
              <CalendarClock size={18} className="text-[#FF6B35]" />
              <p className="font-serif" style={{ fontWeight: 700, fontSize: "1rem", color: text }}>
                Sắp tới
              </p>
            </div>
            <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
              {upcomingEvents.map((e) => (
                <div
                  key={e.id}
                  className="border-[3px] border-black p-3"
                  style={{ backgroundColor: innerBg, boxShadow: SHADOW_SM }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="font-sans text-[10px] px-1.5 py-0.5 border-[2px] border-black text-white"
                      style={{ backgroundColor: typeColors[e.type], fontWeight: 700 }}
                    >
                      {typeLabel[e.type]}
                    </span>
                    {e.course && (
                      <span
                        className="font-sans text-[10px] px-1.5 py-0.5 border-[2px] border-black bg-[#0A1628] text-[#FF6B35]"
                        style={{ fontWeight: 700 }}
                      >
                        {e.course}
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-sm" style={{ fontWeight: 700, color: text }}>
                    {e.title}
                  </p>
                  <p className="font-sans text-xs mt-1 flex items-center gap-1" style={{ fontWeight: 500, color: muted }}>
                    <CalIcon size={12} />
                    {new Date(e.date).toLocaleDateString("vi-VN")} · {e.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Calendar as CalIcon, Plus, CalendarClock, Loader2,
  X, Trash2, Check, ExternalLink, BookOpen, Clock,
} from "lucide-react";
import { toast } from "sonner";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const API = process.env.NEXT_PUBLIC_API_URL;

type EventType = "study" | "reminder" | "goal" | "milestone" | "deadline";
type SchedEvent = {
  _id: string;
  title: string;
  description?: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  courseId?: string | null;
  courseTitle?: string | null;
  lessonId?: string | null;
  isDone: boolean;
  editable: boolean;
};

const typeColors: Record<EventType, string> = {
  study: "#0A1628",
  reminder: "#16A34A",
  goal: "#FF6B35",
  milestone: "#7C3AED",
  deadline: "#DC2626",
};
const typeLabel: Record<EventType, string> = {
  study: "Buổi học",
  reminder: "Nhắc việc",
  goal: "Mục tiêu",
  milestone: "Mốc",
  deadline: "Hạn nộp",
};

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const monthNames = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];
const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function Calendar({ isDark = false }: { isDark?: boolean }) {
  const router = useRouter();
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [events, setEvents] = useState<SchedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; event?: SchedEvent; date?: string } | null>(null);

  const text = isDark ? "#FFF8F0" : "#0A1628";
  const muted = isDark ? "rgba(255,248,240,0.6)" : "rgba(10,22,40,0.6)";
  const cardBg = isDark ? "#11203A" : "#FFF8F0";
  const innerBg = isDark ? "#0A1628" : "#FFFFFF";

  const today = new Date();
  const todayKey = toKey(today);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // Khoảng ngày cần tải theo view hiện tại
  const range = useMemo(() => {
    if (view === "week") {
      const wd = (cursor.getDay() + 6) % 7; // Mon=0
      const start = new Date(cursor);
      start.setDate(cursor.getDate() - wd);
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
      return { days, from: toKey(days[0]), to: toKey(days[6]) };
    }
    const firstDay = new Date(year, month, 1);
    const startWeekDay = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startWeekDay + daysInMonth) / 7) * 7;
    const days = Array.from({ length: totalCells }, (_, i) => new Date(year, month, 1 - startWeekDay + i));
    return { days, from: toKey(days[0]), to: toKey(days[days.length - 1]), startWeekDay, daysInMonth, totalCells };
  }, [view, cursor, year, month]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ from: range.from, to: range.to });
      const res = await fetch(`${API}/client/student/schedule?${q}`, { credentials: "include" });
      const json = await res.json();
      if (json.code === "success") setEvents(json.data);
      else toast.error(json.message || "Không tải được lịch");
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, SchedEvent[]>();
    events.forEach((e) => {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    });
    // sắp theo giờ bắt đầu (mục không giờ xuống cuối)
    map.forEach((list) =>
      list.sort((a, b) => (a.startTime || "99:99").localeCompare(b.startTime || "99:99"))
    );
    return map;
  }, [events]);

  const upcoming = useMemo(
    () =>
      [...events]
        .filter((e) => e.date >= todayKey && !e.isDone)
        .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || "").localeCompare(b.startTime || ""))
        .slice(0, 6),
    [events, todayKey]
  );

  const headerLabel =
    view === "week"
      ? `${new Date(range.days[0]).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} – ${new Date(range.days[6]).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}`
      : `${monthNames[month]} ${year}`;

  const goPrev = () => setCursor(view === "week" ? new Date(year, month, cursor.getDate() - 7) : new Date(year, month - 1, 1));
  const goNext = () => setCursor(view === "week" ? new Date(year, month, cursor.getDate() + 7) : new Date(year, month + 1, 1));

  const EventChip = ({ e }: { e: SchedEvent }) => {
    const clickable = e.editable || e.type === "deadline";
    const dim = e.isDone && (e.editable || e.type === "deadline");
    const handle = (ev: any) => {
      if (e.type === "deadline") { ev.stopPropagation(); router.push("/student/deadline"); return; }
      if (e.editable) { ev.stopPropagation(); setModal({ mode: "edit", event: e }); }
    };
    return (
      <div
        onClick={handle}
        className={`font-sans text-[10px] px-1.5 py-0.5 border-[1.5px] border-black text-white truncate flex items-center gap-1 ${clickable ? "cursor-pointer hover:opacity-90" : ""}`}
        style={{ backgroundColor: typeColors[e.type], fontWeight: 700, opacity: dim ? 0.5 : 1 }}
        title={`${e.title}${e.startTime ? ` • ${e.startTime}${e.endTime ? "–" + e.endTime : ""}` : ""}`}
      >
        {e.startTime && <span className="opacity-80">{e.startTime}</span>}
        <span className="truncate" style={{ textDecoration: dim ? "line-through" : "none" }}>{e.title}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <p className="font-sans max-w-3xl" style={{ fontWeight: 500, color: muted }}>
        Lịch học cá nhân của bạn. Tự lên kế hoạch buổi học, nhắc việc và mục tiêu — gắn với khóa học bạn đang theo.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="border-[3px] border-black p-2.5 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" style={{ backgroundColor: cardBg, boxShadow: SHADOW_SM }}>
            <ChevronLeft size={18} style={{ color: text }} />
          </button>
          <div className="border-[3px] border-black bg-[#FF6B35] text-white px-5 py-2.5 font-serif min-w-[170px] text-center" style={{ boxShadow: SHADOW_SM, fontWeight: 700, fontSize: "1.2rem" }}>
            {headerLabel}
          </div>
          <button onClick={goNext} className="border-[3px] border-black p-2.5 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" style={{ backgroundColor: cardBg, boxShadow: SHADOW_SM }}>
            <ChevronRight size={18} style={{ color: text }} />
          </button>
          <button onClick={() => setCursor(new Date())} className="border-[3px] border-black bg-[#0A1628] text-[#FF6B35] px-4 py-2.5 font-sans text-sm hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
            Hôm nay
          </button>
          {loading && <Loader2 size={18} className="animate-spin" style={{ color: muted }} />}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border-[3px] border-black" style={{ boxShadow: SHADOW_SM }}>
            {(["month", "week"] as const).map((v, i) => (
              <button key={v} onClick={() => setView(v)} className="font-sans text-sm px-4 py-2"
                style={{ backgroundColor: view === v ? "#FF6B35" : cardBg, color: view === v ? "#FFFFFF" : text, fontWeight: 700, borderRight: i === 0 ? "3px solid black" : "none" }}>
                {v === "month" ? "Tháng" : "Tuần"}
              </button>
            ))}
          </div>
          <button onClick={() => setModal({ mode: "create", date: todayKey })} className="flex items-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-4 py-2.5 font-sans text-sm hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
            <Plus size={16} /> Sự kiện mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar */}
        <div className="border-[4px] border-black" style={{ backgroundColor: cardBg, boxShadow: SHADOW }}>
          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b-[3px] border-black">
            {weekDays.map((d, i) => (
              <div key={d} className="px-3 py-2 font-sans text-xs uppercase tracking-wider text-center"
                style={{ fontWeight: 700, color: i >= 5 ? "#FF6B35" : text, borderRight: i < 6 ? "2px solid black" : "none" }}>
                {d}
              </div>
            ))}
          </div>

          {view === "month" ? (
            <div className="grid grid-cols-7">
              {range.days.map((d, idx) => {
                const inMonth = d.getMonth() === month;
                const key = toKey(d);
                const isToday = key === todayKey;
                const dayEvents = eventsByDate.get(key) || [];
                return (
                  <div key={idx} onClick={() => setModal({ mode: "create", date: key })}
                    className="min-h-[110px] p-2 cursor-pointer hover:bg-black/[0.03] transition-colors"
                    style={{
                      backgroundColor: isToday ? (isDark ? "#3A1A10" : "#FFE4D6") : "transparent",
                      borderRight: (idx + 1) % 7 !== 0 ? "2px solid black" : "none",
                      borderBottom: idx < range.days.length - 7 ? "2px solid black" : "none",
                      opacity: inMonth ? 1 : 0.35,
                    }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif" style={{ fontWeight: 700, fontSize: "0.95rem", color: isToday ? "#FF6B35" : text }}>{d.getDate()}</span>
                      {isToday && <span className="font-sans text-[9px] uppercase tracking-wider px-1 py-0.5 border-[1.5px] border-black bg-[#FF6B35] text-white" style={{ fontWeight: 700 }}>Today</span>}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((e) => <EventChip key={e._id} e={e} />)}
                      {dayEvents.length > 3 && <p className="font-sans text-[10px]" style={{ fontWeight: 600, color: muted }}>+{dayEvents.length - 3} khác</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {range.days.map((d, idx) => {
                const key = toKey(d);
                const isToday = key === todayKey;
                const dayEvents = eventsByDate.get(key) || [];
                return (
                  <div key={idx} onClick={() => setModal({ mode: "create", date: key })}
                    className="min-h-[420px] p-2 cursor-pointer hover:bg-black/[0.03] transition-colors"
                    style={{
                      backgroundColor: isToday ? (isDark ? "#3A1A10" : "#FFE4D6") : "transparent",
                      borderRight: (idx + 1) % 7 !== 0 ? "2px solid black" : "none",
                    }}>
                    <div className="text-center mb-2 pb-2 border-b-[2px] border-black/20">
                      <span className="font-serif block" style={{ fontWeight: 700, fontSize: "1.35rem", color: isToday ? "#FF6B35" : text }}>{d.getDate()}</span>
                    </div>
                    <div className="space-y-1.5">
                      {dayEvents.map((e) => <EventChip key={e._id} e={e} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="border-[4px] border-black p-4" style={{ backgroundColor: cardBg, boxShadow: SHADOW }}>
            <p className="font-sans text-xs uppercase tracking-wider mb-3" style={{ fontWeight: 700, color: muted }}>Chú thích</p>
            <div className="space-y-2">
              {(Object.keys(typeColors) as EventType[]).map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="w-5 h-5 border-[2px] border-black" style={{ backgroundColor: typeColors[k] }} />
                  <span className="font-sans text-sm" style={{ fontWeight: 600, color: text }}>{typeLabel[k]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-[4px] border-black" style={{ backgroundColor: cardBg, boxShadow: SHADOW }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b-[3px] border-black">
              <CalendarClock size={18} className="text-[#FF6B35]" />
              <p className="font-serif" style={{ fontWeight: 700, fontSize: "1rem", color: text }}>Sắp tới</p>
            </div>
            <div className="p-3 space-y-2 max-h-[440px] overflow-y-auto">
              {upcoming.length === 0 ? (
                <p className="font-sans text-sm text-center py-6" style={{ fontWeight: 500, color: muted }}>
                  Chưa có kế hoạch nào sắp tới trong khoảng này.
                </p>
              ) : (
                upcoming.map((e) => (
                  <div key={e._id}
                    onClick={() => { if (e.type === "deadline") router.push("/student/deadline"); else if (e.editable) setModal({ mode: "edit", event: e }); }}
                    className={`border-[3px] border-black p-3 ${e.editable || e.type === "deadline" ? "cursor-pointer hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" : ""}`} style={{ backgroundColor: innerBg, boxShadow: SHADOW_SM }}>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-sans text-[10px] px-1.5 py-0.5 border-[2px] border-black text-white" style={{ backgroundColor: typeColors[e.type], fontWeight: 700 }}>{typeLabel[e.type]}</span>
                      {e.courseTitle && <span className="font-sans text-[10px] px-1.5 py-0.5 border-[2px] border-black bg-[#0A1628] text-[#FF6B35] truncate max-w-[140px]" style={{ fontWeight: 700 }}>{e.courseTitle}</span>}
                    </div>
                    <p className="font-sans text-sm" style={{ fontWeight: 700, color: text }}>{e.title}</p>
                    <p className="font-sans text-xs mt-1 flex items-center gap-1" style={{ fontWeight: 500, color: muted }}>
                      <CalIcon size={12} />
                      {new Date(e.date).toLocaleDateString("vi-VN")}{e.startTime ? ` · ${e.startTime}${e.endTime ? "–" + e.endTime : ""}` : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <EventModal
          mode={modal.mode}
          event={modal.event}
          defaultDate={modal.date}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchEvents(); }}
          onGoLesson={(courseId, lessonId) => {
            router.push(`/student/course?course=${courseId}${lessonId ? `&lesson=${lessonId}` : ""}`);
          }}
        />
      )}
    </div>
  );
}

// ---- Modal tạo/sửa sự kiện ----
type LessonOpt = { _id: string; title: string; chapterTitle: string };

function EventModal({
  mode, event, defaultDate, onClose, onSaved, onGoLesson,
}: {
  mode: "create" | "edit";
  event?: SchedEvent;
  defaultDate?: string;
  onClose: () => void;
  onSaved: () => void;
  onGoLesson: (courseId: string, lessonId?: string) => void;
}) {
  const [type, setType] = useState<Exclude<EventType, "milestone">>(
    (event && event.type !== "milestone" ? event.type : "study")
  );
  const [title, setTitle] = useState(event?.title || "");
  const [date, setDate] = useState(event?.date || defaultDate || toKey(new Date()));
  const [startTime, setStartTime] = useState(event?.startTime || "");
  const [endTime, setEndTime] = useState(event?.endTime || "");
  const [description, setDescription] = useState(event?.description || "");
  const [courseId, setCourseId] = useState<string>(event?.courseId || "");
  const [lessonId, setLessonId] = useState<string>(event?.lessonId || "");

  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<LessonOpt[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [saving, setSaving] = useState(false);

  // Danh sách khóa đã ghi danh
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/client/student/courses/enrolled`, { credentials: "include" });
        const json = await res.json();
        if (json.code === "success") setCourses(json.data);
      } catch { /* im lặng */ }
    })();
  }, []);

  // Tải bài học của khóa đang chọn
  useEffect(() => {
    if (!courseId) { setLessons([]); return; }
    setLoadingLessons(true);
    (async () => {
      try {
        const res = await fetch(`${API}/client/student/courses/${courseId}`, { credentials: "include" });
        const json = await res.json();
        if (json.code === "success") {
          const flat: LessonOpt[] = [];
          (json.data.chapters || []).forEach((ch: any) =>
            (ch.lessons || []).forEach((ls: any) =>
              flat.push({ _id: ls._id, title: ls.title, chapterTitle: ch.title })
            )
          );
          setLessons(flat);
        }
      } catch { /* im lặng */ } finally {
        setLoadingLessons(false);
      }
    })();
  }, [courseId]);

  const save = async () => {
    if (!title.trim()) { toast.error("Vui lòng nhập tiêu đề"); return; }
    if (!date) { toast.error("Vui lòng chọn ngày"); return; }
    setSaving(true);
    const body: any = {
      title: title.trim(), type, date,
      startTime: type === "study" ? startTime : "",
      endTime: type === "study" ? endTime : "",
      description,
      courseId: courseId || null,
      lessonId: courseId && lessonId ? lessonId : null,
    };
    try {
      const url = mode === "create"
        ? `${API}/client/student/schedule`
        : `${API}/client/student/schedule/${event!._id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.code === "success") { toast.success(json.message); onSaved(); }
      else toast.error(json.message || "Không lưu được");
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally { setSaving(false); }
  };

  const toggleDone = async () => {
    if (!event) return;
    try {
      const res = await fetch(`${API}/client/student/schedule/${event._id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDone: !event.isDone }),
      });
      const json = await res.json();
      if (json.code === "success") { toast.success(event.isDone ? "Đã bỏ đánh dấu" : "Đã hoàn thành"); onSaved(); }
      else toast.error(json.message || "Lỗi");
    } catch { toast.error("Lỗi kết nối máy chủ"); }
  };

  const remove = async () => {
    if (!event) return;
    try {
      const res = await fetch(`${API}/client/student/schedule/${event._id}`, { method: "DELETE", credentials: "include" });
      const json = await res.json();
      if (json.code === "success") { toast.success("Đã xóa sự kiện"); onSaved(); }
      else toast.error(json.message || "Lỗi");
    } catch { toast.error("Lỗi kết nối máy chủ"); }
  };

  const TYPES: { id: Exclude<EventType, "milestone">; label: string }[] = [
    { id: "study", label: "Buổi học" },
    { id: "reminder", label: "Nhắc việc" },
    { id: "goal", label: "Mục tiêu" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-3 -right-3 z-20 w-10 h-10 border-[3px] border-black bg-[#991B1B] text-white flex items-center justify-center hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform" style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}>
          <X size={20} strokeWidth={3} />
        </button>

        <div className="border-[4px] border-black bg-[#FFF8F0] max-h-[90vh] overflow-y-auto" style={{ boxShadow: SHADOW }}>
        <div className="p-5 border-b-[4px] border-black bg-white sticky top-0 z-10">
          <h3 className="font-serif text-[#0A1628]" style={{ fontWeight: 700, fontSize: "1.35rem" }}>
            {mode === "create" ? "Thêm sự kiện" : "Sửa sự kiện"}
          </h3>
        </div>

        <div className="p-5 space-y-4">
          {/* Loại */}
          <div>
            <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 block mb-2" style={{ fontWeight: 700 }}>Loại</label>
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button key={t.id} onClick={() => setType(t.id)}
                  className="flex-1 border-[3px] border-black py-2 font-sans text-sm transition-transform hover:-translate-y-0.5"
                  style={{ backgroundColor: type === t.id ? typeColors[t.id] : "#fff", color: type === t.id ? "#fff" : "#0A1628", fontWeight: 700, boxShadow: SHADOW_SM }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tiêu đề */}
          <div>
            <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 block mb-2" style={{ fontWeight: 700 }}>Tiêu đề</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Vd: Học Chương 3 – React"
              className="w-full border-[3px] border-black bg-white px-3 py-2 font-sans outline-none focus:-translate-y-0.5 transition-transform" />
          </div>

          {/* Ngày + giờ */}
          <div className={`grid gap-3 ${type === "study" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1"}`}>
            <div className="min-w-0">
              <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 block mb-2" style={{ fontWeight: 700 }}>Ngày</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full border-[3px] border-black bg-white px-3 py-2 font-sans outline-none" />
            </div>
            {type === "study" && (
              <>
                <div className="min-w-0">
                  <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 mb-2 flex items-center gap-1" style={{ fontWeight: 700 }}><Clock size={12} /> Từ</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border-[3px] border-black bg-white px-2 py-2 font-sans outline-none" />
                </div>
                <div className="min-w-0">
                  <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 block mb-2" style={{ fontWeight: 700 }}>Đến</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full border-[3px] border-black bg-white px-2 py-2 font-sans outline-none" />
                </div>
              </>
            )}
          </div>

          {/* Gắn khóa/bài */}
          <div>
            <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 block mb-2 flex items-center gap-1" style={{ fontWeight: 700 }}><BookOpen size={12} /> Gắn khóa học (tùy chọn)</label>
            <select value={courseId} onChange={(e) => { setCourseId(e.target.value); setLessonId(""); }}
              className="w-full border-[3px] border-black bg-white px-3 py-2 font-sans outline-none cursor-pointer">
              <option value="">— Không gắn —</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
            {courseId && (
              <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} disabled={loadingLessons}
                className="w-full border-[3px] border-black bg-white px-3 py-2 font-sans outline-none cursor-pointer mt-2">
                <option value="">{loadingLessons ? "Đang tải bài học..." : "— Cả khóa (không chọn bài) —"}</option>
                {lessons.map((l) => <option key={l._id} value={l._id}>{l.chapterTitle} › {l.title}</option>)}
              </select>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 block mb-2" style={{ fontWeight: 700 }}>Ghi chú (tùy chọn)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full border-[3px] border-black bg-white px-3 py-2 font-sans outline-none resize-none" />
          </div>

          {/* Deep-link khi đang sửa và có gắn khóa */}
          {mode === "edit" && event?.courseId && (
            <button onClick={() => onGoLesson(event.courseId as string, event.lessonId || undefined)}
              className="w-full flex items-center justify-center gap-2 border-[3px] border-black bg-[#0A1628] text-[#FF6B35] py-2.5 font-sans hover:-translate-y-0.5 transition-transform" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
              <ExternalLink size={16} /> {event.lessonId ? "Đi tới bài học" : "Đi tới khóa học"}
            </button>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t-[3px] border-dashed border-black/20 flex items-center gap-3">
          {mode === "edit" && (
            <>
              <button onClick={remove} title="Xóa" className="border-[3px] border-black bg-[#991B1B] text-white p-2.5 hover:-translate-y-0.5 transition-transform" style={{ boxShadow: SHADOW_SM }}>
                <Trash2 size={18} />
              </button>
              <button onClick={toggleDone}
                className="border-[3px] border-black py-2.5 px-4 flex items-center gap-2 font-sans hover:-translate-y-0.5 transition-transform"
                style={{ backgroundColor: event?.isDone ? "#fff" : "#16A34A", color: event?.isDone ? "#0A1628" : "#fff", boxShadow: SHADOW_SM, fontWeight: 700 }}>
                <Check size={16} /> {event?.isDone ? "Bỏ đánh dấu" : "Hoàn thành"}
              </button>
            </>
          )}
          <button onClick={save} disabled={saving}
            className="ml-auto border-[3px] border-black bg-[#FF6B35] text-white py-2.5 px-6 flex items-center gap-2 font-sans hover:-translate-y-0.5 transition-transform disabled:opacity-60" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Lưu
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

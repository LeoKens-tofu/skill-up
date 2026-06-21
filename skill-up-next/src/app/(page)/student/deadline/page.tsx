'use client';
import { useState } from "react";
import {
  CalendarClock,
  FileWarning,
  CheckCircle2,
  Clock,
  Filter,
  ChevronRight,
  Upload,
  Eye,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

type Item = {
  id: string;
  title: string;
  course: string;
  type: "Bài tập" | "Quiz" | "Báo cáo" | "Thuyết trình";
  due: string;
  daysLeft: number;
  status: "todo" | "doing" | "done" | "late";
  weight: number;
};

const ITEMS: Item[] = [
  {
    id: "1",
    title: "Bài tập lớn — Lập trình Web với React",
    course: "SWP391",
    type: "Bài tập",
    due: "09/06/2026 — 23:59",
    daysLeft: 2,
    status: "doing",
    weight: 30,
  },
  {
    id: "2",
    title: "Quiz Chương 4 — Chuẩn hóa CSDL",
    course: "DBI202",
    type: "Quiz",
    due: "12/06/2026 — 18:00",
    daysLeft: 5,
    status: "todo",
    weight: 10,
  },
  {
    id: "3",
    title: "Báo cáo nhóm — Giao tiếp trong môi trường công sở",
    course: "SSL101c",
    type: "Báo cáo",
    due: "14/06/2026 — 23:59",
    daysLeft: 7,
    status: "todo",
    weight: 20,
  },
  {
    id: "4",
    title: "Thuyết trình cuối kỳ — Wireframe & Prototype",
    course: "PRU212",
    type: "Thuyết trình",
    due: "19/06/2026 — 09:00",
    daysLeft: 12,
    status: "todo",
    weight: 25,
  },
  {
    id: "5",
    title: "Quiz Chương 3 — Khái niệm CSDL",
    course: "DBI202",
    type: "Quiz",
    due: "05/06/2026 — 18:00",
    daysLeft: -2,
    status: "done",
    weight: 10,
  },
  {
    id: "6",
    title: "Bài tập tuần — JavaScript ES6",
    course: "SWP391",
    type: "Bài tập",
    due: "02/06/2026 — 23:59",
    daysLeft: -5,
    status: "late",
    weight: 5,
  },
];

const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "urgent", label: "Khẩn cấp" },
  { id: "week", label: "Trong tuần" },
  { id: "done", label: "Đã hoàn thành" },
  { id: "late", label: "Quá hạn" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export default function Deadlines({
  isDark = false,
}: {
  isDark?: boolean;
}) {
  const [filter, setFilter] = useState<FilterId>("all");

  const filtered = ITEMS.filter((i) => {
    if (filter === "all") return true;
    if (filter === "urgent") return i.daysLeft >= 0 && i.daysLeft <= 3;
    if (filter === "week") return i.daysLeft >= 0 && i.daysLeft <= 7;
    if (filter === "done") return i.status === "done";
    if (filter === "late") return i.status === "late";
    return true;
  }).sort((a, b) => a.daysLeft - b.daysLeft);

  const pending = ITEMS.filter(
    (i) => i.status !== "done" && i.status !== "late"
  );
  const urgent = pending.filter((i) => i.daysLeft <= 3);
  const done = ITEMS.filter((i) => i.status === "done");
  const late = ITEMS.filter((i) => i.status === "late");

  const summary = [
    {
      label: "Đang chờ",
      value: pending.length,
      icon: Clock,
      bg: isDark ? "#11203A" : "#FFF8F0",
      iconBg: "#FF6B35",
      text: isDark ? "#FFF8F0" : "#0A1628",
    },
    {
      label: "Khẩn cấp",
      value: urgent.length,
      icon: AlertTriangle,
      bg: isDark ? "#3A1A10" : "#FFE4D6",
      iconBg: "#991B1B",
      text: isDark ? "#FFB088" : "#991B1B",
    },
    {
      label: "Đã hoàn thành",
      value: done.length,
      icon: CheckCircle2,
      bg: isDark ? "#11203A" : "#FFF8F0",
      iconBg: "#0A1628",
      text: isDark ? "#FFF8F0" : "#0A1628",
    },
    {
      label: "Quá hạn",
      value: late.length,
      icon: FileWarning,
      bg: isDark ? "#11203A" : "#FFF8F0",
      iconBg: "#991B1B",
      text: isDark ? "#FFF8F0" : "#0A1628",
    },
  ];

  const chipBg = isDark ? "#11203A" : "#FFF8F0";
  const chipText = isDark ? "#FFF8F0" : "#0A1628";

  const dueTone = (i: Item) => {
    if (i.status === "late") return { bg: "#991B1B", color: "#FFFFFF" };
    if (i.status === "done") return { bg: "#065F46", color: "#FFFFFF" };
    if (i.daysLeft <= 3) return { bg: "#991B1B", color: "#FFFFFF" };
    if (i.daysLeft <= 7) return { bg: "#FF6B35", color: "#FFFFFF" };
    return { bg: "#FCD34D", color: "#0A1628" };
  };

  const dueLabel = (i: Item) => {
    if (i.status === "done") return "Đã nộp";
    if (i.status === "late" || i.daysLeft < 0)
      return `Trễ ${Math.abs(i.daysLeft)} ngày`;
    if (i.daysLeft === 0) return "Hôm nay";
    if (i.daysLeft === 1) return "Ngày mai";
    return `${i.daysLeft} ngày nữa`;
  };

  const statusBadge = (s: Item["status"]) => {
    if (s === "doing")
      return { label: "Đang làm", bg: "#FF6B35", color: "#FFFFFF" };
    if (s === "done")
      return { label: "Hoàn thành", bg: "#065F46", color: "#FFFFFF" };
    if (s === "late") return { label: "Trễ hạn", bg: "#991B1B", color: "#FFFFFF" };
    return { label: "Chưa bắt đầu", bg: chipBg, color: chipText };
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Description */}
      <p
        className="font-sans text-[#0A1628]/70 dark:text-[#FFF8F0]/70 max-w-2xl"
        style={{ fontWeight: 400 }}
      >
        Theo dõi và quản lý tất cả nhiệm vụ học tập của bạn. Sắp xếp theo mức
        độ khẩn cấp để không bỏ lỡ bất kỳ deadline nào.
      </p>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="border-[4px] border-black p-5 transition-all duration-150 hover:-translate-y-1 hover:-translate-x-1"
              style={{ backgroundColor: s.bg, boxShadow: SHADOW }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-11 h-11 border-[3px] border-black flex items-center justify-center"
                  style={{ backgroundColor: s.iconBg }}
                >
                  <Icon size={22} className="text-white" />
                </div>
              </div>
              <p
                className="font-serif"
                style={{ fontWeight: 700, fontSize: "2.25rem", color: s.text }}
              >
                {s.value}
              </p>
              <p
                className="font-sans text-sm"
                style={{ fontWeight: 600, color: s.text }}
              >
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-2 border-[3px] border-black bg-[#0A1628] text-white px-3 py-2"
          style={{ boxShadow: SHADOW_SM }}
        >
          <Filter size={16} />
          <span
            className="font-sans text-xs uppercase tracking-wider"
            style={{ fontWeight: 700 }}
          >
            Lọc
          </span>
        </div>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="border-[3px] border-black px-4 py-2 font-sans text-sm transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
              style={{
                backgroundColor: active ? "#FF6B35" : chipBg,
                color: active ? "#FFFFFF" : chipText,
                fontWeight: active ? 700 : 500,
                boxShadow: SHADOW_SM,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div
        className="border-[4px] border-black bg-[#FFF8F0] dark:bg-[#11203A]"
        style={{ boxShadow: SHADOW }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black">
          <div className="flex items-center gap-2">
            <CalendarDays size={22} className="text-[#0A1628] dark:text-[#FFF8F0]" />
            <h3
              className="font-serif text-[#0A1628] dark:text-[#FFF8F0]"
              style={{ fontWeight: 700, fontSize: "1.25rem" }}
            >
              Danh sách deadline
            </h3>
          </div>
          <span
            className="font-sans text-xs uppercase tracking-wider text-[#0A1628]/60 dark:text-[#FFF8F0]/60"
            style={{ fontWeight: 600 }}
          >
            {filtered.length} mục
          </span>
        </div>

        <div className="p-4 space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <p
                className="font-serif text-[#0A1628] dark:text-[#FFF8F0]"
                style={{ fontWeight: 700, fontSize: "1.15rem" }}
              >
                Không có deadline nào
              </p>
              <p
                className="font-sans text-[#0A1628]/60 dark:text-[#FFF8F0]/60 mt-1"
                style={{ fontWeight: 500 }}
              >
                Bộ lọc hiện tại không có kết quả.
              </p>
            </div>
          )}

          {filtered.map((i) => {
            const tone = dueTone(i);
            const sb = statusBadge(i.status);
            const isDone = i.status === "done";
            const isLate = i.status === "late";

            return (
              <div
                key={i.id}
                className="border-[3px] border-black bg-white dark:bg-[#0A1628] p-4 flex items-center gap-4 transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5"
                style={{ boxShadow: SHADOW_SM, opacity: isDone ? 0.75 : 1 }}
              >
                {/* Due badge */}
                <div
                  className="border-[3px] border-black flex flex-col items-center justify-center w-24 h-20 flex-shrink-0"
                  style={{
                    backgroundColor: tone.bg,
                    color: tone.color,
                    boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)",
                  }}
                >
                  <span
                    className="font-serif leading-none"
                    style={{ fontWeight: 700, fontSize: "1.5rem" }}
                  >
                    {i.status === "done"
                      ? "✓"
                      : i.daysLeft < 0
                      ? `-${Math.abs(i.daysLeft)}`
                      : i.daysLeft}
                  </span>
                  <span
                    className="font-sans text-[10px] uppercase tracking-wider mt-1 text-center px-1"
                    style={{ fontWeight: 700 }}
                  >
                    {dueLabel(i)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 border-[2px] border-black bg-[#0A1628] text-[#FFF8F0]"
                      style={{ fontWeight: 700 }}
                    >
                      {i.course}
                    </span>
                    <span
                      className="font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 border-[2px] border-black"
                      style={{
                        fontWeight: 700,
                        backgroundColor: chipBg,
                        color: chipText,
                      }}
                    >
                      {i.type}
                    </span>
                    <span
                      className="font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 border-[2px] border-black"
                      style={{
                        fontWeight: 700,
                        backgroundColor: sb.bg,
                        color: sb.color,
                      }}
                    >
                      {sb.label}
                    </span>
                  </div>
                  <p
                    className="font-serif text-[#0A1628] dark:text-[#FFF8F0] leading-tight"
                    style={{
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      textDecoration: isDone ? "line-through" : "none",
                    }}
                  >
                    {i.title}
                  </p>
                  <div className="flex items-center gap-4 mt-1.5 text-[#0A1628]/70 dark:text-[#FFF8F0]/70">
                    <span
                      className="font-sans text-xs flex items-center gap-1.5"
                      style={{ fontWeight: 500 }}
                    >
                      <CalendarClock size={13} />
                      {i.due}
                    </span>
                    <span
                      className="font-sans text-xs"
                      style={{ fontWeight: 500 }}
                    >
                      Trọng số {i.weight}%
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  className="border-[3px] border-black px-4 py-2.5 flex items-center gap-2 font-sans flex-shrink-0 transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1"
                  style={{
                    backgroundColor: isDone
                      ? chipBg
                      : isLate
                      ? "#991B1B"
                      : "#FF6B35",
                    color: isDone ? chipText : "#FFFFFF",
                    boxShadow: SHADOW_SM,
                    fontWeight: 700,
                  }}
                >
                  {isDone ? (
                    <>
                      <Eye size={16} />
                      Xem lại
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      {isLate ? "Nộp trễ" : "Nộp bài"}
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


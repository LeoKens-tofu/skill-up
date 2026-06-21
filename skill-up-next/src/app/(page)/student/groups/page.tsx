'use client';
import { useState } from "react";
import { Users, MessageSquare, Swords, Plus, Search, BookOpen, Crown, Send } from "lucide-react";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

const myGroups = [
  {
    id: 1,
    name: "SWP391 - Team Phoenix",
    course: "SWP391",
    members: 6,
    online: 3,
    lastMessage: "Hôm nay họp lúc 8h tối nha mn",
    lastSender: "Minh An",
    unread: 4,
    color: "#FF6B35",
  },
  {
    id: 2,
    name: "DBI202 Study Buddies",
    course: "DBI202",
    members: 12,
    online: 5,
    lastMessage: "Mai mình share flashcard chương 4",
    lastSender: "Phương Linh",
    unread: 0,
    color: "#0A1628",
  },
  {
    id: 3,
    name: "React Devs Đà Nẵng",
    course: "PRU212",
    members: 28,
    online: 11,
    lastMessage: "Có ai làm Next 14 chưa cho mình hỏi",
    lastSender: "Quốc Bảo",
    unread: 12,
    color: "#16A34A",
  },
];

const discoverGroups = [
  { id: 10, name: "AI/ML Fundamentals", members: 142, course: "AIL301", color: "#FFD166" },
  { id: 11, name: "TOEIC 800+ Challenge", members: 89, course: "ENGL", color: "#991B1B" },
  { id: 12, name: "Algorithm Daily", members: 67, course: "DSA", color: "#0A1628" },
];

const sampleMessages = [
  { id: 1, sender: "Minh An", text: "Hôm nay họp lúc 8h tối nha mn", time: "10:24", me: false },
  { id: 2, sender: "Bạn", text: "Ok mình online", time: "10:25", me: true },
  { id: 3, sender: "Phương Linh", text: "Mình chia phần code Auth nhé", time: "10:26", me: false },
  { id: 4, sender: "Bạn", text: "Mình lo Database + API", time: "10:27", me: true },
  { id: 5, sender: "Quốc Bảo", text: "Vậy mình làm UI 🎨", time: "10:28", me: false },
];

export default function StudyGroups({ isDark = false }: { isDark?: boolean }) {
  const [selected, setSelected] = useState(myGroups[0]);
  const [tab, setTab] = useState<"chat" | "flashcards" | "quiz">("chat");
  const [input, setInput] = useState("");

  const text = isDark ? "#FFF8F0" : "#0A1628";
  const muted = isDark ? "rgba(255,248,240,0.6)" : "rgba(10,22,40,0.6)";
  const cardBg = isDark ? "#11203A" : "#FFF8F0";
  const innerBg = isDark ? "#0A1628" : "#FFFFFF";

  return (
    <div className="space-y-6">
      <p className="font-sans max-w-3xl" style={{ fontWeight: 500, color: muted }}>
        Học cùng nhau hiệu quả hơn — tham gia nhóm theo môn, chat realtime, chia sẻ flashcard và làm quiz đối kháng.
      </p>

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div
          className="flex items-center gap-2 border-[3px] border-black bg-[#FFF8F0] dark:bg-[#11203A] px-3 py-2 flex-1 max-w-md"
          style={{ boxShadow: SHADOW_SM }}
        >
          <Search size={16} className="text-[#0A1628] dark:text-[#FFF8F0]" />
          <input
            placeholder="Tìm nhóm theo môn, tên..."
            className="bg-transparent outline-none font-sans text-sm flex-1 text-[#0A1628] dark:text-[#FFF8F0]"
            style={{ fontWeight: 500 }}
          />
        </div>
        <button
          className="flex items-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-4 py-2.5 font-sans text-sm hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
          style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
        >
          <Plus size={16} /> Tạo nhóm mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Group list */}
        <div className="space-y-4">
          <div
            className="border-[4px] border-black"
            style={{ backgroundColor: cardBg, boxShadow: SHADOW }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b-[3px] border-black bg-[#FF6B35]">
              <Users size={18} className="text-white" />
              <p className="font-serif text-white" style={{ fontWeight: 700 }}>
                Nhóm của bạn
              </p>
            </div>
            <div className="p-3 space-y-2">
              {myGroups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelected(g)}
                  className="w-full text-left border-[3px] border-black p-3 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                  style={{
                    backgroundColor:
                      selected.id === g.id ? (isDark ? "#3A1A10" : "#FFE4D6") : innerBg,
                    boxShadow: SHADOW_SM,
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-10 h-10 border-[2px] border-black flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: g.color }}
                    >
                      <BookOpen size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-sans truncate" style={{ fontWeight: 700, color: text }}>
                          {g.name}
                        </p>
                        {g.unread > 0 && (
                          <span
                            className="min-w-[20px] h-5 px-1.5 border-[2px] border-black bg-[#991B1B] text-white font-sans text-[10px] flex items-center justify-center flex-shrink-0"
                            style={{ fontWeight: 700 }}
                          >
                            {g.unread}
                          </span>
                        )}
                      </div>
                      <p
                        className="font-sans text-xs mt-0.5 truncate"
                        style={{ fontWeight: 500, color: muted }}
                      >
                        <span style={{ color: "#FF6B35", fontWeight: 700 }}>{g.lastSender}:</span>{" "}
                        {g.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1 font-sans text-[10px]" style={{ fontWeight: 600, color: muted }}>
                          <span className="w-2 h-2 bg-[#16A34A] border border-black"></span>
                          {g.online} online
                        </span>
                        <span className="font-sans text-[10px]" style={{ fontWeight: 600, color: muted }}>
                          · {g.members} thành viên
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div
            className="border-[4px] border-black"
            style={{ backgroundColor: cardBg, boxShadow: SHADOW }}
          >
            <p
              className="px-4 py-3 border-b-[3px] border-black font-serif"
              style={{ fontWeight: 700, color: text }}
            >
              Khám phá nhóm
            </p>
            <div className="p-3 space-y-2">
              {discoverGroups.map((g) => (
                <div
                  key={g.id}
                  className="border-[3px] border-black p-3 flex items-center gap-3"
                  style={{ backgroundColor: innerBg, boxShadow: SHADOW_SM }}
                >
                  <div
                    className="w-9 h-9 border-[2px] border-black flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: g.color }}
                  >
                    <Users size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm truncate" style={{ fontWeight: 700, color: text }}>
                      {g.name}
                    </p>
                    <p className="font-sans text-xs" style={{ fontWeight: 500, color: muted }}>
                      {g.course} · {g.members} TV
                    </p>
                  </div>
                  <button
                    className="font-sans text-xs px-3 py-1.5 border-[2px] border-black bg-[#FF6B35] text-white"
                    style={{ fontWeight: 700, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
                  >
                    Tham gia
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Group detail */}
        <div
          className="border-[4px] border-black flex flex-col"
          style={{ backgroundColor: cardBg, boxShadow: SHADOW, minHeight: 600 }}
        >
          <div className="px-5 py-4 border-b-[3px] border-black flex items-center gap-3">
            <div
              className="w-12 h-12 border-[3px] border-black flex items-center justify-center"
              style={{ backgroundColor: selected.color }}
            >
              <BookOpen size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif" style={{ fontWeight: 700, fontSize: "1.2rem", color: text }}>
                {selected.name}
              </h3>
              <p className="font-sans text-xs flex items-center gap-2" style={{ fontWeight: 500, color: muted }}>
                <span className="w-2 h-2 bg-[#16A34A] border border-black inline-block"></span>
                {selected.online} đang hoạt động · {selected.members} thành viên
              </p>
            </div>
            <div className="flex border-[2px] border-black" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}>
              {(["chat", "flashcards", "quiz"] as const).map((t, i) => {
                const labels = { chat: "Chat", flashcards: "Flashcard", quiz: "Quiz" };
                const Icon = { chat: MessageSquare, flashcards: BookOpen, quiz: Swords }[t];
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="flex items-center gap-1.5 font-sans text-xs px-3 py-2"
                    style={{
                      backgroundColor: tab === t ? "#FF6B35" : innerBg,
                      color: tab === t ? "#FFFFFF" : text,
                      fontWeight: 700,
                      borderRight: i < 2 ? "2px solid black" : "none",
                    }}
                  >
                    <Icon size={14} /> {labels[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {tab === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {sampleMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.me ? "justify-end" : "justify-start"} gap-2`}
                  >
                    {!m.me && (
                      <div
                        className="w-8 h-8 border-[2px] border-black bg-[#FFD166] flex items-center justify-center flex-shrink-0 font-serif"
                        style={{ fontWeight: 700, fontSize: "0.8rem" }}
                      >
                        {m.sender[0]}
                      </div>
                    )}
                    <div className="max-w-[70%]">
                      {!m.me && (
                        <p
                          className="font-sans text-[10px] mb-0.5"
                          style={{ fontWeight: 700, color: "#FF6B35" }}
                        >
                          {m.sender}
                        </p>
                      )}
                      <div
                        className="border-[3px] border-black px-3 py-2 font-sans text-sm"
                        style={{
                          backgroundColor: m.me ? "#FF6B35" : innerBg,
                          color: m.me ? "#FFFFFF" : text,
                          fontWeight: 500,
                          boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)",
                        }}
                      >
                        {m.text}
                      </div>
                      <p className="font-sans text-[10px] mt-0.5" style={{ fontWeight: 500, color: muted, textAlign: m.me ? "right" : "left" }}>
                        {m.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t-[3px] border-black p-3 flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 border-[3px] border-black bg-white dark:bg-[#0A1628] px-3 py-2.5 font-sans text-sm outline-none text-[#0A1628] dark:text-[#FFF8F0]"
                  style={{ fontWeight: 500, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
                />
                <button
                  className="border-[3px] border-black bg-[#FF6B35] text-white p-2.5 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                  style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}

          {tab === "flashcards" && (
            <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { q: "React Hook nào dùng cho side effects?", a: "useEffect", count: 24 },
                { q: "Sự khác biệt giữa let và const?", a: "const không reassign", count: 18 },
                { q: "Big O của QuickSort trung bình?", a: "O(n log n)", count: 32 },
                { q: "INNER JOIN trả về gì?", a: "Hàng có matching cả 2 bảng", count: 15 },
              ].map((c, i) => (
                <div
                  key={i}
                  className="border-[3px] border-black p-4"
                  style={{ backgroundColor: innerBg, boxShadow: SHADOW_SM }}
                >
                  <p className="font-sans text-xs mb-2" style={{ fontWeight: 700, color: "#FF6B35" }}>
                    CÂU HỎI
                  </p>
                  <p className="font-serif mb-3" style={{ fontWeight: 700, fontSize: "1.05rem", color: text }}>
                    {c.q}
                  </p>
                  <p className="font-sans text-xs flex items-center justify-between" style={{ fontWeight: 500, color: muted }}>
                    <span>{c.count} người đã học</span>
                    <button
                      className="font-sans text-xs px-3 py-1 border-[2px] border-black bg-[#FF6B35] text-white"
                      style={{ fontWeight: 700, boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
                    >
                      Lật thẻ
                    </button>
                  </p>
                </div>
              ))}
            </div>
          )}

          {tab === "quiz" && (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
              <div
                className="w-24 h-24 border-[4px] border-black bg-[#FF6B35] flex items-center justify-center mb-4 rotate-[-4deg]"
                style={{ boxShadow: SHADOW }}
              >
                <Swords size={48} className="text-white" />
              </div>
              <h3 className="font-serif mb-2" style={{ fontWeight: 700, fontSize: "1.5rem", color: text }}>
                Quiz đối kháng 1vs1
              </h3>
              <p className="font-sans max-w-md mb-5" style={{ fontWeight: 500, color: muted }}>
                Thách đấu thành viên trong nhóm. 10 câu hỏi · 30 giây mỗi câu · người thắng nhận +50 XP và 1 sao danh hiệu.
              </p>
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-5 py-3 font-sans hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                  style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
                >
                  <Swords size={18} /> Tìm đối thủ
                </button>
                <button
                  className="flex items-center gap-2 border-[3px] border-black bg-[#FFD166] text-[#0A1628] px-5 py-3 font-sans hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                  style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
                >
                  <Crown size={18} /> BXH Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


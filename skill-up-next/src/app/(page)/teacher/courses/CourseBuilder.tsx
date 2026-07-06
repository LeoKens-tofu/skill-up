'use client';
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Plus, Trash2, X, ChevronDown, ChevronUp,
  Video, FileText, Paperclip, HelpCircle, Upload, Check, Loader2,
} from "lucide-react";
import { toast } from "sonner";

const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const API = process.env.NEXT_PUBLIC_API_URL;

const CATEGORIES = ["Lập trình", "Thiết kế", "Ngôn ngữ", "Kỹ năng mềm"];
const LEVELS = ["Cơ bản", "Trung cấp", "Nâng cao"];
const COLOR_PRESETS = [
  { cover: "#FF6B35", stripe: "#0A1628" },
  { cover: "#0A1628", stripe: "#FF6B35" },
  { cover: "#FFF8F0", stripe: "#FF6B35" },
  { cover: "#FF6B35", stripe: "#FFF8F0" },
  { cover: "#0A1628", stripe: "#FFF8F0" },
  { cover: "#FFF8F0", stripe: "#0A1628" },
];

type LessonType = "video" | "article" | "resource" | "quiz";

type Question = {
  _key: number;
  _id?: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
};

type Resource = { name: string; url: string; size?: string };

type Lesson = {
  _key: number;
  _id?: string;
  title: string;
  type: LessonType;
  isPreview: boolean;
  xp: number;
  videoUrl?: string;
  videoSource?: "upload" | "external";
  duration?: string;
  content?: string;
  resources: Resource[];
  questions: Question[];
};

type Chapter = {
  _key: number;
  _id?: string;
  title: string;
  lessons: Lesson[];
  collapsed?: boolean;
};

let keySeq = 1;
const nextKey = () => Date.now() * 1000 + keySeq++;

const emptyLesson = (): Lesson => ({
  _key: nextKey(),
  title: "",
  type: "video",
  isPreview: false,
  xp: 10,
  videoUrl: "",
  videoSource: "upload",
  duration: "",
  content: "",
  resources: [],
  questions: [],
});

const emptyChapter = (): Chapter => ({
  _key: nextKey(),
  title: "",
  lessons: [],
  collapsed: false,
});

const LESSON_TYPE_META: Record<LessonType, { label: string; icon: any }> = {
  video: { label: "Video", icon: Video },
  article: { label: "Bài viết", icon: FileText },
  resource: { label: "Tài liệu", icon: Paperclip },
  quiz: { label: "Quiz", icon: HelpCircle },
};

export type CourseInitial = {
  _id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  level?: string;
  status?: string;
  thumbnail?: string;
  coverColor?: string;
  stripeColor?: string;
  whatYouWillLearn?: string[];
  requirements?: string[];
  tags?: string[];
  totalXp?: number;
  chapters?: any[];
};

export default function CourseBuilder({
  mode,
  courseId,
  initial,
}: {
  mode: "create" | "edit";
  courseId?: string;
  initial?: CourseInitial;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title || "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [category, setCategory] = useState(initial?.category || CATEGORIES[0]);
  const [level, setLevel] = useState(initial?.level || LEVELS[0]);
  const [status, setStatus] = useState(initial?.status || "draft");
  const [thumbnail, setThumbnail] = useState(initial?.thumbnail || "");
  const [coverColor, setCoverColor] = useState(initial?.coverColor || COLOR_PRESETS[0].cover);
  const [stripeColor, setStripeColor] = useState(initial?.stripeColor || COLOR_PRESETS[0].stripe);
  const [totalXp, setTotalXp] = useState<number>(initial?.totalXp ?? 100);
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>(initial?.whatYouWillLearn || []);
  const [requirements, setRequirements] = useState<string[]>(initial?.requirements || []);
  const [tags, setTags] = useState<string[]>(initial?.tags || []);

  const [chapters, setChapters] = useState<Chapter[]>(() =>
    (initial?.chapters || []).map((ch: any) => ({
      _key: nextKey(),
      _id: ch._id,
      title: ch.title || "",
      collapsed: true,
      lessons: (ch.lessons || []).map((ls: any) => ({
        _key: nextKey(),
        _id: ls._id,
        title: ls.title || "",
        type: (ls.type || "video") as LessonType,
        isPreview: !!ls.isPreview,
        xp: ls.xp ?? 10,
        videoUrl: ls.videoUrl || "",
        videoSource: ls.videoSource || "upload",
        duration: ls.duration || "",
        content: ls.content || "",
        resources: ls.resources || [],
        questions: (ls.questions || []).map((q: any) => ({
          _key: nextKey(),
          _id: q._id,
          questionText: q.questionText || "",
          options: q.options || ["", "", "", ""],
          correctAnswerIndex: q.correctAnswerIndex ?? 0,
          explanation: q.explanation || "",
        })),
      })),
    }))
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const setUp = (key: string, v: boolean) =>
    setUploading((u) => ({ ...u, [key]: v }));

  // ---------- Nested state helpers ----------
  const patchChapter = (ck: number, patch: Partial<Chapter>) =>
    setChapters((chs) => chs.map((c) => (c._key === ck ? { ...c, ...patch } : c)));

  const patchLesson = (ck: number, lk: number, patch: Partial<Lesson>) =>
    setChapters((chs) =>
      chs.map((c) =>
        c._key === ck
          ? { ...c, lessons: c.lessons.map((l) => (l._key === lk ? { ...l, ...patch } : l)) }
          : c
      )
    );

  const patchQuestion = (ck: number, lk: number, qk: number, patch: Partial<Question>) =>
    setChapters((chs) =>
      chs.map((c) =>
        c._key === ck
          ? {
              ...c,
              lessons: c.lessons.map((l) =>
                l._key === lk
                  ? { ...l, questions: l.questions.map((q) => (q._key === qk ? { ...q, ...patch } : q)) }
                  : l
              ),
            }
          : c
      )
    );

  const addChapter = () => setChapters((chs) => [...chs, emptyChapter()]);
  const removeChapter = (ck: number) => {
    if (!confirm("Xóa chương này cùng toàn bộ bài học bên trong?")) return;
    setChapters((chs) => chs.filter((c) => c._key !== ck));
  };
  const addLesson = (ck: number) =>
    setChapters((chs) =>
      chs.map((c) => (c._key === ck ? { ...c, lessons: [...c.lessons, emptyLesson()] } : c))
    );
  const removeLesson = (ck: number, lk: number) =>
    setChapters((chs) =>
      chs.map((c) => (c._key === ck ? { ...c, lessons: c.lessons.filter((l) => l._key !== lk) } : c))
    );

  const addQuestion = (ck: number, lk: number) =>
    patchLessonRaw(ck, lk, (l) => ({
      questions: [
        ...l.questions,
        { _key: nextKey(), questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: "" },
      ],
    }));
  const removeQuestion = (ck: number, lk: number, qk: number) =>
    patchLessonRaw(ck, lk, (l) => ({ questions: l.questions.filter((q) => q._key !== qk) }));

  // patch that needs current lesson value
  const patchLessonRaw = (ck: number, lk: number, fn: (l: Lesson) => Partial<Lesson>) =>
    setChapters((chs) =>
      chs.map((c) =>
        c._key === ck
          ? { ...c, lessons: c.lessons.map((l) => (l._key === lk ? { ...l, ...fn(l) } : l)) }
          : c
      )
    );

  // ---------- Upload ----------
  const uploadFile = async (kind: "video" | "resource" | "thumbnail", file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API}/client/teacher/courses/upload/${kind}`, {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    return res.json();
  };

  const handleVideoUpload = async (ck: number, lk: number, file: File) => {
    const key = `video-${lk}`;
    setUp(key, true);
    const t = toast.loading("Đang tải video lên...");
    try {
      const json = await uploadFile("video", file);
      if (json.code === "success") {
        patchLesson(ck, lk, { videoUrl: json.data.url, videoSource: "upload" });
        toast.success("Tải video thành công", { id: t });
      } else {
        toast.error(json.message || "Lỗi tải video", { id: t });
      }
    } catch {
      toast.error("Lỗi kết nối khi tải video", { id: t });
    } finally {
      setUp(key, false);
    }
  };

  const handleThumbnailUpload = async (file: File) => {
    setUp("thumbnail", true);
    const t = toast.loading("Đang tải ảnh bìa...");
    try {
      const json = await uploadFile("thumbnail", file);
      if (json.code === "success") {
        setThumbnail(json.data.url);
        toast.success("Tải ảnh bìa thành công", { id: t });
      } else {
        toast.error(json.message || "Lỗi tải ảnh", { id: t });
      }
    } catch {
      toast.error("Lỗi kết nối khi tải ảnh", { id: t });
    } finally {
      setUp("thumbnail", false);
    }
  };

  const handleResourceUpload = async (ck: number, lk: number, file: File) => {
    const key = `res-${lk}`;
    setUp(key, true);
    const t = toast.loading("Đang tải tài liệu...");
    try {
      const json = await uploadFile("resource", file);
      if (json.code === "success") {
        patchLessonRaw(ck, lk, (l) => ({
          resources: [...l.resources, { name: json.data.name, url: json.data.url, size: json.data.size }],
        }));
        toast.success("Tải tài liệu thành công", { id: t });
      } else {
        toast.error(json.message || "Lỗi tải tài liệu", { id: t });
      }
    } catch {
      toast.error("Lỗi kết nối khi tải tài liệu", { id: t });
    } finally {
      setUp(key, false);
    }
  };

  // ---------- Validate + Submit ----------
  const validate = (): string | null => {
    if (!title.trim()) return "Vui lòng nhập tên khóa học";
    if (!category.trim()) return "Vui lòng chọn danh mục";
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      if (!ch.title.trim()) return `Chương ${i + 1} chưa có tiêu đề`;
      for (let j = 0; j < ch.lessons.length; j++) {
        const ls = ch.lessons[j];
        const where = `Bài ${j + 1} (chương ${i + 1})`;
        if (!ls.title.trim()) return `${where} chưa có tiêu đề`;
        if (ls.type === "video" && !ls.videoUrl?.trim())
          return `${where} chưa có video (tải lên hoặc dán link)`;
        if (ls.type === "article" && !ls.content?.trim())
          return `${where} chưa có nội dung bài viết`;
        if (ls.type === "resource" && ls.resources.length === 0)
          return `${where} cần ít nhất 1 tài liệu`;
        if (ls.type === "quiz") {
          if (ls.questions.length === 0) return `${where} cần ít nhất 1 câu hỏi`;
          for (let k = 0; k < ls.questions.length; k++) {
            const q = ls.questions[k];
            if (!q.questionText.trim()) return `${where}: câu hỏi ${k + 1} chưa có nội dung`;
            for (let m = 0; m < q.options.length; m++)
              if (!q.options[m].trim())
                return `${where}: lựa chọn ${m + 1} của câu hỏi ${k + 1} còn trống`;
          }
        }
      }
    }
    return null;
  };

  const buildPayload = () => ({
    title,
    subtitle,
    description,
    category,
    level,
    status,
    thumbnail,
    coverColor,
    stripeColor,
    totalXp: Number(totalXp),
    whatYouWillLearn,
    requirements,
    tags,
    chapters: chapters.map((ch, ci) => ({
      ...(ch._id ? { _id: ch._id } : {}),
      title: ch.title,
      order: ci,
      lessons: ch.lessons.map((ls, li) => ({
        ...(ls._id ? { _id: ls._id } : {}),
        title: ls.title,
        type: ls.type,
        order: li,
        isPreview: ls.isPreview,
        xp: Number(ls.xp) || 0,
        videoUrl: ls.type === "video" ? ls.videoUrl : "",
        videoSource: ls.videoSource,
        duration: ls.duration,
        content: ls.type === "article" ? ls.content : "",
        resources: ls.resources,
        questions:
          ls.type === "quiz"
            ? ls.questions.map((q) => ({
                ...(q._id ? { _id: q._id } : {}),
                questionText: q.questionText,
                options: q.options,
                correctAnswerIndex: q.correctAnswerIndex,
                explanation: q.explanation || "",
              }))
            : [],
      })),
    })),
  });

  const handleSubmit = async () => {
    const err = validate();
    if (err) return toast.error(err);
    if (Object.values(uploading).some(Boolean))
      return toast.error("Vui lòng đợi các file tải lên xong");

    setIsSubmitting(true);
    const t = toast.loading(mode === "create" ? "Đang tạo khóa học..." : "Đang cập nhật...");
    try {
      const url =
        mode === "create"
          ? `${API}/client/teacher/courses`
          : `${API}/client/teacher/courses/${courseId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildPayload()),
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message, { id: t });
        router.push("/teacher/courses");
      } else {
        toast.error(json.message || "Đã xảy ra lỗi", { id: t });
      }
    } catch {
      toast.error("Lỗi kết nối đến máy chủ", { id: t });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalLessons = chapters.reduce((s, c) => s + c.lessons.length, 0);

  // ---------- Render ----------
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/teacher/courses"
            className="inline-flex items-center gap-2 font-sans text-sm text-[#0A1628]/60 hover:text-[#FF6B35] mb-2 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
          <h1 className="font-serif text-4xl text-[#0A1628]" style={{ fontWeight: 700 }}>
            {mode === "create" ? "Tạo Khóa Học Mới" : "Chỉnh Sửa Khóa Học"}
          </h1>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-6 py-3 font-sans transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-1 active:translate-x-1 disabled:opacity-50"
          style={{ boxShadow: SHADOW, fontWeight: 700 }}
        >
          <Save size={20} /> {mode === "create" ? "Lưu khóa học" : "Cập nhật"}
        </button>
      </div>

      {/* ===== Thông tin chung ===== */}
      <div className="border-[4px] border-black bg-white p-6 space-y-6" style={{ boxShadow: SHADOW }}>
        <h2 className="font-serif text-2xl text-[#0A1628] border-b-[3px] border-black pb-4" style={{ fontWeight: 700 }}>
          Thông tin chung
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-sans text-[#0A1628] mb-2" style={{ fontWeight: 700 }}>Tên khóa học</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Lập trình Web với React & Node"
              className="w-full border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-3 font-sans outline-none focus:border-[#FF6B35] transition-colors"
              style={{ fontWeight: 500 }}
            />
          </div>
          <div>
            <label className="block font-sans text-[#0A1628] mb-2" style={{ fontWeight: 700 }}>Mô tả ngắn (phụ đề)</label>
            <input
              type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Một câu tóm tắt khóa học"
              className="w-full border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-3 font-sans outline-none focus:border-[#FF6B35] transition-colors"
              style={{ fontWeight: 500 }}
            />
          </div>
        </div>

        <div>
          <label className="block font-sans text-[#0A1628] mb-2" style={{ fontWeight: 700 }}>Mô tả chi tiết</label>
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Giới thiệu nội dung, mục tiêu khóa học..."
            className="w-full border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] p-3 font-sans outline-none min-h-[100px] resize-y focus:border-[#FF6B35] transition-colors"
            style={{ fontWeight: 500 }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block font-sans text-[#0A1628] mb-2" style={{ fontWeight: 700 }}>Danh mục</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-3 font-sans outline-none cursor-pointer focus:border-[#FF6B35]" style={{ fontWeight: 500 }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-sans text-[#0A1628] mb-2" style={{ fontWeight: 700 }}>Trình độ</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)}
              className="w-full border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-3 font-sans outline-none cursor-pointer focus:border-[#FF6B35]" style={{ fontWeight: 500 }}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-sans text-[#0A1628] mb-2" style={{ fontWeight: 700 }}>XP thưởng hoàn thành khóa</label>
            <input type="number" value={totalXp} onChange={(e) => setTotalXp(Number(e.target.value))}
              className="w-full border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-3 font-sans outline-none focus:border-[#FF6B35]" style={{ fontWeight: 500 }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-sans text-[#0A1628] mb-2" style={{ fontWeight: 700 }}>Trạng thái</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-3 font-sans outline-none cursor-pointer focus:border-[#FF6B35]" style={{ fontWeight: 500 }}>
              <option value="draft">Bản nháp (Sinh viên không thấy)</option>
              <option value="public">Xuất bản (Sinh viên có thể học)</option>
            </select>
          </div>
          <div>
            <label className="block font-sans text-[#0A1628] mb-2" style={{ fontWeight: 700 }}>Màu bìa (khi không có ảnh)</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((p, i) => {
                const active = p.cover === coverColor && p.stripe === stripeColor;
                return (
                  <button key={i} type="button"
                    onClick={() => { setCoverColor(p.cover); setStripeColor(p.stripe); }}
                    className="w-10 h-10 border-[3px] border-black relative"
                    style={{
                      backgroundColor: p.cover,
                      backgroundImage: `repeating-linear-gradient(45deg, ${p.stripe} 0 5px, transparent 5px 11px)`,
                      boxShadow: active ? "0 0 0 3px #FF6B35" : "2px 2px 0px 0px rgba(0,0,0,1)",
                    }}
                    title="Chọn màu bìa"
                  >
                    {active && <Check size={16} className="absolute inset-0 m-auto text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ảnh bìa */}
        <div>
          <label className="block font-sans text-[#0A1628] mb-2" style={{ fontWeight: 700 }}>Ảnh bìa (tùy chọn)</label>
          <div className="flex items-center gap-4">
            <div
              className="w-40 h-24 border-[3px] border-black flex-shrink-0 overflow-hidden"
              style={{
                backgroundColor: coverColor,
                backgroundImage: thumbnail ? undefined : `repeating-linear-gradient(45deg, ${stripeColor} 0 10px, transparent 10px 22px)`,
              }}
            >
              {thumbnail && <img src={`${API}${thumbnail}`} alt="cover" className="w-full h-full object-cover" />}
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-2 border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-2 font-sans hover:-translate-y-0.5 transition-transform" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
                {uploading["thumbnail"] ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                Tải ảnh
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleThumbnailUpload(f); e.target.value = ""; }} />
              </label>
              {thumbnail && (
                <button type="button" onClick={() => setThumbnail("")}
                  className="border-[3px] border-black bg-white text-[#991B1B] px-3 py-2 font-sans hover:-translate-y-0.5 transition-transform" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
                  Xóa ảnh
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StringListEditor label="Bạn sẽ học được gì" placeholder="VD: Xây dựng REST API" items={whatYouWillLearn} setItems={setWhatYouWillLearn} />
          <StringListEditor label="Yêu cầu đầu vào" placeholder="VD: Biết HTML/CSS" items={requirements} setItems={setRequirements} />
          <StringListEditor label="Thẻ (tags)" placeholder="VD: react" items={tags} setItems={setTags} />
        </div>
      </div>

      {/* ===== Nội dung khóa học ===== */}
      <div className="border-[4px] border-black bg-white p-6" style={{ boxShadow: SHADOW }}>
        <div className="flex items-center justify-between border-b-[3px] border-black pb-4 mb-6">
          <h2 className="font-serif text-2xl text-[#0A1628]" style={{ fontWeight: 700 }}>
            Nội dung khóa học ({chapters.length} chương · {totalLessons} bài)
          </h2>
          <button type="button" onClick={addChapter}
            className="flex items-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white px-4 py-2 font-sans transition-all hover:-translate-y-0.5 hover:-translate-x-0.5" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
            <Plus size={18} strokeWidth={3} /> Thêm chương
          </button>
        </div>

        <div className="space-y-6">
          {chapters.map((ch, ci) => (
            <div key={ch._key} className="border-[3px] border-black bg-[#FFF8F0]" style={{ boxShadow: SHADOW_SM }}>
              {/* Chapter header */}
              <div className="flex items-center gap-3 p-4 border-b-[3px] border-black">
                <button type="button" onClick={() => patchChapter(ch._key, { collapsed: !ch.collapsed })}
                  className="w-8 h-8 border-[2px] border-black bg-white flex items-center justify-center flex-shrink-0" title={ch.collapsed ? "Mở rộng" : "Thu gọn"}>
                  {ch.collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
                <span className="font-serif text-[#0A1628] flex-shrink-0" style={{ fontWeight: 700 }}>Chương {ci + 1}:</span>
                <input type="text" value={ch.title} onChange={(e) => patchChapter(ch._key, { title: e.target.value })}
                  placeholder="Tên chương"
                  className="flex-1 border-[2px] border-black bg-white text-[#0A1628] px-3 py-2 font-sans outline-none focus:border-[#FF6B35]" style={{ fontWeight: 600 }} />
                <span className="font-sans text-sm text-[#0A1628]/60 flex-shrink-0" style={{ fontWeight: 600 }}>{ch.lessons.length} bài</span>
                <button type="button" onClick={() => removeChapter(ch._key)}
                  className="w-8 h-8 border-[2px] border-black bg-[#991B1B] text-white flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform">
                  <Trash2 size={16} />
                </button>
              </div>

              {!ch.collapsed && (
                <div className="p-4 space-y-4">
                  {ch.lessons.map((ls, li) => (
                    <LessonEditor
                      key={ls._key}
                      chapterKey={ch._key}
                      lesson={ls}
                      index={li}
                      uploading={uploading}
                      patchLesson={patchLesson}
                      patchLessonRaw={patchLessonRaw}
                      patchQuestion={patchQuestion}
                      addQuestion={addQuestion}
                      removeQuestion={removeQuestion}
                      removeLesson={removeLesson}
                      onVideoUpload={handleVideoUpload}
                      onResourceUpload={handleResourceUpload}
                    />
                  ))}

                  <button type="button" onClick={() => addLesson(ch._key)}
                    className="w-full flex items-center justify-center gap-2 border-[3px] border-black border-dashed bg-white text-[#0A1628] py-3 font-sans hover:bg-[#FFF8F0] transition-colors" style={{ fontWeight: 700 }}>
                    <Plus size={18} strokeWidth={3} /> Thêm bài học
                  </button>
                </div>
              )}
            </div>
          ))}

          {chapters.length === 0 && (
            <div className="text-center py-10 border-[3px] border-black border-dashed bg-[#FFF8F0] font-sans text-[#0A1628]/60" style={{ fontWeight: 600 }}>
              Chưa có chương nào. Bấm "Thêm chương" để bắt đầu xây dựng khóa học.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ Sub-components ============

function StringListEditor({
  label, placeholder, items, setItems,
}: { label: string; placeholder: string; items: string[]; setItems: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    setItems([...items, v]);
    setDraft("");
  };
  return (
    <div>
      <label className="block font-sans text-[#0A1628] mb-2" style={{ fontWeight: 700 }}>{label}</label>
      <div className="flex gap-2 mb-2">
        <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628] px-3 py-2 font-sans outline-none focus:border-[#FF6B35] text-sm" style={{ fontWeight: 500 }} />
        <button type="button" onClick={add} className="border-[2px] border-black bg-[#FF6B35] text-white px-3 py-2 hover:-translate-y-0.5 transition-transform">
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>
      <div className="space-y-1.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2 border-[2px] border-black bg-white px-2 py-1.5">
            <span className="flex-1 font-sans text-sm text-[#0A1628] truncate" style={{ fontWeight: 500 }}>{it}</span>
            <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-[#991B1B]">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LessonEditor({
  chapterKey, lesson, index, uploading,
  patchLesson, patchLessonRaw, patchQuestion, addQuestion, removeQuestion, removeLesson,
  onVideoUpload, onResourceUpload,
}: any) {
  const ck = chapterKey;
  const lk = lesson._key;
  const TypeIcon = LESSON_TYPE_META[lesson.type as LessonType].icon;

  // Đổi loại bài học: xóa nội dung CHÍNH của loại cũ, GIỮ lại tài liệu đính kèm
  const changeType = (t: LessonType) => {
    if (lesson.type === t) return;
    const hasData =
      (lesson.type === "video" && lesson.videoUrl) ||
      (lesson.type === "article" && lesson.content) ||
      (lesson.type === "quiz" && lesson.questions.length > 0);
    if (hasData && !confirm("Đổi loại bài học sẽ xóa nội dung chính của loại hiện tại (tài liệu đính kèm được giữ lại). Tiếp tục?")) return;
    patchLessonRaw(ck, lk, () => ({
      type: t,
      videoUrl: "", videoSource: "upload", duration: "",
      content: "",
      questions: [],
      // resources: giữ nguyên
    }));
  };

  return (
    <div className="border-[3px] border-black bg-white p-4" style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 border-[2px] border-black bg-[#0A1628] text-white flex items-center justify-center flex-shrink-0" style={{ fontWeight: 700 }}>
          {index + 1}
        </div>
        <TypeIcon size={18} className="text-[#FF6B35] flex-shrink-0" />
        <input type="text" value={lesson.title} onChange={(e) => patchLesson(ck, lk, { title: e.target.value })}
          placeholder="Tên bài học"
          className="flex-1 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628] px-3 py-2 font-sans outline-none focus:border-[#FF6B35]" style={{ fontWeight: 600 }} />
        <button type="button" onClick={() => removeLesson(ck, lk)}
          className="w-8 h-8 border-[2px] border-black bg-[#991B1B] text-white flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Options row: type, xp, preview */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          {(Object.keys(LESSON_TYPE_META) as LessonType[]).map((t) => {
            const M = LESSON_TYPE_META[t];
            const active = lesson.type === t;
            const Icon = M.icon;
            return (
              <button key={t} type="button" onClick={() => changeType(t)}
                className="flex items-center gap-1.5 border-[2px] border-black px-2.5 py-1.5 font-sans text-xs transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: active ? "#FF6B35" : "#FFF8F0", color: active ? "#fff" : "#0A1628", fontWeight: 700 }}>
                <Icon size={14} /> {M.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs text-[#0A1628]/70" style={{ fontWeight: 700 }}>XP:</span>
          <input type="number" value={lesson.xp} onChange={(e) => patchLesson(ck, lk, { xp: Number(e.target.value) })}
            className="w-20 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628] px-2 py-1 font-sans text-sm outline-none focus:border-[#FF6B35]" style={{ fontWeight: 600 }} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={lesson.isPreview} onChange={(e) => patchLesson(ck, lk, { isPreview: e.target.checked })}
            className="w-4 h-4 accent-[#FF6B35] cursor-pointer" />
          <span className="font-sans text-xs text-[#0A1628]/70" style={{ fontWeight: 700 }}>Cho học thử (miễn phí)</span>
        </label>
      </div>

      <p className="font-sans text-[11px] text-[#0A1628]/50 mb-3" style={{ fontWeight: 500 }}>
        Mỗi bài học là <b>một loại nội dung</b>. Loại đang chọn (tô cam) sẽ hiển thị cho học viên.
      </p>

      {/* Type-specific editor */}
      {lesson.type === "video" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer flex items-center gap-2 border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-2 font-sans hover:-translate-y-0.5 transition-transform" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
              {uploading[`video-${lk}`] ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Tải video lên
              <input type="file" accept="video/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onVideoUpload(ck, lk, f); e.target.value = ""; }} />
            </label>
            <span className="font-sans text-xs text-[#0A1628]/50" style={{ fontWeight: 600 }}>hoặc dán link:</span>
            <input type="text" value={lesson.videoSource === "external" ? lesson.videoUrl : ""}
              onChange={(e) => patchLesson(ck, lk, { videoUrl: e.target.value, videoSource: "external" })}
              placeholder="https://youtube.com/... hoặc .mp4"
              className="flex-1 min-w-[200px] border-[2px] border-black bg-[#FFF8F0] text-[#0A1628] px-3 py-2 font-sans text-sm outline-none focus:border-[#FF6B35]" style={{ fontWeight: 500 }} />
          </div>
          {lesson.videoUrl && (
            <div className="flex items-center gap-2 border-[2px] border-black bg-[#16A34A]/10 px-3 py-2">
              <Check size={16} className="text-[#16A34A]" />
              <span className="flex-1 font-sans text-xs text-[#0A1628] truncate" style={{ fontWeight: 600 }}>
                {lesson.videoSource === "upload" ? "Đã tải video: " : "Link: "}{lesson.videoUrl}
              </span>
              <button type="button" onClick={() => patchLesson(ck, lk, { videoUrl: "", videoSource: "upload" })} className="text-[#991B1B]"><X size={14} /></button>
            </div>
          )}
          <input type="text" value={lesson.duration || ""} onChange={(e) => patchLesson(ck, lk, { duration: e.target.value })}
            placeholder="Thời lượng (VD: 12:30) — tùy chọn"
            className="w-full border-[2px] border-black bg-[#FFF8F0] text-[#0A1628] px-3 py-2 font-sans text-sm outline-none focus:border-[#FF6B35]" style={{ fontWeight: 500 }} />
        </div>
      )}

      {lesson.type === "article" && (
        <textarea value={lesson.content || ""} onChange={(e) => patchLesson(ck, lk, { content: e.target.value })}
          placeholder="Nội dung bài viết (hỗ trợ Markdown)..."
          className="w-full border-[2px] border-black bg-[#FFF8F0] text-[#0A1628] p-3 font-sans text-sm outline-none min-h-[140px] resize-y focus:border-[#FF6B35]" style={{ fontWeight: 500 }} />
      )}

      {lesson.type === "resource" && (
        <div className="space-y-2">
          <label className="cursor-pointer inline-flex items-center gap-2 border-[3px] border-black bg-[#FFF8F0] text-[#0A1628] px-4 py-2 font-sans hover:-translate-y-0.5 transition-transform" style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}>
            {uploading[`res-${lk}`] ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Tải tài liệu
            <input type="file" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onResourceUpload(ck, lk, f); e.target.value = ""; }} />
          </label>
          {lesson.resources.map((r: Resource, ri: number) => (
            <div key={ri} className="flex items-center gap-2 border-[2px] border-black bg-white px-3 py-2">
              <Paperclip size={14} className="text-[#FF6B35]" />
              <span className="flex-1 font-sans text-xs text-[#0A1628] truncate" style={{ fontWeight: 600 }}>{r.name}</span>
              <span className="font-sans text-[10px] text-[#0A1628]/50" style={{ fontWeight: 600 }}>{r.size}</span>
              <button type="button" onClick={() => patchLessonRaw(ck, lk, (l: Lesson) => ({ resources: l.resources.filter((_, i) => i !== ri) }))} className="text-[#991B1B]"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {lesson.type === "quiz" && (
        <div className="space-y-4">
          {lesson.questions.map((q: Question, qi: number) => (
            <div key={q._key} className="border-[2px] border-black bg-[#FFF8F0] p-3 relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-sans text-xs text-[#0A1628]/70" style={{ fontWeight: 700 }}>Câu {qi + 1}</span>
                <button type="button" onClick={() => removeQuestion(ck, lk, q._key)} className="ml-auto text-[#991B1B]"><Trash2 size={14} /></button>
              </div>
              <textarea value={q.questionText} onChange={(e) => patchQuestion(ck, lk, q._key, { questionText: e.target.value })}
                placeholder="Nội dung câu hỏi..."
                className="w-full border-[2px] border-black bg-white text-[#0A1628] p-2 font-sans text-sm outline-none min-h-[60px] resize-y focus:border-[#FF6B35] mb-2" style={{ fontWeight: 500 }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {q.options.map((opt: string, oi: number) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input type="radio" name={`correct-${lk}-${q._key}`} checked={q.correctAnswerIndex === oi}
                      onChange={() => patchQuestion(ck, lk, q._key, { correctAnswerIndex: oi })}
                      className="w-4 h-4 accent-[#16A34A] cursor-pointer" title="Đáp án đúng" />
                    <input type="text" value={opt}
                      onChange={(e) => { const opts = [...q.options]; opts[oi] = e.target.value; patchQuestion(ck, lk, q._key, { options: opts }); }}
                      placeholder={`Đáp án ${oi + 1}`}
                      className={`flex-1 border-[2px] border-black p-1.5 font-sans text-sm outline-none ${q.correctAnswerIndex === oi ? "bg-[#16A34A]/20 border-[#16A34A]" : "bg-white"} text-[#0A1628]`} style={{ fontWeight: 500 }} />
                  </div>
                ))}
              </div>
              <input type="text" value={q.explanation || ""} onChange={(e) => patchQuestion(ck, lk, q._key, { explanation: e.target.value })}
                placeholder="Giải thích đáp án (tùy chọn)"
                className="w-full mt-2 border-[2px] border-black bg-white text-[#0A1628] px-2 py-1.5 font-sans text-sm outline-none focus:border-[#FF6B35]" style={{ fontWeight: 500 }} />
            </div>
          ))}
          <button type="button" onClick={() => addQuestion(ck, lk)}
            className="flex items-center gap-2 border-[2px] border-black bg-white text-[#0A1628] px-3 py-2 font-sans text-sm hover:-translate-y-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)", fontWeight: 700 }}>
            <Plus size={16} strokeWidth={3} /> Thêm câu hỏi
          </button>
        </div>
      )}

      {/* Tài liệu đính kèm — cho MỌI loại bài (trừ type resource vì đã là nội dung chính) */}
      {lesson.type !== "resource" && (
        <div className="mt-4 pt-4 border-t-[2px] border-dashed border-black/30">
          <p className="font-sans text-xs text-[#0A1628]/70 mb-2" style={{ fontWeight: 700 }}>Tài liệu đính kèm (tùy chọn)</p>
          <label className="cursor-pointer inline-flex items-center gap-2 border-[2px] border-black bg-[#FFF8F0] text-[#0A1628] px-3 py-1.5 font-sans text-sm hover:-translate-y-0.5 transition-transform" style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)", fontWeight: 700 }}>
            {uploading[`res-${lk}`] ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Thêm tài liệu
            <input type="file" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onResourceUpload(ck, lk, f); e.target.value = ""; }} />
          </label>
          {lesson.resources.map((r: Resource, ri: number) => (
            <div key={ri} className="flex items-center gap-2 border-[2px] border-black bg-white px-3 py-2 mt-2">
              <Paperclip size={14} className="text-[#FF6B35]" />
              <span className="flex-1 font-sans text-xs text-[#0A1628] truncate" style={{ fontWeight: 600 }}>{r.name}</span>
              <span className="font-sans text-[10px] text-[#0A1628]/50" style={{ fontWeight: 600 }}>{r.size}</span>
              <button type="button" onClick={() => patchLessonRaw(ck, lk, (l: Lesson) => ({ resources: l.resources.filter((_, i) => i !== ri) }))} className="text-[#991B1B]"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

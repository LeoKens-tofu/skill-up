import mongoose, { Document, Schema } from "mongoose";

// Câu hỏi cho lesson dạng quiz — dùng lại đúng cấu trúc của quiz.model
export interface ILessonQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

// Tài liệu đính kèm / tải về
export interface IResource {
  name: string;
  url: string; // đường dẫn tương đối /uploads/... hoặc link ngoài
  size?: string; // vd "2.4 MB" (hiển thị)
}

export type LessonType = "video" | "article" | "resource" | "quiz" | "assignment";

export interface ILesson {
  _id?: mongoose.Types.ObjectId;
  title: string;
  type: LessonType;
  order: number;
  isPreview: boolean; // cho học thử khi chưa tham gia
  xp: number; // XP thưởng khi hoàn thành bài này

  // type = "video"
  videoUrl?: string; // /uploads/videos/... (upload) hoặc URL ngoài
  videoSource?: "upload" | "external";
  duration?: string; // vd "12:30" (hiển thị)

  // type = "article" (và type = "assignment": dùng làm đề bài / hướng dẫn)
  content?: string; // nội dung text/markdown

  // type = "resource" (và cũng dùng làm đính kèm cho mọi loại bài)
  resources: IResource[];

  // type = "quiz"
  questions: ILessonQuestion[];

  // type = "assignment"
  dueDate?: Date; // hạn nộp bài (sau hạn không cho nộp)
  maxScore?: number; // điểm tối đa khi chấm (mặc định 10)
}

export interface IChapter {
  _id?: mongoose.Types.ObjectId;
  title: string;
  order: number;
  lessons: ILesson[];
}

export interface ICourse extends Document {
  title: string;
  subtitle?: string;
  description: string;
  category: string; // "Lập trình" | "Thiết kế" | "Ngôn ngữ" | "Kỹ năng mềm" ...
  level: "Cơ bản" | "Trung cấp" | "Nâng cao";
  teacherId: mongoose.Types.ObjectId;

  thumbnail?: string; // /uploads/... hoặc URL ngoài
  coverColor: string;
  stripeColor: string;

  whatYouWillLearn: string[]; // "Bạn sẽ học được gì"
  requirements: string[]; // yêu cầu đầu vào
  tags: string[];

  totalXp: number; // XP thưởng khi hoàn thành cả khóa
  status: "draft" | "public";

  chapters: IChapter[];

  enrollmentCount: number;
  rating: number;

  deleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LessonQuestionSchema = new Schema<ILessonQuestion>(
  {
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true },
    explanation: { type: String, default: "" },
  },
  { _id: true }
);

const ResourceSchema = new Schema<IResource>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: String, default: "" },
  },
  { _id: false }
);

const LessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["video", "article", "resource", "quiz", "assignment"],
      required: true,
    },
    order: { type: Number, default: 0 },
    isPreview: { type: Boolean, default: false },
    xp: { type: Number, default: 10 },

    videoUrl: { type: String, default: "" },
    videoSource: { type: String, enum: ["upload", "external"], default: "upload" },
    duration: { type: String, default: "" },

    content: { type: String, default: "" },

    resources: { type: [ResourceSchema], default: [] },

    questions: { type: [LessonQuestionSchema], default: [] },

    dueDate: { type: Date },
    maxScore: { type: Number, default: 10 },
  },
  { _id: true }
);

const ChapterSchema = new Schema<IChapter>(
  {
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    lessons: { type: [LessonSchema], default: [] },
  },
  { _id: true }
);

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    level: {
      type: String,
      enum: ["Cơ bản", "Trung cấp", "Nâng cao"],
      default: "Cơ bản",
    },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },

    thumbnail: { type: String, default: "" },
    coverColor: { type: String, default: "#FF6B35" },
    stripeColor: { type: String, default: "#0A1628" },

    whatYouWillLearn: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    tags: { type: [String], default: [] },

    totalXp: { type: Number, default: 100 },
    status: { type: String, enum: ["draft", "public"], default: "draft" },

    chapters: { type: [ChapterSchema], default: [] },

    enrollmentCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },

    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Course = mongoose.model<ICourse>("Course", CourseSchema, "courses");

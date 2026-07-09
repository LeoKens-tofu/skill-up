import mongoose, { Document, Schema } from "mongoose";

// File sinh viên nộp (đã upload lên /uploads/submissions/...)
export interface ISubmissionFile {
  name: string; // tên gốc do SV đặt
  url: string; // /uploads/submissions/...
  size?: string; // vd "2.4 MB" (hiển thị)
}

export type SubmissionStatus = "submitted" | "graded";

// Bài nộp của 1 sinh viên cho 1 bài tập (lesson type = "assignment")
// Mỗi SV chỉ có 1 bản ghi / bài tập — nộp lại sẽ đè file (đến khi được chấm).
export interface ISubmission extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId; // bài tập trong course.chapters.lessons

  files: ISubmissionFile[];
  note?: string; // ghi chú của sinh viên

  status: SubmissionStatus;
  score?: number; // điểm GV chấm (0 - maxScore)
  feedback?: string; // nhận xét của GV
  xpEarned: number; // XP đã cộng khi chấm đạt (chỉ tính 1 lần)

  submittedAt: Date; // lần nộp gần nhất
  gradedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const SubmissionFileSchema = new Schema<ISubmissionFile>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: String, default: "" },
  },
  { _id: false }
);

const SubmissionSchema = new Schema<ISubmission>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: Schema.Types.ObjectId, required: true },

    files: { type: [SubmissionFileSchema], default: [] },
    note: { type: String, default: "" },

    status: {
      type: String,
      enum: ["submitted", "graded"],
      default: "submitted",
    },
    score: { type: Number },
    feedback: { type: String, default: "" },
    xpEarned: { type: Number, default: 0 },

    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date },
  },
  { timestamps: true }
);

// Mỗi sinh viên chỉ có 1 bài nộp cho mỗi bài tập
SubmissionSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
// Truy vấn theo bài tập (giáo viên chấm) / theo khóa
SubmissionSchema.index({ lessonId: 1 });
SubmissionSchema.index({ courseId: 1 });

export const Submission = mongoose.model<ISubmission>(
  "Submission",
  SubmissionSchema,
  "submissions"
);

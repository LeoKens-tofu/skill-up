import mongoose, { Document, Schema } from "mongoose";

// Kết quả 1 bài quiz của sinh viên (để giáo viên chấm/theo dõi)
export interface ILessonResult {
  lessonId: mongoose.Types.ObjectId;
  score: number; // thang 0-10
  correctAnswers: number;
  totalQuestions: number;
  xpEarned: number; // XP nhận từ bài này (chỉ tính lần đầu)
  submittedAt: Date; // lần nộp gần nhất
}

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;

  completedLessonIds: mongoose.Types.ObjectId[]; // các bài đã hoàn thành
  lastLessonId?: mongoose.Types.ObjectId; // "tiếp tục từ chỗ đang dở"

  lessonResults: ILessonResult[]; // điểm quiz từng bài

  progressPercent: number; // 0-100
  isCompleted: boolean;
  completedAt?: Date;
  xpEarned: number; // tổng XP đã nhận từ khóa này

  createdAt: Date; // = thời điểm tham gia
  updatedAt: Date;
}

const LessonResultSchema = new Schema<ILessonResult>(
  {
    lessonId: { type: Schema.Types.ObjectId, required: true },
    score: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },

    completedLessonIds: [{ type: Schema.Types.ObjectId }],
    lastLessonId: { type: Schema.Types.ObjectId },

    lessonResults: { type: [LessonResultSchema], default: [] },

    progressPercent: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    xpEarned: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Mỗi sinh viên chỉ tham gia 1 khóa 1 lần
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Enrollment = mongoose.model<IEnrollment>(
  "Enrollment",
  EnrollmentSchema,
  "enrollments"
);

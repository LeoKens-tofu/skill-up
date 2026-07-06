import mongoose, { Document, Schema } from "mongoose";

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;

  completedLessonIds: mongoose.Types.ObjectId[]; // các bài đã hoàn thành
  lastLessonId?: mongoose.Types.ObjectId; // "tiếp tục từ chỗ đang dở"

  progressPercent: number; // 0-100
  isCompleted: boolean;
  completedAt?: Date;
  xpEarned: number; // tổng XP đã nhận từ khóa này

  createdAt: Date; // = thời điểm tham gia
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },

    completedLessonIds: [{ type: Schema.Types.ObjectId }],
    lastLessonId: { type: Schema.Types.ObjectId },

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

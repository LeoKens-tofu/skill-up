import mongoose, { Document, Schema } from "mongoose";

export type StudyEventType = "study" | "reminder" | "goal";

// Sự kiện lịch học cá nhân do sinh viên tự tạo.
// (Loại "milestone" ngày ghi danh/hoàn thành là tự sinh từ Enrollment,
//  KHÔNG lưu ở đây.)
export interface IStudyEvent extends Document {
  studentId: mongoose.Types.ObjectId;

  title: string;
  description?: string;
  type: StudyEventType;

  date: string; // "YYYY-MM-DD" — ngày diễn ra / hạn
  startTime?: string; // "HH:mm" — chỉ với buổi học
  endTime?: string; // "HH:mm"

  courseId?: mongoose.Types.ObjectId; // khóa đã ghi danh (tùy chọn)
  lessonId?: mongoose.Types.ObjectId; // bài trong khóa đó (tùy chọn)

  isDone: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const StudyEventSchema = new Schema<IStudyEvent>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["study", "reminder", "goal"],
      default: "study",
    },

    date: { type: String, required: true },
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },

    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    lessonId: { type: Schema.Types.ObjectId },

    isDone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Truy vấn theo SV + khoảng ngày (lịch tháng/tuần)
StudyEventSchema.index({ studentId: 1, date: 1 });

export const StudyEvent = mongoose.model<IStudyEvent>(
  "StudyEvent",
  StudyEventSchema,
  "study_events"
);

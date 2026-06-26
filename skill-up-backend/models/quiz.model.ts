import mongoose, { Document, Schema } from "mongoose";

export interface IQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface IQuiz extends Document {
  title: string;
  subject: string;
  teacherId: mongoose.Types.ObjectId;
  xp: number;
  status: "draft" | "public";
  questions: IQuestion[];
  plays: number;
  deleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
  explanation: { type: String, default: "" },
});

const QuizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    xp: { type: Number, default: 50 },
    status: { type: String, enum: ["draft", "public"], default: "draft" },
    questions: [QuestionSchema],
    plays: { type: Number, default: 0 },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Quiz = mongoose.model<IQuiz>("Quiz", QuizSchema, "quizzes");

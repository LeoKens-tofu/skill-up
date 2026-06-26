import mongoose, { Document, Schema } from "mongoose";

export interface IQuizHistory extends Document {
  studentId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  answers: {
    questionId: mongoose.Types.ObjectId;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const QuizHistorySchema = new Schema<IQuizHistory>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    xpEarned: { type: Number, default: 0 },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, required: true },
        selectedOptionIndex: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const QuizHistory = mongoose.model<IQuizHistory>("QuizHistory", QuizHistorySchema, "quiz_histories");

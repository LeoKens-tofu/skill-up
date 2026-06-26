import mongoose, { Schema, Document } from "mongoose";

export interface ISkill {
  skill: string;
  value: number;
}

export interface ISkillHistory extends Document {
  studentId: mongoose.Types.ObjectId;
  skills: ISkill[];
  createdAt: Date;
  updatedAt: Date;
}

const skillHistorySchema = new Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    skills: [
      {
        skill: { type: String, required: true },
        value: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const SkillHistory = mongoose.model<ISkillHistory>("SkillHistory", skillHistorySchema);

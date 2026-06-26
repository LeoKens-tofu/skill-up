import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema(
  {
    fullName: { type: String, required: true },
    studentId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    title: { type: String, default: "Tân sinh viên" },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Student = mongoose.model("Student", studentSchema, "students");

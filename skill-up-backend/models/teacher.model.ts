import mongoose, { Schema } from "mongoose";

const teacherSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    title: { type: String, default: "Giảng viên IT" },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Teacher = mongoose.model("Teacher", teacherSchema, "teachers");

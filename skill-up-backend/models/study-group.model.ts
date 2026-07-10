import mongoose, { Schema } from "mongoose";

const memberSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    role: { type: String, enum: ["owner", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const studyGroupSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    subject: { type: String, default: "" }, // Môn học / tag
    color: { type: String, default: "#FF6B35" },
    ownerId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    members: { type: [memberSchema], default: [] },
    inviteCode: { type: String, required: true, unique: true, index: true },
    // Xem nhanh tin nhắn cuối cho danh sách nhóm
    lastMessageText: { type: String, default: "" },
    lastSenderName: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const StudyGroup = mongoose.model("StudyGroup", studyGroupSchema, "study_groups");

import mongoose, { Schema } from "mongoose";

const attachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    name: { type: String, default: "" },
    size: { type: Number, default: 0 },
    mime: { type: String, default: "" },
  },
  { _id: false }
);

const groupMessageSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "StudyGroup", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    type: { type: String, enum: ["text", "image", "file", "sticker"], default: "text" },
    text: { type: String, default: "" }, // Text + emoji (unicode)
    attachments: { type: [attachmentSchema], default: [] }, // Ảnh / file đính kèm
    sticker: { type: String, default: "" }, // Mã sticker (emoji-sticker)
  },
  { timestamps: true }
);

export const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema, "group_messages");

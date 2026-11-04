import { Schema, model } from "mongoose";
const s = new Schema({
  name: { type: String, required: true, trim: true }, phone: { type: String, required: true }, email: String, subject: { type: String, required: true }, message: { type: String, required: true },
  productRef: String, status: { type: String, enum: ["unread", "read", "replied", "closed"], default: "unread", index: true },
}, { timestamps: true });
s.index({ name: "text", phone: "text", subject: "text" });
export const Message = model("Message", s);

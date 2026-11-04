import { Schema, model } from "mongoose";
const s = new Schema({
  name: { type: String, required: true, trim: true }, phone: { type: String, required: true, trim: true }, email: String, address: String, businessName: String, notes: String,
  totalPurchases: { type: Number, default: 0 }, totalPaid: { type: Number, default: 0 }, balance: { type: Number, default: 0 },
}, { timestamps: true });
s.index({ name: "text", phone: "text" });
export const Customer = model("Customer", s);

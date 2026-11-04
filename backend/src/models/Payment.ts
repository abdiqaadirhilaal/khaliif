import { Schema, model } from "mongoose";
export const Payment = model("Payment", new Schema({
  customer: { type: Schema.Types.ObjectId, ref: "Customer", index: true }, sale: { type: Schema.Types.ObjectId, ref: "Sale", index: true },
  amount: { type: Number, required: true, min: 0.01 }, method: { type: String, enum: ["cash", "bank", "mobile_money", "other"], default: "cash" },
  date: { type: Date, default: Date.now }, reference: String, notes: String, createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true }));

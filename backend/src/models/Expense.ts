import { Schema, model } from "mongoose";
export const EXPENSE_CATEGORIES = ["shipping","customs","transport","rent","salary","electricity","internet","marketing","packaging","maintenance","other"];
export const Expense = model("Expense", new Schema({
  title: { type: String, required: true }, category: { type: String, enum: EXPENSE_CATEGORIES, required: true }, amount: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now, index: true }, description: String, receipt: String, user: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true }));

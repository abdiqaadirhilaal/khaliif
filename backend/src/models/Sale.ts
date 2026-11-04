import { Schema, model } from "mongoose";
export const Sale = model("Sale", new Schema({
  invoiceNumber: { type: String, required: true, unique: true }, customer: { type: Schema.Types.ObjectId, ref: "Customer", index: true },
  subtotal: Number, discount: { type: Number, default: 0 }, total: Number, costOfGoods: { type: Number, default: 0 }, paid: { type: Number, default: 0 }, balance: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ["cash", "bank", "mobile_money", "other"], default: "cash" }, saleDate: { type: Date, default: Date.now, index: true },
  notes: String, createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true }));

import { Schema, model } from "mongoose";
export const InventoryTransaction = model("InventoryTransaction", new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true }, type: { type: String, enum: ["in", "out"], required: true },
  quantity: { type: Number, required: true, min: 1 }, balanceAfter: Number, reason: String, reference: String, user: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true }));

import { Schema, model } from "mongoose";
export const Bundle = model("Bundle", new Schema({
  bundleNumber: { type: String, required: true, unique: true, uppercase: true }, container: { type: Schema.Types.ObjectId, ref: "Container", required: true, index: true },
  category: { type: Schema.Types.ObjectId, ref: "Category" }, clothingType: String, gender: String, weight: Number, quantity: { type: Number, default: 0 },
  cost: { type: Number, default: 0 }, sellingPrice: { type: Number, default: 0 }, notes: String,
  status: { type: String, enum: ["available", "opened", "sold", "partially_sold"], default: "available" },
}, { timestamps: true }));

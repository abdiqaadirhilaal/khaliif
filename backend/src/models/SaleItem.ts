import { Schema, model } from "mongoose";
export const SaleItem = model("SaleItem", new Schema({
  sale: { type: Schema.Types.ObjectId, ref: "Sale", required: true, index: true }, product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: String, sku: String, quantity: { type: Number, required: true, min: 1 }, unitPrice: Number, unitCost: Number, lineTotal: Number,
}, { timestamps: true }));

import { Schema, model } from "mongoose";
const s = new Schema({
  name: { type: String, required: true, trim: true }, sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true }, description: String, image: String,
  price: { type: Number, required: true, min: 0 }, costPrice: { type: Number, default: 0, min: 0 }, quantity: { type: Number, default: 0, min: 0 },
  productType: String, gender: { type: String, enum: ["men", "women", "children", "unisex"], default: "unisex" }, size: String, color: String,
  published: { type: Boolean, default: false }, featured: { type: Boolean, default: false },
}, { timestamps: true });
s.index({ name: "text", sku: "text" }); s.index({ published: 1, category: 1 });
export const Product = model("Product", s);

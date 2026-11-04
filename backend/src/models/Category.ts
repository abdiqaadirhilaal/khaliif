import { Schema, model } from "mongoose";
export const Category = model("Category", new Schema({
  name: { type: String, required: true, unique: true, trim: true }, description: String, image: String, active: { type: Boolean, default: true },
}, { timestamps: true }));

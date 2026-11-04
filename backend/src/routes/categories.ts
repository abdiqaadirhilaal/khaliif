import { Router } from "express";
import { z } from "zod";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { protect, allow } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { AppError, ok, wrap } from "../utils/http";
const r = Router();
const bool = z.union([z.boolean(), z.enum(["true", "false"])]).transform(v => v === true || v === "true");
const schema = z.object({ name: z.string().min(2), description: z.string().optional(), active: bool.default(true) });
r.get("/", wrap(async (_q, res) => ok(res, await Category.find({ active: true }).sort("name"))));
r.get("/manage", protect, allow("manager", "sales"), wrap(async (_q, res) => ok(res, await Category.find().sort("name"))));
r.post("/", protect, allow("manager"), upload.single("image"), wrap(async (req, res) =>
  ok(res, await Category.create({ ...schema.parse(req.body), ...(req.file && { image: `/uploads/${req.file.filename}` }) }), "Category created", 201)));
r.put("/:id", protect, allow("manager"), upload.single("image"), wrap(async (req, res) => {
  const c = await Category.findByIdAndUpdate(req.params.id, { ...schema.partial().parse(req.body), ...(req.file && { image: `/uploads/${req.file.filename}` }) }, { new: true });
  if (!c) throw new AppError(404, "Category not found"); ok(res, c, "Category updated");
}));
r.delete("/:id", protect, allow("manager"), wrap(async (req, res) => {
  if (await Product.exists({ category: req.params.id })) throw new AppError(409, "Category has products. Deactivate it instead.");
  if (!(await Category.findByIdAndDelete(req.params.id))) throw new AppError(404, "Category not found"); ok(res, {}, "Category deleted");
}));
export default r;

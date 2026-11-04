import { Router } from "express";
import { z } from "zod";
import { Product } from "../models/Product";
import { CompanySettings } from "../models/CompanySettings";
import { protect, allow } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { InventoryTransaction } from "../models/InventoryTransaction";
import { AppError, ok, wrap } from "../utils/http";
const r = Router();
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const bool = z.union([z.boolean(), z.enum(["true", "false"])]).transform(v => v === true || v === "true");
const schema = z.object({
  name: z.string().min(2), sku: z.string().min(1), category: z.string().min(1), description: z.string().optional(),
  price: z.coerce.number().min(0), costPrice: z.coerce.number().min(0).default(0), quantity: z.coerce.number().int().min(0).default(0),
  productType: z.string().optional(), gender: z.enum(["men", "women", "children", "unisex"]).default("unisex"),
  size: z.string().optional(), color: z.string().optional(), published: bool.default(false), featured: bool.default(false),
});
const toPublic = async (p: any) => {
  const o = p.toObject(); const s = await CompanySettings.findOne(); const low = s?.system?.lowStockThreshold ?? 10;
  o.stockStatus = o.quantity <= 0 ? "out_of_stock" : o.quantity <= low ? "low_stock" : "in_stock";
  delete o.costPrice; delete o.quantity; if (s && s.system?.showPrices === false) delete o.price; return o;
};
const filters = (q: any, base: any = {}) => {
  const f = { ...base };
  if (q.category) f.category = q.category; if (q.gender) f.gender = q.gender; if (q.featured === "true") f.featured = true;
  if (q.q) f.$or = [{ name: new RegExp(esc(q.q), "i") }, { sku: new RegExp(esc(q.q), "i") }];
  return f;
};
const page = async (q: any, f: any) => {
  const p = Math.max(1, +q.page || 1), l = Math.min(50, +q.limit || 12);
  const [items, total] = await Promise.all([Product.find(f).populate("category", "name").sort("-createdAt").skip((p - 1) * l).limit(l), Product.countDocuments(f)]);
  return { items, total, page: p, pages: Math.ceil(total / l) };
};
r.get("/", wrap(async (req, res) => {
  const d = await page(req.query, filters(req.query, { published: true }));
  ok(res, { ...d, items: await Promise.all(d.items.map(toPublic)) });
}));
r.get("/manage", protect, allow("manager", "sales", "cashier"), wrap(async (req, res) => {
  const f = filters(req.query); if (req.query.published) f.published = req.query.published === "true";
  ok(res, await page(req.query, f));
}));
r.get("/:id", wrap(async (req, res) => {
  const p = await Product.findOne({ _id: req.params.id, published: true }).populate("category", "name");
  if (!p) throw new AppError(404, "Product not found"); ok(res, await toPublic(p));
}));
const withImage = (req: any) => ({ ...req.body, ...(req.file ? { image: `/uploads/${req.file.filename}` } : {}) });
r.post("/", protect, allow("manager"), upload.single("image"), wrap(async (req, res) => {
  const data = schema.parse(req.body); const p = await Product.create({ ...data, ...(req.file && { image: `/uploads/${req.file.filename}` }) });
  if (p.quantity > 0) await InventoryTransaction.create({ product: p._id, type: "in", quantity: p.quantity, balanceAfter: p.quantity, reason: "Opening stock", user: (req as any).user._id });
  ok(res, p, "Product created", 201);
}));
r.put("/:id", protect, allow("manager"), upload.single("image"), wrap(async (req, res) => {
  const data = schema.partial().parse(req.body);
  const p = await Product.findByIdAndUpdate(req.params.id, { ...data, ...(req.file && { image: `/uploads/${req.file.filename}` }) }, { new: true, runValidators: true });
  if (!p) throw new AppError(404, "Product not found"); ok(res, p, "Product updated");
}));
r.delete("/:id", protect, allow("manager"), wrap(async (req, res) => {
  if (!(await Product.findByIdAndDelete(req.params.id))) throw new AppError(404, "Product not found"); ok(res, {}, "Product deleted");
}));
export default r;

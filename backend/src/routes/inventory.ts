import { Router } from "express";
import { z } from "zod";
import { Product } from "../models/Product";
import { InventoryTransaction } from "../models/InventoryTransaction";
import { CompanySettings } from "../models/CompanySettings";
import { protect, allow } from "../middleware/auth";
import { AppError, ok, wrap } from "../utils/http";
import { esc } from "../utils/crud";
const r = Router(); r.use(protect, allow("manager"));
const threshold = async () => (await CompanySettings.findOne())?.system?.lowStockThreshold ?? 10;
r.get("/", wrap(async (req, res) => {
  const q = req.query as any; const t = await threshold(); const f: any = {}; const p = Math.max(1, +q.page || 1), l = 10;
  if (q.q) f.$or = [{ name: new RegExp(esc(q.q), "i") }, { sku: new RegExp(esc(q.q), "i") }];
  if (q.stock === "out") f.quantity = 0; if (q.stock === "low") f.quantity = { $gt: 0, $lte: t };
  const [rows, total, sum, low, out] = await Promise.all([Product.find(f).populate("category", "name").sort("quantity name").skip((p - 1) * l).limit(l).lean(), Product.countDocuments(f),
    Product.aggregate([{ $group: { _id: null, units: { $sum: "$quantity" }, value: { $sum: { $multiply: ["$quantity", "$costPrice"] } } } }]),
    Product.countDocuments({ quantity: { $gt: 0, $lte: t } }), Product.countDocuments({ quantity: 0 })]);
  const items = rows.map(x => ({ ...x, stockValue: x.quantity * x.costPrice, stockStatus: x.quantity === 0 ? "out_of_stock" : x.quantity <= t ? "low_stock" : "in_stock" }));
  ok(res, { items, total, page: p, pages: Math.ceil(total / l), summary: { totalUnits: sum[0]?.units || 0, totalValue: sum[0]?.value || 0, lowStock: low, outOfStock: out, threshold: t } });
}));
r.get("/transactions", wrap(async (req, res) => {
  const q = req.query as any; const p = Math.max(1, +q.page || 1), l = 15; const f: any = q.product ? { product: q.product } : {};
  const [items, total] = await Promise.all([InventoryTransaction.find(f).populate("product", "name sku").populate("user", "name").sort("-createdAt").skip((p - 1) * l).limit(l), InventoryTransaction.countDocuments(f)]);
  ok(res, { items, total, page: p, pages: Math.ceil(total / l) });
}));
r.post("/adjust", wrap(async (req, res) => {
  const d = z.object({ product: z.string(), type: z.enum(["in", "out"]), quantity: z.coerce.number().int().min(1), reason: z.string().min(2), reference: z.string().optional() }).parse(req.body);
  const sign = d.type === "in" ? 1 : -1;
  const p = await Product.findOneAndUpdate(d.type === "out" ? { _id: d.product, quantity: { $gte: d.quantity } } : { _id: d.product }, { $inc: { quantity: sign * d.quantity } }, { new: true });
  if (!p) throw new AppError(400, "Product not found or not enough stock");
  await InventoryTransaction.create({ ...d, balanceAfter: p.quantity, user: (req as any).user._id });
  ok(res, p, "Stock updated");
}));
export default r;

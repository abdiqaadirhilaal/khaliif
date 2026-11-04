import { Router } from "express";
import { z } from "zod";
import { Sale } from "../models/Sale";
import { SaleItem } from "../models/SaleItem";
import { Payment } from "../models/Payment";
import { Customer } from "../models/Customer";
import { CompanySettings } from "../models/CompanySettings";
import { protect, allow } from "../middleware/auth";
import { withTx } from "../services/tx";
import { createSale } from "../services/sales";
import { AppError, ok, wrap } from "../utils/http";
import { esc } from "../utils/crud";
const r = Router(); r.use(protect, allow("manager", "sales", "cashier"));
const schema = z.object({ customer: z.string().optional(), items: z.array(z.object({ product: z.string(), quantity: z.coerce.number().int().min(1), unitPrice: z.coerce.number().min(0).optional() })).min(1, "Add at least one product"),
  discount: z.coerce.number().min(0).default(0), paid: z.coerce.number().min(0).default(0), paymentMethod: z.enum(["cash", "bank", "mobile_money", "other"]).default("cash"), saleDate: z.coerce.date().optional(), notes: z.string().optional() });
r.get("/", wrap(async (req, res) => {
  const q = req.query as any; const p = Math.max(1, +q.page || 1), l = 10; const f: any = {};
  if (q.customer) f.customer = q.customer; if (q.due === "true") f.balance = { $gt: 0 };
  if (q.q) { const cs = await Customer.find({ name: new RegExp(esc(q.q), "i") }).select("_id"); f.$or = [{ invoiceNumber: new RegExp(esc(q.q), "i") }, { customer: { $in: cs.map(c => c._id) } }]; }
  const [items, total] = await Promise.all([Sale.find(f).populate("customer", "name phone").sort("-saleDate -createdAt").skip((p - 1) * l).limit(l), Sale.countDocuments(f)]);
  ok(res, { items, total, page: p, pages: Math.ceil(total / l) });
}));
r.post("/", wrap(async (req, res) => { const d = schema.parse(req.body); ok(res, await withTx(s => createSale(d, (req as any).user._id, s)), "Sale completed", 201); }));
r.get("/:id", wrap(async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate("customer").populate("createdBy", "name"); if (!sale) throw new AppError(404, "Sale not found");
  const [items, payments, company] = await Promise.all([SaleItem.find({ sale: sale._id }), Payment.find({ sale: sale._id }).sort("date"), CompanySettings.findOne()]);
  ok(res, { sale, items, payments, company });
}));
export default r;

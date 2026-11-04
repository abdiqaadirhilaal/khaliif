import { Router } from "express";
import { z } from "zod";
import { Payment } from "../models/Payment";
import { Sale } from "../models/Sale";
import { Customer } from "../models/Customer";
import { protect, allow } from "../middleware/auth";
import { withTx } from "../services/tx";
import { AppError, ok, wrap } from "../utils/http";
const r = Router(); r.use(protect, allow("manager", "cashier"));
const r2 = (n: number) => Math.round(n * 100) / 100;
r.get("/", wrap(async (req, res) => {
  const q = req.query as any; const p = Math.max(1, +q.page || 1), l = 10; const f: any = q.customer ? { customer: q.customer } : {};
  const [items, total] = await Promise.all([Payment.find(f).populate("customer", "name").populate("sale", "invoiceNumber").sort("-date -createdAt").skip((p - 1) * l).limit(l), Payment.countDocuments(f)]);
  ok(res, { items, total, page: p, pages: Math.ceil(total / l) });
}));
r.post("/", wrap(async (req, res) => {
  const d = z.object({ customer: z.string(), sale: z.string().optional(), amount: z.coerce.number().min(0.01), method: z.enum(["cash", "bank", "mobile_money", "other"]).default("cash"),
    date: z.coerce.date().optional(), reference: z.string().optional(), notes: z.string().optional() }).parse(req.body);
  const user = (req as any).user;
  const pay = await withTx(async s => {
    const c = await Customer.findById(d.customer).session(s || null); if (!c) throw new AppError(404, "Customer not found");
    if (d.amount > c.balance + 0.001) throw new AppError(400, "Amount is more than the customer's outstanding balance");
    const sales = await Sale.find({ customer: c._id, balance: { $gt: 0 }, ...(d.sale ? { _id: d.sale } : {}) }).sort("saleDate").session(s || null);
    if (d.sale) { if (!sales.length) throw new AppError(400, "This invoice has no outstanding balance"); if (d.amount > sales[0].balance + 0.001) throw new AppError(400, "Amount is more than the invoice balance"); }
    let left = d.amount;
    for (const sale of sales) { if (left <= 0) break; const a = Math.min(left, sale.balance); sale.paid = r2(sale.paid + a); sale.balance = r2(sale.balance - a); left = r2(left - a); await sale.save({ session: s }); }
    const [p] = await Payment.create([{ ...d, createdBy: user._id }], { session: s });
    c.totalPaid = r2(c.totalPaid + d.amount); c.balance = r2(c.balance - d.amount); await c.save({ session: s }); return p;
  });
  ok(res, pay, "Payment recorded", 201);
}));
export default r;

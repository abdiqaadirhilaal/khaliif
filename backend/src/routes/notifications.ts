import { Router } from "express";
import { protect } from "../middleware/auth";
import { Message } from "../models/Message";
import { Product } from "../models/Product";
import { Customer } from "../models/Customer";
import { Sale } from "../models/Sale";
import { Container } from "../models/Container";
import { CompanySettings } from "../models/CompanySettings";
import { ok, wrap } from "../utils/http";
const r = Router(); r.use(protect);
r.get("/", wrap(async (req, res) => {
  const role = (req as any).user.role; const mgr = role === "manager" || role === "super_admin"; const t = (await CompanySettings.findOne())?.system?.lowStockThreshold ?? 10; const week = new Date(Date.now() - 7 * 864e5);
  const [unread, out, low, debts, sales, conts] = await Promise.all([mgr ? Message.countDocuments({ status: "unread" }) : 0, Product.find({ quantity: 0 }).limit(5).lean(), Product.find({ quantity: { $gt: 0, $lte: t } }).limit(5).lean(),
    Customer.find({ balance: { $gt: 0 } }).sort("-balance").limit(5).lean(), Sale.find({ createdAt: { $gte: week } }).sort("-createdAt").limit(3).lean(), mgr ? Container.find({ createdAt: { $gte: week } }).limit(3).lean() : []]);
  const n: any[] = [];
  if (unread) n.push({ type: "message", title: `${unread} unread message${unread > 1 ? "s" : ""}`, link: "/dashboard/messages" });
  out.forEach(p => n.push({ type: "out", title: `Out of stock: ${p.name}`, link: "/dashboard/inventory" })); low.forEach(p => n.push({ type: "low", title: `Low stock: ${p.name} (${p.quantity})`, link: "/dashboard/inventory" }));
  debts.forEach(c => n.push({ type: "debt", title: `${c.name} owes ${c.balance}`, link: "/dashboard/payments" })); sales.forEach(s => n.push({ type: "sale", title: `New sale ${s.invoiceNumber}`, link: `/dashboard/sales/${s._id}` }));
  conts.forEach((c: any) => n.push({ type: "container", title: `New container ${c.containerNumber}`, link: "/dashboard/containers" }));
  ok(res, { count: n.length, items: n });
}));
export default r;

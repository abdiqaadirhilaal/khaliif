import mongoose, { ClientSession } from "mongoose";
import { Product } from "../models/Product";
import { Sale } from "../models/Sale";
import { SaleItem } from "../models/SaleItem";
import { Payment } from "../models/Payment";
import { Customer } from "../models/Customer";
import { InventoryTransaction } from "../models/InventoryTransaction";
import { CompanySettings } from "../models/CompanySettings";
import { AppError } from "../utils/http";
const r2 = (n: number) => Math.round(n * 100) / 100;
export async function createSale(d: any, userId: any, s?: ClientSession) {
  const sess = s || null;
  const merged = new Map<string, any>();
  for (const it of d.items) { const m = merged.get(it.product); m ? (m.quantity += it.quantity) : merged.set(it.product, { ...it }); }
  const items = [...merged.values()];
  const prods = await Product.find({ _id: { $in: items.map(i => i.product) } }).session(sess); const pm = new Map(prods.map(p => [String(p._id), p]));
  const lines: any[] = [];
  for (const it of items) {
    const p = pm.get(it.product); if (!p) throw new AppError(404, "Product not found");
    if (p.quantity < it.quantity) throw new AppError(400, `Not enough stock for ${p.name} (available ${p.quantity})`);
    const unitPrice = it.unitPrice ?? p.price; lines.push({ product: p._id, name: p.name, sku: p.sku, quantity: it.quantity, unitPrice, unitCost: p.costPrice, lineTotal: r2(unitPrice * it.quantity) });
  }
  const subtotal = r2(lines.reduce((a, l) => a + l.lineTotal, 0)); const discount = r2(Math.min(d.discount, subtotal)); const total = r2(subtotal - discount);
  const paid = r2(d.paid); if (paid > total) throw new AppError(400, "Paid amount cannot exceed the total");
  if (d.customer) { if (!(await Customer.exists({ _id: d.customer }))) throw new AppError(404, "Customer not found"); }
  else if (paid < total) throw new AppError(400, "Walk-in sales must be paid in full. Select a customer to allow a balance.");
  const settings = await CompanySettings.findOne().session(sess);
  const c: any = await mongoose.connection.collection("counters").findOneAndUpdate({ _id: "invoice" } as any, { $inc: { seq: 1 } }, { upsert: true, returnDocument: "after", session: s });
  const seq = (c?.value ?? c).seq; const invoiceNumber = `${settings?.system?.invoicePrefix || "INV-"}${String(seq).padStart(5, "0")}`;
  const saleDate = d.saleDate || new Date();
  const [sale] = await Sale.create([{ invoiceNumber, customer: d.customer || undefined, subtotal, discount, total, paid, balance: r2(total - paid), paymentMethod: d.paymentMethod, saleDate, notes: d.notes,
    costOfGoods: r2(lines.reduce((a, l) => a + l.unitCost * l.quantity, 0)), createdBy: userId }], { session: s });
  await SaleItem.insertMany(lines.map(l => ({ ...l, sale: sale._id })), { session: s });
  for (const l of lines) {
    const p = await Product.findOneAndUpdate({ _id: l.product, quantity: { $gte: l.quantity } }, { $inc: { quantity: -l.quantity } }, { new: true, session: s });
    if (!p) throw new AppError(400, `Not enough stock for ${l.name}`);
    await InventoryTransaction.create([{ product: l.product, type: "out", quantity: l.quantity, balanceAfter: p.quantity, reason: "Sale", reference: invoiceNumber, user: userId }], { session: s });
  }
  if (paid > 0) await Payment.create([{ customer: d.customer || undefined, sale: sale._id, amount: paid, method: d.paymentMethod, date: saleDate, reference: invoiceNumber, notes: "Payment at sale", createdBy: userId }], { session: s });
  if (d.customer) await Customer.updateOne({ _id: d.customer }, { $inc: { totalPurchases: total, totalPaid: paid, balance: r2(total - paid) } }, { session: s });
  return sale;
}

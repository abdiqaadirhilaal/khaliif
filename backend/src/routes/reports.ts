import { Router } from "express";
import { protect, allow } from "../middleware/auth";
import { Sale } from "../models/Sale";
import { SaleItem } from "../models/SaleItem";
import { Expense } from "../models/Expense";
import { Product } from "../models/Product";
import { Customer } from "../models/Customer";
import { Container } from "../models/Container";
import { Bundle } from "../models/Bundle";
import { AppError, ok, wrap } from "../utils/http";
const r = Router(); r.use(protect, allow("manager"));
const fmt: any = { day: "%Y-%m-%d", week: "%G-W%V", month: "%Y-%m", year: "%Y" };
const C = (key: string, label: string, money = false) => ({ key, label, money });
const salesBy = (g: string, from: Date, to: Date) => Sale.aggregate([{ $match: { saleDate: { $gte: from, $lte: to } } }, { $group: { _id: { $dateToString: { format: fmt[g] || fmt.day, date: "$saleDate" } }, invoices: { $sum: 1 }, revenue: { $sum: "$total" }, discount: { $sum: "$discount" }, paid: { $sum: "$paid" }, due: { $sum: "$balance" }, cost: { $sum: "$costOfGoods" } } }, { $sort: { _id: 1 } }]);
const expBy = (g: string, from: Date, to: Date) => Expense.aggregate([{ $match: { date: { $gte: from, $lte: to } } }, { $group: { _id: { $dateToString: { format: fmt[g] || fmt.day, date: "$date" } }, total: { $sum: "$amount" } } }]);
const sumOf = async (M: any, field: string, match: any) => (await M.aggregate([{ $match: match }, { $group: { _id: null, t: { $sum: "$" + field } } }]))[0]?.t || 0;
r.get("/dashboard", wrap(async (_q, res) => {
  const now = new Date(); const sod = new Date(now); sod.setHours(0, 0, 0, 0); const som = new Date(now.getFullYear(), now.getMonth(), 1); const d30 = new Date(sod); d30.setDate(d30.getDate() - 29);
  const [today, month, monthCost, monthExp, products, stock, containers, customers, debt, sDay, eDay, top, byCat] = await Promise.all([
    sumOf(Sale, "total", { saleDate: { $gte: sod } }), sumOf(Sale, "total", { saleDate: { $gte: som } }), sumOf(Sale, "costOfGoods", { saleDate: { $gte: som } }), sumOf(Expense, "amount", { date: { $gte: som } }),
    Product.countDocuments(), sumOf(Product, "quantity", {}), Container.countDocuments({ status: { $in: ["arrived", "unloading", "completed"] } }), Customer.countDocuments(), sumOf(Customer, "balance", {}),
    salesBy("day", d30, now), expBy("day", d30, now),
    SaleItem.aggregate([{ $group: { _id: "$product", name: { $first: "$name" }, qty: { $sum: "$quantity" } } }, { $sort: { qty: -1 } }, { $limit: 5 }]),
    Product.aggregate([{ $group: { _id: "$category", qty: { $sum: "$quantity" } } }, { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "c" } }, { $project: { name: { $ifNull: [{ $arrayElemAt: ["$c.name", 0] }, "Other"] }, qty: 1 } }, { $sort: { qty: -1 } }])]);
  const sm = new Map(sDay.map((x: any) => [x._id, x])), em = new Map(eDay.map((x: any) => [x._id, x.total])); const series = [];
  for (let i = 0; i < 30; i++) { const d = new Date(d30); d.setDate(d.getDate() + i); const k = d.toISOString().slice(0, 10); const s: any = sm.get(k); const e: any = em.get(k) || 0; const rev = s?.revenue || 0; series.push({ date: k.slice(5), sales: rev, expenses: e, profit: rev - (s?.cost || 0) - e }); }
  ok(res, { cards: { today, month, products, stock, containers, customers, debt, monthExpenses: monthExp, profit: month - monthCost - monthExp }, month: { revenue: month, cogs: monthCost, gross: month - monthCost, expenses: monthExp, net: month - monthCost - monthExp }, series, top, byCat });
}));
r.get("/:type", wrap(async (req, res) => {
  const q = req.query as any; const from = q.from ? new Date(q.from + "T00:00:00.000Z") : new Date(0); const to = q.to ? new Date(q.to + "T23:59:59.999Z") : new Date("2999-01-01"); const g = q.group || "day"; const date = { $gte: from, $lte: to };
  let columns: any[] = [], rows: any[] = [];
  switch (req.params.type) {
    case "sales": columns = [C("period", "Period"), C("invoices", "Invoices"), C("revenue", "Revenue", true), C("discount", "Discount", true), C("paid", "Paid", true), C("due", "Outstanding", true), C("profit", "Gross profit", true)];
      rows = (await salesBy(g, from, to)).map((x: any) => ({ period: x._id, ...x, profit: x.revenue - x.cost })); break;
    case "profit": { columns = [C("period", "Period"), C("revenue", "Revenue", true), C("cost", "Cost of goods", true), C("gross", "Gross profit", true), C("expenses", "Expenses", true), C("net", "Net profit", true)];
      const [s, e] = await Promise.all([salesBy(g || "month", from, to), expBy(g || "month", from, to)]); const sm = new Map(s.map((x: any) => [x._id, x])), em = new Map(e.map((x: any) => [x._id, x.total]));
      rows = [...new Set([...sm.keys(), ...em.keys()])].sort().map(k => { const a: any = sm.get(k) || {}; const ex: any = em.get(k) || 0; const rev = a.revenue || 0, cost = a.cost || 0; return { period: k, revenue: rev, cost, gross: rev - cost, expenses: ex, net: rev - cost - ex }; }); break; }
    case "products": columns = [C("name", "Product"), C("sku", "SKU"), C("qty", "Qty sold"), C("revenue", "Revenue", true), C("profit", "Profit", true)];
      rows = (await SaleItem.aggregate([{ $match: { createdAt: date } }, { $group: { _id: "$product", name: { $first: "$name" }, sku: { $first: "$sku" }, qty: { $sum: "$quantity" }, revenue: { $sum: "$lineTotal" }, cost: { $sum: { $multiply: ["$quantity", "$unitCost"] } } } }, { $sort: { revenue: -1 } }])).map((x: any) => ({ ...x, profit: x.revenue - x.cost })); break;
    case "categories": columns = [C("name", "Category"), C("qty", "Qty sold"), C("revenue", "Revenue", true), C("profit", "Profit", true)];
      rows = (await SaleItem.aggregate([{ $match: { createdAt: date } }, { $lookup: { from: "products", localField: "product", foreignField: "_id", as: "p" } }, { $unwind: "$p" }, { $lookup: { from: "categories", localField: "p.category", foreignField: "_id", as: "c" } },
        { $group: { _id: { $arrayElemAt: ["$c.name", 0] }, qty: { $sum: "$quantity" }, revenue: { $sum: "$lineTotal" }, cost: { $sum: { $multiply: ["$quantity", "$unitCost"] } } } }, { $sort: { revenue: -1 } }])).map((x: any) => ({ name: x._id || "Uncategorized", qty: x.qty, revenue: x.revenue, profit: x.revenue - x.cost })); break;
    case "customers": columns = [C("name", "Customer"), C("phone", "Phone"), C("invoices", "Invoices"), C("total", "Purchases", true), C("paid", "Paid", true), C("due", "Balance", true)];
      rows = (await Sale.aggregate([{ $match: { saleDate: date } }, { $group: { _id: "$customer", invoices: { $sum: 1 }, total: { $sum: "$total" }, paid: { $sum: "$paid" }, due: { $sum: "$balance" } } }, { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "c" } }, { $sort: { total: -1 } }]))
        .map((x: any) => ({ name: x.c[0]?.name || "Walk-in", phone: x.c[0]?.phone || "-", invoices: x.invoices, total: x.total, paid: x.paid, due: x.due })); break;
    case "debts": columns = [C("name", "Customer"), C("phone", "Phone"), C("totalPurchases", "Purchases", true), C("totalPaid", "Paid", true), C("balance", "Balance", true)]; rows = await Customer.find({ balance: { $gt: 0 } }).sort("-balance").lean(); break;
    case "expenses": columns = [C("category", "Category"), C("count", "Entries"), C("total", "Total", true)];
      rows = (await Expense.aggregate([{ $match: { date } }, { $group: { _id: "$category", count: { $sum: 1 }, total: { $sum: "$amount" } } }, { $sort: { total: -1 } }])).map((x: any) => ({ category: x._id, count: x.count, total: x.total })); break;
    case "inventory": columns = [C("name", "Product"), C("sku", "SKU"), C("quantity", "Stock"), C("costPrice", "Cost", true), C("value", "Cost value", true), C("retail", "Retail value", true)];
      rows = (await Product.find().sort("name").lean()).map(p => ({ ...p, value: p.quantity * p.costPrice, retail: p.quantity * p.price })); break;
    case "containers": columns = [C("containerNumber", "Container"), C("supplier", "Supplier"), C("status", "Status"), C("totalCost", "Total cost", true), C("bundles", "Bundles"), C("revenue", "Expected revenue", true), C("profit", "Expected profit", true)];
      { const cs = await Container.find({ createdAt: date }).sort("-createdAt").lean(); const agg = await Bundle.aggregate([{ $group: { _id: "$container", n: { $sum: 1 }, rev: { $sum: "$sellingPrice" } } }]); const m = new Map(agg.map((a: any) => [String(a._id), a]));
        rows = cs.map((c: any) => { const a: any = m.get(String(c._id)); return { ...c, supplier: c.supplier || "-", bundles: a?.n || 0, revenue: a?.rev || 0, profit: (a?.rev || 0) - c.totalCost }; }); } break;
    case "bundles": columns = [C("bundleNumber", "Bundle"), C("container", "Container"), C("quantity", "Qty"), C("cost", "Cost", true), C("sellingPrice", "Price", true), C("profit", "Profit", true), C("status", "Status")];
      rows = (await Bundle.find({ createdAt: date }).populate("container", "containerNumber").sort("-createdAt").lean()).map((b: any) => ({ ...b, container: b.container?.containerNumber || "-", profit: b.sellingPrice - b.cost })); break;
    default: throw new AppError(404, "Unknown report");
  }
  ok(res, { type: req.params.type, columns, rows });
}));
export default r;

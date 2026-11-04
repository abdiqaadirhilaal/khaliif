import { Router } from "express";
import { z } from "zod";
import { crud } from "../utils/crud";
import { Customer } from "../models/Customer";
import { Sale } from "../models/Sale";
import { Payment } from "../models/Payment";
import { protect, allow } from "../middleware/auth";
import { AppError, ok, wrap } from "../utils/http";
const r = Router();
r.get("/:id/statement", protect, allow("manager", "sales", "cashier"), wrap(async (req, res) => {
  const customer = await Customer.findById(req.params.id); if (!customer) throw new AppError(404, "Customer not found");
  const [sales, payments] = await Promise.all([Sale.find({ customer: customer._id }).sort("-saleDate").limit(200).lean(), Payment.find({ customer: customer._id }).sort("-date").limit(200).lean()]);
  ok(res, { customer, sales, payments });
}));
r.use(crud({
  model: Customer, label: "Customer", search: ["name", "phone", "businessName"], read: ["manager", "sales", "cashier"], write: ["manager", "sales"],
  schema: z.object({ name: z.string().min(2), phone: z.string().min(5), email: z.string().email().optional(), address: z.string().optional(), businessName: z.string().optional(), notes: z.string().optional() }),
  beforeDelete: async id => { const c = await Customer.findById(id); if (c && (c.balance !== 0 || (await Sale.exists({ customer: id })))) throw new AppError(409, "Customer has sales or a balance and cannot be deleted."); },
}));
export default r;

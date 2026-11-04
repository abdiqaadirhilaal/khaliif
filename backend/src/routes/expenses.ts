import { z } from "zod";
import { crud } from "../utils/crud";
import { Expense, EXPENSE_CATEGORIES } from "../models/Expense";
export default crud({
  model: Expense, label: "Expense", search: ["title"], filters: ["category"], populate: { path: "user", select: "name" }, sort: "-date", read: ["manager"], write: ["manager"], stamp: req => ({ user: req.user._id }),
  schema: z.object({ title: z.string().min(2), category: z.enum(EXPENSE_CATEGORIES as [string, ...string[]]), amount: z.coerce.number().min(0), date: z.coerce.date().optional(), description: z.string().optional(), receipt: z.string().optional() }),
});

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { Message } from "../models/Message";
import { protect, allow } from "../middleware/auth";
import { AppError, ok, wrap } from "../utils/http";
const r = Router();
const limiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { success: false, message: "Too many messages. Please call us instead." } });
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
r.post("/", limiter, wrap(async (req, res) => {
  const d = z.object({ name: z.string().min(2).max(100), phone: z.string().min(6).max(30), email: z.string().email().optional().or(z.literal("")),
    subject: z.string().min(2).max(150), message: z.string().min(5).max(2000), productRef: z.string().max(100).optional() }).parse(req.body);
  await Message.create(d); ok(res, {}, "Message sent. We will contact you soon.", 201);
}));
const staff = [protect, allow("manager")];
r.get("/unread-count", ...staff, wrap(async (_q, res) => ok(res, { count: await Message.countDocuments({ status: "unread" }) })));
r.get("/", ...staff, wrap(async (req, res) => {
  const { q, status } = req.query as any; const p = Math.max(1, +(req.query.page as string) || 1), l = 20; const f: any = {};
  if (status) f.status = status;
  if (q) f.$or = ["name", "phone", "subject"].map(k => ({ [k]: new RegExp(esc(q), "i") }));
  const [items, total] = await Promise.all([Message.find(f).sort("-createdAt").skip((p - 1) * l).limit(l), Message.countDocuments(f)]);
  ok(res, { items, total, page: p, pages: Math.ceil(total / l) });
}));
r.put("/:id", ...staff, wrap(async (req, res) => {
  const { status } = z.object({ status: z.enum(["unread", "read", "replied", "closed"]) }).parse(req.body);
  const m = await Message.findByIdAndUpdate(req.params.id, { status }, { new: true }); if (!m) throw new AppError(404, "Message not found"); ok(res, m, "Message updated");
}));
r.delete("/:id", ...staff, wrap(async (req, res) => { if (!(await Message.findByIdAndDelete(req.params.id))) throw new AppError(404, "Message not found"); ok(res, {}, "Message deleted"); }));
export default r;

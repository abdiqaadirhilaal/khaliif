import { Router } from "express";
import { z } from "zod";
import { protect, allow, Role } from "../middleware/auth";
import { AppError, ok, wrap } from "./http";
export const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
interface Opts { model: any; schema: z.ZodObject<any>; label: string; search?: string[]; populate?: any; sort?: string; filters?: string[]; read: Role[]; write: Role[];
  decorate?: (items: any[]) => Promise<any[]>; beforeDelete?: (id: string) => Promise<void>; stamp?: (req: any) => any }
export function crud(o: Opts) {
  const r = Router(); r.use(protect);
  r.get("/", allow(...o.read), wrap(async (req, res) => {
    const q = req.query as any; const f: any = {}; const p = Math.max(1, +q.page || 1), l = Math.min(100, +q.limit || 10);
    (o.filters || []).forEach(k => q[k] && (f[k] = q[k]));
    if (q.q && o.search) f.$or = o.search.map(k => ({ [k]: new RegExp(esc(q.q), "i") }));
    const [rows, total] = await Promise.all([o.model.find(f).populate(o.populate || "").sort(o.sort || "-createdAt").skip((p - 1) * l).limit(l).lean(), o.model.countDocuments(f)]);
    ok(res, { items: o.decorate ? await o.decorate(rows) : rows, total, page: p, pages: Math.ceil(total / l) });
  }));
  r.get("/:id", allow(...o.read), wrap(async (req, res) => { const d = await o.model.findById(req.params.id).populate(o.populate || ""); if (!d) throw new AppError(404, `${o.label} not found`); ok(res, d); }));
  r.post("/", allow(...o.write), wrap(async (req, res) => ok(res, await o.model.create({ ...o.schema.parse(req.body), ...(o.stamp ? o.stamp(req) : {}) }), `${o.label} created`, 201)));
  r.put("/:id", allow(...o.write), wrap(async (req, res) => {
    const d = await o.model.findById(req.params.id); if (!d) throw new AppError(404, `${o.label} not found`);
    d.set(o.schema.partial().parse(req.body)); await d.save(); ok(res, d, `${o.label} updated`);
  }));
  r.delete("/:id", allow(...o.write), wrap(async (req, res) => {
    if (o.beforeDelete) await o.beforeDelete(req.params.id);
    if (!(await o.model.findByIdAndDelete(req.params.id))) throw new AppError(404, `${o.label} not found`); ok(res, {}, `${o.label} deleted`);
  }));
  return r;
}

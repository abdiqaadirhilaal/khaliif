import { Router } from "express";
import { CompanySettings } from "../models/CompanySettings";
import { protect, allow } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { ok, wrap } from "../utils/http";
const r = Router();
const get = async () => (await CompanySettings.findOne()) || (await CompanySettings.create({}));
r.get("/", wrap(async (_q, res) => ok(res, await get())));
r.put("/", protect, allow("manager"), upload.single("logo"), wrap(async (req, res) => {
  const body = typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body;
  if (req.file) body.logo = `/uploads/${req.file.filename}`;
  const s = await get(); s.set(body); await s.save(); ok(res, s, "Settings saved");
}));
export default r;

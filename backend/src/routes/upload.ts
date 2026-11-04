import { Router } from "express";
import { protect } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { AppError, ok, wrap } from "../utils/http";
const r = Router();
r.post("/", protect, upload.single("file"), wrap(async (req, res) => { if (!req.file) throw new AppError(400, "No file uploaded"); ok(res, { url: `/uploads/${req.file.filename}` }, "Uploaded"); }));
export default r;

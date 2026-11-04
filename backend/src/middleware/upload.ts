import multer from "multer";
import path from "path";
import crypto from "crypto";
import { AppError } from "../utils/http";
export const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "../../uploads"),
    filename: (_q, f, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${path.extname(f.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_q, f, cb) => /^image\/(png|jpe?g|webp|gif)$/.test(f.mimetype) ? cb(null, true) : cb(new AppError(400, "Only image files are allowed")),
});

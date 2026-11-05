import { Router } from "express";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { env } from "../config/env";
import { User } from "../models/User";
import { AppError, ok, wrap } from "../utils/http";
import { protect } from "../middleware/auth";
const r = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: "Too many attempts. Try again in 15 minutes." } });
r.post("/login", limiter, wrap(async (req, res) => {
  const { email, password } = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) }).parse(req.body);
  const user: any = await User.findOne({ email }).select("+password");
  if (!user || !user.active || !(await user.matches(password))) throw new AppError(401, "Invalid email or password");
  const token = jwt.sign({ id: user.id }, env.jwtSecret, { expiresIn: env.jwtExpires as any });
  ok(res, { token, user }, "Logged in");
}));
r.get("/me", protect, wrap(async (req, res) => ok(res, { user: (req as any).user })));
export default r;

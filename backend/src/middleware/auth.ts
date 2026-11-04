import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/User";
import { AppError } from "../utils/http";
export type Role = "super_admin" | "manager" | "sales" | "cashier";
export async function protect(req: Request, _res: Response, next: NextFunction) {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer ")) throw new AppError(401, "Not authenticated");
    const { id } = jwt.verify(h.slice(7), env.jwtSecret) as { id: string };
    const user = await User.findById(id);
    if (!user || !user.active) throw new AppError(401, "Account not found or disabled");
    (req as any).user = user; next();
  } catch (e) { next(e instanceof AppError ? e : new AppError(401, "Invalid or expired token")); }
}
export const allow = (...roles: Role[]) => (req: Request, _res: Response, next: NextFunction) => {
  const u = (req as any).user;
  if (u?.role === "super_admin" || roles.includes(u?.role)) return next();
  next(new AppError(403, "You do not have permission for this action"));
};

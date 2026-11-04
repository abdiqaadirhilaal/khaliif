import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/http";
export const notFound = (_q: Request, _s: Response, next: NextFunction) => next(new AppError(404, "Route not found"));
export function errorHandler(err: any, _q: Request, res: Response, _n: NextFunction) {
  let status = 500, message = "Something went wrong";
  if (err instanceof AppError) { status = err.status; message = err.message; }
  else if (err instanceof ZodError) { status = 400; message = err.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "); }
  else if (err?.name === "ValidationError") { status = 400; message = Object.values<any>(err.errors).map(e => e.message).join(", "); }
  else if (err?.name === "CastError") { status = 400; message = "Invalid id"; }
  else if (err?.code === 11000) { status = 409; message = `Duplicate value: ${Object.keys(err.keyValue || {}).join(", ")}`; }
  else console.error(err);
  res.status(status).json({ success: false, message });
}

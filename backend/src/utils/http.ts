import { Request, Response, NextFunction, RequestHandler } from "express";
export class AppError extends Error { constructor(public status: number, message: string) { super(message); } }
export const ok = (res: Response, data: unknown = {}, message = "OK", status = 200) => res.status(status).json({ success: true, message, data });
export const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler => (req, res, next) => { fn(req, res, next).catch(next); };

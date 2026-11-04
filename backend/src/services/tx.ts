import mongoose, { ClientSession } from "mongoose";
// Runs fn in a MongoDB transaction. Standalone (non replica-set) MongoDB cannot do transactions, so we fall back to
// running without one (all validation happens before any write, so this stays consistent in normal use).
export async function withTx<T>(fn: (s?: ClientSession) => Promise<T>): Promise<T> {
  const s = await mongoose.startSession();
  try { let out!: T; await s.withTransaction(async () => { out = await fn(s); }); return out; }
  catch (e: any) { if (/replica set|Transaction numbers/i.test(e?.message || "")) return fn(undefined); throw e; }
  finally { await s.endSession(); }
}

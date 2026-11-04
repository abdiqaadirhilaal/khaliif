import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
const s = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ["super_admin", "manager", "sales", "cashier"], default: "sales" },
  active: { type: Boolean, default: true },
}, { timestamps: true });
s.pre("save", async function (this: any, next: () => void) { if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12); next(); });
s.methods.matches = function (this: any, p: string) { return bcrypt.compare(p, this.password); };
s.set("toJSON", { transform: (_d, r: any) => { delete r.password; delete r.__v; return r; } });
export const User = model("User", s);

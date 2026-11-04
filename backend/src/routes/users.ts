import { z } from "zod";
import { crud } from "../utils/crud";
import { User } from "../models/User";
import { AppError } from "../utils/http";
const bool = z.union([z.boolean(), z.enum(["true", "false"])]).transform(v => v === true || v === "true");
export default crud({
  model: User, label: "User", search: ["name", "email"], filters: ["role"], read: [], write: [],
  schema: z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8, "Password must be at least 8 characters").optional(), role: z.enum(["super_admin", "manager", "sales", "cashier"]), active: bool.default(true) }),
  beforeDelete: async id => { const u = await User.findById(id); if (u?.role === "super_admin" && (await User.countDocuments({ role: "super_admin" })) <= 1) throw new AppError(409, "Cannot delete the last Super Admin"); },
});

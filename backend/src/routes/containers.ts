import { z } from "zod";
import { crud } from "../utils/crud";
import { Container } from "../models/Container";
import { Bundle } from "../models/Bundle";
import { AppError } from "../utils/http";
const n = z.coerce.number().min(0).default(0);
export default crud({
  model: Container, label: "Container", search: ["containerNumber", "reference", "supplier"], filters: ["status"], read: ["manager"], write: ["manager"],
  schema: z.object({ containerNumber: z.string().min(1), reference: z.string().optional(), arrivalDate: z.coerce.date().optional(), supplier: z.string().optional(), originCountry: z.string().optional(),
    shippingCompany: z.string().optional(), purchaseCost: n, shippingCost: n, customsCost: n, transportCost: n, otherCosts: n, notes: z.string().optional(),
    status: z.enum(["ordered", "in_transit", "arrived", "unloading", "completed"]).default("ordered") }),
  decorate: async items => {
    const agg = await Bundle.aggregate([{ $match: { container: { $in: items.map(i => i._id) } } }, { $group: { _id: "$container", count: { $sum: 1 }, revenue: { $sum: "$sellingPrice" } } }]);
    const m = new Map(agg.map(a => [String(a._id), a]));
    return items.map(i => { const a: any = m.get(String(i._id)); const expectedRevenue = a?.revenue || 0; return { ...i, bundleCount: a?.count || 0, expectedRevenue, expectedProfit: expectedRevenue - (i.totalCost || 0) }; });
  },
  beforeDelete: async id => { if (await Bundle.exists({ container: id })) throw new AppError(409, "Container has bundles. Remove them first."); },
});

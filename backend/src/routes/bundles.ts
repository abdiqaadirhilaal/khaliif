import { z } from "zod";
import { crud } from "../utils/crud";
import { Bundle } from "../models/Bundle";
export default crud({
  model: Bundle, label: "Bundle", search: ["bundleNumber", "clothingType"], filters: ["container", "status", "category"], populate: [{ path: "container", select: "containerNumber" }, { path: "category", select: "name" }], read: ["manager"], write: ["manager"],
  schema: z.object({ bundleNumber: z.string().min(1), container: z.string().min(1), category: z.string().optional(), clothingType: z.string().optional(), gender: z.string().optional(),
    weight: z.coerce.number().min(0).optional(), quantity: z.coerce.number().int().min(0).default(0), cost: z.coerce.number().min(0).default(0), sellingPrice: z.coerce.number().min(0).default(0), notes: z.string().optional(),
    status: z.enum(["available", "opened", "sold", "partially_sold"]).default("available") }),
});

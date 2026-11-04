import { Schema, model } from "mongoose";
const n = { type: Number, default: 0, min: 0 };
const s = new Schema({
  containerNumber: { type: String, required: true, unique: true, uppercase: true }, reference: String, arrivalDate: Date, supplier: String,
  originCountry: String, shippingCompany: String, purchaseCost: n, shippingCost: n, customsCost: n, transportCost: n, otherCosts: n, totalCost: n,
  notes: String, status: { type: String, enum: ["ordered", "in_transit", "arrived", "unloading", "completed"], default: "ordered" },
}, { timestamps: true });
s.pre("save", function (this: any, next: () => void) { this.totalCost = (this.purchaseCost||0)+(this.shippingCost||0)+(this.customsCost||0)+(this.transportCost||0)+(this.otherCosts||0); next(); });
export const Container = model("Container", s);

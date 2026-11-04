import { Schema, model } from "mongoose";
export const CompanySettings = model("CompanySettings", new Schema({
  companyName: { type: String, default: "KHALIIF SECOND HAND CLOTHES COMPANY" }, logo: { type: String, default: "/logo.png" },
  phone1: { type: String, default: "+252619593932" }, phone2: { type: String, default: "+252612588896" }, whatsapp: { type: String, default: "+252619593932" }, email: String,
  address: String, city: String, country: String, latitude: Number, longitude: Number, googleMapsUrl: String,
  social: { facebook: String, instagram: String, tiktok: String, youtube: String },
  website: { heroTitle: String, heroDescription: String, aboutText: String, footerText: String, mission: String, vision: String, values: [String], stats: [{ label: String, value: String }] },
  system: { currency: { type: String, default: "USD" }, invoicePrefix: { type: String, default: "INV-" }, taxRate: { type: Number, default: 0 }, lowStockThreshold: { type: Number, default: 10 }, showPrices: { type: Boolean, default: true } },
}, { timestamps: true }));

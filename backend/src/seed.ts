import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { User } from "./models/User";
import { Category } from "./models/Category";
import { Product } from "./models/Product";
import { CompanySettings } from "./models/CompanySettings";
(async () => {
  await connectDB();
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Super Admin";
  if (!email || !password || password === "CHANGE_THIS_PASSWORD") throw new Error("Set ADMIN_EMAIL and a real ADMIN_PASSWORD in .env first");
  // Upsert the single admin account by normalized email; never create duplicates.
  const admin = await User.findOne({ email });
  if (admin) {
    admin.name = name;
    admin.password = password;
    admin.role = "super_admin";
    admin.active = true;
    await admin.save();
    console.log("Admin updated:", email);
  } else {
    await User.create({ name, email, password, role: "super_admin", active: true });
    console.log("Admin created:", email);
  }
  const names = ["Men's Clothes","Women's Clothes","Children's Clothes","Shirts","Trousers","Dresses","Jackets","Jeans","Sportswear","Mixed Bundles","Other"];
  for (const name of names) await Category.updateOne({ name }, { $setOnInsert: { name, active: true } }, { upsert: true });
  if (!(await CompanySettings.findOne())) await CompanySettings.create({ website: {
    heroTitle: "Quality second-hand clothes, supplied in containers and bundles",
    heroDescription: "Khaliif Second Hand Clothes Company supplies quality used clothing to wholesale and retail buyers.",
    values: ["Quality", "Honesty", "Value"], stats: [] } });
  if (!(await Product.countDocuments())) {
    const c = async (n: string) => (await Category.findOne({ name: n }))!._id;
    await Product.insertMany([
      { name: "Men's Denim Jeans", sku: "JNS-001", category: await c("Jeans"), price: 8, costPrice: 4, quantity: 120, gender: "men", published: true, featured: true, description: "Graded used denim jeans." },
      { name: "Women's Summer Dresses", sku: "DRS-001", category: await c("Dresses"), price: 6, costPrice: 3, quantity: 80, gender: "women", published: true, featured: true, description: "Assorted used dresses." },
      { name: "Mixed Bundle (Grade A)", sku: "BND-A01", category: await c("Mixed Bundles"), price: 150, costPrice: 100, quantity: 15, gender: "unisex", published: true, description: "Mixed clothing bundle." },
    ]);
  }
  console.log("Seed complete"); await mongoose.disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });

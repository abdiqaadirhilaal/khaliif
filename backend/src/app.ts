import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import categoryRoutes from "./routes/categories";
import messageRoutes from "./routes/messages";
import settingsRoutes from "./routes/settings";
import containerRoutes from "./routes/containers";
import bundleRoutes from "./routes/bundles";
import customerRoutes from "./routes/customers";
import inventoryRoutes from "./routes/inventory";
import salesRoutes from "./routes/sales";
import paymentRoutes from "./routes/payments";
import expenseRoutes from "./routes/expenses";
import userRoutes from "./routes/users";
import uploadRoutes from "./routes/upload";
import notificationRoutes from "./routes/notifications";
import reportRoutes from "./routes/reports";
import { errorHandler, notFound } from "./middleware/error";
const app = express();
// Hostinger sits behind a single reverse proxy; trust it so rate limiting
// and req.ip read the real client IP from X-Forwarded-For.
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
const allowedOrigins = env.clientUrl.split(",").map((o) => o.trim()).filter(Boolean);
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)), credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.get("/", (_q, res) =>
  res.json({
    success: true,
    message: "Khaliif API running",
    data: {
      status: "online",
      version: "1.0.0",
      health: "/api/health",
    },
  })
);
app.get("/api/health", (_q, res) => res.json({ success: true, message: "API running", data: {} }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/containers", containerRoutes);
app.use("/api/bundles", bundleRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;

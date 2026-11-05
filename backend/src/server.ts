import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";

// Start listening immediately so the host's health check passes,
// then connect to MongoDB without blocking the process.
const port = Number(process.env.PORT) || env.port;

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Khaliif API running on port ${port}`);
});

connectDB()
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

export default server;

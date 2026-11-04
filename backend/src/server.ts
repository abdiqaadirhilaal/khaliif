import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
connectDB().then(() => app.listen(env.port, () => console.log(`API on http://localhost:${env.port}`))).catch(e => { console.error(e.message); process.exit(1); });

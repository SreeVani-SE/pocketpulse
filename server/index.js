import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import transactionsRouter from "./routes/transactions.js";
import { requireAuth } from "./middleware/auth.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://YOUR_USERNAME.github.io",
],
    credentials: false,
  })
);

app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/transactions", requireAuth, transactionsRouter);

// Error handler (nice JSON)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI in server/.env");
    process.exit(1);
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error("Missing GOOGLE_CLIENT_ID in server/.env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Mongo connected");

  app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});

import express from "express";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

process.on("unhandledRejection", (reason) => {
  console.warn("Unhandled Promise Rejection (prevented crash):", reason?.message || reason);
});

process.on("uncaughtException", (err) => {
  console.warn("Uncaught Exception (prevented crash):", err?.message || err);
});
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import checkAuth from "./middlewares/authMiddleware.js";
import { connectDB } from "./config/db.js";

// const mySecretKey = "ProCodrr-storageApp-123$#";

await connectDB();

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.startsWith("http://localhost:") ||
        origin.includes("netlify.app") ||
        origin.includes("vercel.app") ||
        (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.send("Apexvault Backend API is Live! 🚀");
});

app.use("/directory", checkAuth, directoryRoutes);
app.use("/file", checkAuth, fileRoutes);
app.use("/", userRoutes);
app.use("/auth", authRoutes);
app.use("/subscription", checkAuth, subscriptionRoutes);
app.use("/webhooks", webhookRoutes)
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server Started`);
});





import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import stripeRouter from "./routes/stripeRoutes.js";

const app = express();

try {
  connectCloudinary();
} catch (err) {
  console.warn("Cloudinary init warning:", err.message);
}

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  })
);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Vercel serverless URL rewrite path normalizer
app.use((req, res, next) => {
  if (req.url.includes("api/index.js")) {
    req.url = req.url.replace(/\/api\/index\.js\/?/, "/");
  }
  if (!req.url.startsWith("/")) {
    req.url = "/" + req.url;
  }
  next();
});

app.use(express.json());

// Clerk authentication middleware
try {
  app.use(clerkMiddleware());
} catch (err) {
  console.warn("Clerk middleware warning:", err.message);
}

app.get("/", (req, res) => res.send("Server is Live!"));
app.get("/api", (req, res) => res.send("Server API is Live!"));

// Multi-path API router mounts (matches both /api/ai and /ai, etc.)
app.use(["/api/stripe", "/stripe"], stripeRouter);
app.use(["/api/ai", "/ai"], aiRouter);
app.use(["/api/user", "/user"], userRouter);

// Global Catch-all to prevent 404 status code (no body)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Express Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Server is running on port ${PORT} => http://localhost:${PORT} 🍽️`
    );
  });
}

export default app;

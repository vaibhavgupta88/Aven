import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { clerkMiddleware } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import stripeRouter from "./routes/stripeRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

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
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-api-key",
      "x-user-id",
      "X-User-Id",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
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

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Clerk authentication middleware
try {
  app.use(
    clerkMiddleware({
      publishableKey:
        process.env.CLERK_PUBLISHABLE_KEY ||
        "pk_test_bmljZS1zbmFwcGVyLTQ2LmNsZXJrLmFjY291bnRzLmRldiQ",
      secretKey: process.env.CLERK_SECRET_KEY,
    })
  );
} catch (err) {
  console.warn("Clerk middleware warning:", err.message);
}

import fs from "fs";

// Multi-path API router mounts
app.use("/api/stripe", stripeRouter);
app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);

app.get("/api", (req, res) => res.json({ success: true, message: "Server API is Live!" }));

// Serve static client build if available
const clientDistPath = path.resolve(__dirname, "../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.url.startsWith("/api")) {
      return next();
    }
    const indexPath = path.join(clientDistPath, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
} else {
  app.get("/", (req, res) => res.send("Server is Live! (Frontend build not found)"));
}

// Global Catch-all for undefined API routes
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

// Listen on all platforms (Render, Railway, VPS, Local) except Vercel serverless functions
if (process.env.VERCEL !== "1") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Server is running on port ${PORT} => http://localhost:${PORT} 🍽️`
    );
  });
}

export default app;

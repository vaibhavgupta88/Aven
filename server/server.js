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
app.options("*", cors());
app.use(express.json());

// Defensive Clerk Middleware wrapper for Serverless runtime stability
app.use((req, res, next) => {
  if (!process.env.CLERK_SECRET_KEY && !process.env.CLERK_PUBLISHABLE_KEY) {
    return next();
  }
  try {
    return clerkMiddleware()(req, res, next);
  } catch (err) {
    console.error("Clerk Middleware Error:", err.message);
    return next();
  }
});

app.get("/", (req, res) => res.send("Server is Live!"));
app.get("/api", (req, res) => res.send("Server API is Live!"));

app.use("/api/stripe", stripeRouter);
app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);

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

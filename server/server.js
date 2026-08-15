import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import stripeRouter from "./routes/stripeRoutes.js";

const app = express();

connectCloudinary();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"]
}));
app.options("*", cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("Server is Live!"));

app.use("/api/stripe", stripeRouter);
app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Server is running on port ${PORT} => http://localhost:${PORT} 🍽️`
    );
  });
}

export default app;

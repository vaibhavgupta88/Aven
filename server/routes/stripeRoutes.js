import express from "express";
import {
  createCheckoutSession,
  verifyPayment,
  handleStripeWebhook,
} from "../controllers/stripeController.js";
import { auth } from "../middlewares/auth.js";

const stripeRouter = express.Router();

stripeRouter.post("/create-checkout-session", auth, createCheckoutSession);
stripeRouter.get("/verify-payment", auth, verifyPayment);
stripeRouter.post("/verify-payment", auth, verifyPayment);
stripeRouter.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

export default stripeRouter;

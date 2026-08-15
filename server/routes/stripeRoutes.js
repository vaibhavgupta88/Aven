import express from "express";
import { createCheckoutSession, handleStripeWebhook } from "../controllers/stripeController.js";
import { requireAuth } from "@clerk/express";

const stripeRouter = express.Router();

stripeRouter.post("/create-checkout-session", requireAuth(), createCheckoutSession);
stripeRouter.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

export default stripeRouter;

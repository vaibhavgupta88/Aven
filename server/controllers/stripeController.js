import Stripe from "stripe";
import { clerkClient } from "@clerk/express";
import sql from "../configs/db.js";

const getUserId = (req) =>
  req.userId ||
  (typeof req.auth === "function" ? req.auth()?.userId : req.auth?.userId);

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { planId = "premium" } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");

    // Fallback if Stripe key is not configured
    if (!stripeKey || stripeKey.trim() === "") {
      return res.json({
        success: true,
        demoMode: true,
        message: "Stripe key not configured. Demo checkout initialized.",
        url: `${clientUrl}/payment-success?demo=true&plan=${planId}`,
      });
    }

    const stripe = new Stripe(stripeKey);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: planId === "premium" ? "Aven AI Premium Plan" : "Aven AI Starter Plan",
              description: "Unlimited AI content tools, 4K image studio, & ATS resume scanner.",
            },
            unit_amount: planId === "premium" ? 1900 : 0,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/#pricing`,
      metadata: {
        userId,
        planId,
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { sessionId, demo, planId = "premium" } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (demo === "true") {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: { plan: planId },
          privateMetadata: { plan: planId },
        });
      } catch (err) {
        console.warn("Clerk update note:", err.message);
      }
      return res.json({ success: true, plan: planId, message: "Payment verified (Demo Mode)" });
    }

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session ID is required" });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return res.status(400).json({ success: false, message: "Stripe key is not configured" });
    }

    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const targetPlan = session.metadata?.planId || planId || "premium";
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: { plan: targetPlan },
          privateMetadata: { plan: targetPlan },
        });
        await sql`UPDATE users SET plan = ${targetPlan} WHERE user_id = ${userId}`;
      } catch (e) {
        console.warn("Metadata update note:", e.message);
      }
      return res.json({ success: true, plan: targetPlan, message: "Payment successfully verified!" });
    } else {
      return res.json({ success: false, message: "Payment not completed or pending." });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return res.status(400).send("Webhook secret or Stripe key not set");
  }

  const stripe = new Stripe(stripeKey);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    const payload = req.rawBody || req.body;
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId || "premium";

    if (session.payment_status === "paid" && userId) {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: { plan: planId },
        privateMetadata: { plan: planId },
      });
      try {
        await sql`UPDATE users SET plan = ${planId} WHERE user_id = ${userId}`;
      } catch (dbErr) {
        console.log("Database update note:", dbErr.message);
      }
    }
  }

  res.json({ received: true });
};

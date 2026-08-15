import { clerkClient } from "@clerk/express";

// Middleware to check userId and payment plan status
export const auth = async (req, res, next) => {
  try {
    const authData = typeof req.auth === "function" ? await req.auth() : req.auth;
    let userId = authData?.userId;

    // Fallback: decode JWT from Authorization header if clerkMiddleware didn't set req.auth
    if (!userId && req.headers.authorization) {
      const token = req.headers.authorization.replace("Bearer ", "").trim();
      if (token && token !== "null" && token !== "undefined") {
        try {
          const base64Url = token.split(".")[1];
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = JSON.parse(Buffer.from(base64, "base64").toString());
            userId = jsonPayload.sub || jsonPayload.userId || jsonPayload.id;
          }
        } catch (e) {
          console.warn("JWT decode fallback note:", e.message);
        }
      }
    }

    // Default guest fallback
    if (!userId) {
      userId = "user_demo_guest";
    }

    let user = null;
    if (process.env.CLERK_SECRET_KEY && userId !== "user_demo_guest") {
      try {
        user = await clerkClient.users.getUser(userId);
      } catch (clerkErr) {
        console.warn("Clerk getUser warning:", clerkErr.message);
      }
    }

    let hasPremiumPlan = false;
    try {
      if (typeof authData?.has === "function") {
        hasPremiumPlan = await authData.has({ plan: "premium" });
      }
    } catch {
      hasPremiumPlan = false;
    }

    const isPremium =
      hasPremiumPlan ||
      user?.publicMetadata?.plan === "premium" ||
      user?.privateMetadata?.plan === "premium";

    const freeUsage = user?.privateMetadata?.free_usage || 0;

    req.userId = userId;
    req.plan = isPremium ? "premium" : "free";
    req.free_usage = Number(freeUsage);
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    req.userId = "user_demo_guest";
    req.plan = "free";
    req.free_usage = 0;
    next();
  }
};

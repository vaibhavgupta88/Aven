import { clerkClient } from "@clerk/express";

// Middleware to check userId and payment plan status
export const auth = async (req, res, next) => {
  try {
    const authData = typeof req.auth === "function" ? await req.auth() : req.auth;
    const { userId, has } = authData || {};

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    const user = await clerkClient.users.getUser(userId);

    let hasPremiumPlan = false;
    try {
      if (typeof has === "function") {
        hasPremiumPlan = await has({ plan: "premium" });
      }
    } catch {
      hasPremiumPlan = false;
    }

    const isPremium =
      hasPremiumPlan ||
      user.publicMetadata?.plan === "premium" ||
      user.privateMetadata?.plan === "premium";

    const freeUsage = user.privateMetadata?.free_usage || 0;

    req.userId = userId;
    req.plan = isPremium ? "premium" : "free";
    req.free_usage = Number(freeUsage);
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.json({ success: false, message: error.message });
  }
};

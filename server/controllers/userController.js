import sql from "../configs/db.js";
import {
  getCreationsByUser,
  getAllCreations,
  getPublishedMemoryCreations,
  removeCreation,
} from "../configs/creationsStore.js";

const getUserId = (req) =>
  req.userId ||
  (typeof req.auth === "function" ? req.auth()?.userId : req.auth?.userId) ||
  "user_demo_guest";

export const getUserCreations = async (req, res) => {
  try {
    const userId = getUserId(req);

    let dbCreations = [];
    try {
      dbCreations =
        await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;
    } catch (e) {
      console.warn("DB query note:", e.message);
    }

    const memoryCreations = getCreationsByUser(userId);

    // Combine DB + in-memory creations, deduplicating by ID
    const combinedMap = new Map();
    [...(Array.isArray(dbCreations) ? dbCreations : []), ...memoryCreations].forEach(
      (item) => combinedMap.set(item.id, item)
    );

    const creations = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );

    res.json({ success: true, creations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getPublishedCreations = async (req, res) => {
  try {
    let dbCreations = [];
    try {
      dbCreations =
        await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
    } catch (e) {
      console.warn("DB query note:", e.message);
    }

    const memoryCreations = getPublishedMemoryCreations();
    const combinedMap = new Map();
    [...(Array.isArray(dbCreations) ? dbCreations : []), ...memoryCreations].forEach(
      (item) => {
        if (item.publish === true) {
          combinedMap.set(item.id, item);
        }
      }
    );

    const creations = Array.from(combinedMap.values());
    res.json({ success: true, creations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const toggleLikeCreation = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.body;

    let creation = null;
    try {
      const [res] = await sql`SELECT * FROM creations WHERE id = ${id}`;
      creation = res;
    } catch (e) {
      console.warn("DB query note:", e.message);
    }

    if (!creation) {
      const memoryItems = getAllCreations();
      creation = memoryItems.find((c) => c.id === id);
    }

    if (!creation) {
      return res.json({ success: false, message: "Creation not found" });
    }

    const currentLikes = Array.isArray(creation.likes) ? creation.likes : [];
    const userIdString = userId.toString();
    let updatedLikes;
    let message;

    if (currentLikes.includes(userIdString)) {
      updatedLikes = currentLikes.filter((u) => u !== userIdString);
      message = "Creation Unliked";
    } else {
      updatedLikes = [...currentLikes, userIdString];
      message = "Creation Liked";
    }

    try {
      await sql`UPDATE creations SET likes = ${updatedLikes} WHERE id = ${id}`;
    } catch (e) {
      console.warn("DB update note:", e.message);
    }
    creation.likes = updatedLikes;

    res.json({ success: true, message, likes: updatedLikes });
  } catch (error) {
    console.error("toggleLikeCreation error:", error);
    res.json({ success: false, message: error.message });
  }
};

export const getUserData = async (req, res) => {
  try {
    const plan = req.plan || "free";
    const freeUsage = req.free_usage || 0;
    const remainingCredits = plan === "premium" ? "Unlimited" : Math.max(0, 10 - freeUsage);

    res.json({
      success: true,
      plan,
      free_usage: freeUsage,
      credits: remainingCredits,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteCreation = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.body;

    if (!id) {
      return res.json({ success: false, message: "Creation ID is required" });
    }

    try {
      await sql`DELETE FROM creations WHERE id = ${id} AND user_id = ${userId}`;
    } catch (e) {
      console.warn("DB delete note:", e.message);
    }

    removeCreation(id, userId);

    res.json({ success: true, message: "Creation deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

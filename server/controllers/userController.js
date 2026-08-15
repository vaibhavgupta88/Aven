import sql from "../configs/db.js";

const getUserId = (req) =>
  req.userId ||
  (typeof req.auth === "function" ? req.auth()?.userId : req.auth?.userId);

export const getUserCreations = async (req, res) => {
  try {
    const userId = getUserId(req);

    const creations =
      await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getPublishedCreations = async (req, res) => {
  try {
    const creations =
      await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const toggleLikeCreation = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.body;

    const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

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

    await sql`UPDATE creations SET likes = ${updatedLikes} WHERE id = ${id}`;

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

    await sql`DELETE FROM creations WHERE id = ${id} AND user_id = ${userId}`;

    res.json({ success: true, message: "Creation deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

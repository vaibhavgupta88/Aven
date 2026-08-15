import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "creations.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn("Could not create data dir:", e.message);
  }
}

const defaultCommunityArt = [
  {
    id: "creation_community_demo_1",
    user_id: "user_community_creator_1",
    prompt: "Futuristic Cyberpunk Neon Megacity at Sunset in 3D style",
    content: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
    type: "image",
    publish: true,
    likes: ["user_demo_fan_1", "user_demo_fan_2"],
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "creation_community_demo_2",
    user_id: "user_community_creator_2",
    prompt: "Mystical Enchanted Forest with Bioluminescent Flora in Fantasy style",
    content: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
    type: "image",
    publish: true,
    likes: ["user_demo_fan_3"],
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "creation_community_demo_3",
    user_id: "user_community_creator_3",
    prompt: "Serene Minimalist Japanese Garden in Anime style",
    content: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
    type: "image",
    publish: true,
    likes: [],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

let memoryCreations = [];

// Load creations from disk
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryCreations = parsed;
    } else {
      memoryCreations = [...defaultCommunityArt];
      fs.writeFileSync(DATA_FILE, JSON.stringify(memoryCreations, null, 2));
    }
  } else {
    memoryCreations = [...defaultCommunityArt];
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryCreations, null, 2));
  }
} catch (e) {
  console.warn("Failed to load creations from data file, using default memory:", e.message);
  memoryCreations = [...defaultCommunityArt];
}

const persistToDisk = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryCreations, null, 2));
  } catch (e) {
    console.warn("Failed to persist creations to disk:", e.message);
  }
};

export const saveCreation = (userId, prompt, content, type, publish = false) => {
  const newCreation = {
    id: `creation_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    prompt,
    content,
    type,
    publish: Boolean(publish),
    likes: [],
    created_at: new Date().toISOString(),
  };

  memoryCreations.unshift(newCreation);
  persistToDisk();
  return newCreation;
};

export const getCreationsByUser = (userId) => {
  if (!userId) return [];
  return memoryCreations.filter((item) => item.user_id === userId);
};

export const getAllCreations = () => {
  return memoryCreations;
};

export const getPublishedMemoryCreations = () => {
  return memoryCreations.filter(
    (item) => item.publish === true || item.publish === "true" || item.publish === 1
  );
};

export const updateCreationLikes = (id, likes) => {
  const item = memoryCreations.find((c) => c.id === id);
  if (item) {
    item.likes = likes;
    persistToDisk();
    return true;
  }
  return false;
};

export const removeCreation = (id, userId) => {
  const index = memoryCreations.findIndex(
    (item) => item.id === id && (!userId || item.user_id === userId)
  );
  if (index !== -1) {
    memoryCreations.splice(index, 1);
    persistToDisk();
    return true;
  }
  return false;
};

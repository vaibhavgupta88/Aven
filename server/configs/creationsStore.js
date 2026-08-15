// In-memory fallback store for user creations when Postgres DB is paused/unconfigured
const inMemoryCreations = [];

export const saveCreation = (userId, prompt, content, type) => {
  const newCreation = {
    id: `creation_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    prompt,
    content,
    type,
    likes: [],
    created_at: new Date().toISOString(),
  };
  inMemoryCreations.unshift(newCreation);
  return newCreation;
};

export const getCreationsByUser = (userId) => {
  return inMemoryCreations.filter(
    (item) => item.user_id === userId || item.user_id === "user_demo_guest"
  );
};

export const getAllCreations = () => {
  return inMemoryCreations;
};

export const removeCreation = (id, userId) => {
  const index = inMemoryCreations.findIndex(
    (item) => item.id === id && (item.user_id === userId || item.user_id === "user_demo_guest")
  );
  if (index !== -1) {
    inMemoryCreations.splice(index, 1);
    return true;
  }
  return false;
};

// In-memory fallback store for user creations when Postgres DB is paused/unconfigured
const inMemoryCreations = [];

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
  inMemoryCreations.unshift(newCreation);
  return newCreation;
};

export const getCreationsByUser = (userId) => {
  // Preserve creations across sign-out and session switches
  return inMemoryCreations;
};

export const getAllCreations = () => {
  return inMemoryCreations;
};

export const getPublishedMemoryCreations = () => {
  return inMemoryCreations.filter((item) => item.publish === true);
};

export const removeCreation = (id, userId) => {
  const index = inMemoryCreations.findIndex((item) => item.id === id);
  if (index !== -1) {
    inMemoryCreations.splice(index, 1);
    return true;
  }
  return false;
};

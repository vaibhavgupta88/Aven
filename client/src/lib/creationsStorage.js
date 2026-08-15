export const getStorageKey = (userId) => {
  return `aven_creations_${userId || "guest"}`;
};

export const saveLocalCreation = (userId, newCreation) => {
  try {
    const key = getStorageKey(userId);
    const existing = getLocalCreations(userId);
    const itemWithUser = {
      ...newCreation,
      user_id: userId || "guest",
    };
    const updated = [itemWithUser, ...existing.filter((i) => i.id !== newCreation.id)];
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("saveLocalCreation error:", e);
    return [];
  }
};

export const getLocalCreations = (userId) => {
  try {
    const key = getStorageKey(userId);
    const stored = localStorage.getItem(key);
    let items = [];
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        items = parsed;
      }
    }

    // Auto-migrate guest / legacy creations if user is logged in and has empty items
    if (userId && userId !== "guest") {
      let migrated = false;
      const guestKey = "aven_creations_guest";
      const guestStored = localStorage.getItem(guestKey);
      if (guestStored) {
        try {
          const guestParsed = JSON.parse(guestStored);
          if (Array.isArray(guestParsed) && guestParsed.length > 0) {
            const combined = [...items];
            guestParsed.forEach((g) => {
              if (!combined.some((item) => item.id === g.id)) {
                combined.push({ ...g, user_id: userId });
                migrated = true;
              }
            });
            items = combined;
            localStorage.removeItem(guestKey);
          }
        } catch {}
      }

      // Check legacy shared key
      const legacyKey = "aven_local_creations";
      const legacyStored = localStorage.getItem(legacyKey);
      if (legacyStored) {
        try {
          const legacyParsed = JSON.parse(legacyStored);
          if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
            const combined = [...items];
            legacyParsed.forEach((l) => {
              if (!combined.some((item) => item.id === l.id)) {
                combined.push({ ...l, user_id: userId });
                migrated = true;
              }
            });
            items = combined;
            localStorage.removeItem(legacyKey);
          }
        } catch {}
      }

      if (migrated) {
        localStorage.setItem(key, JSON.stringify(items));
      }
    }

    return items;
  } catch (e) {
    console.warn("getLocalCreations error:", e);
    return [];
  }
};

export const setLocalCreations = (userId, creations) => {
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(creations));
  } catch (e) {
    console.warn("setLocalCreations error:", e);
  }
};

export const removeLocalCreation = (userId, id) => {
  try {
    const key = getStorageKey(userId);
    const existing = getLocalCreations(userId);
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("removeLocalCreation error:", e);
    return [];
  }
};

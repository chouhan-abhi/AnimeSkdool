// src/utils/storageManager.js

const STORAGE_KEYS = {
  type: "animeType",
  filter: "animeFilter",
  rating: "animeRating",
  sfw: "animeSfw",
  WATCHLIST_KEY: "watchlist",
};

const storageManager = {
  // ✅ Save a value
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Storage set error:", err);
    }
  },

  // ✅ Get a value
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (err) {
      console.error("Storage get error:", err);
      return defaultValue;
    }
  },

  // ✅ Remove a value
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error("Storage remove error:", err);
    }
  },

  // ✅ Clear all anime-related storage
  clearAll() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },

  saveToWatchlist(anime, isStarred){
    const WATCHLIST_KEY = STORAGE_KEYS.WATCHLIST_KEY;
    try {
      const stored = JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];
      let updated;

      if (isStarred) {
        // Add or update with isStarred true
        const exists = stored.find((a) => a.mal_id === anime.mal_id);
        if (exists) {
          updated = stored.map((a) =>
            a.mal_id === anime.mal_id ? { ...a, isStarred: true } : a
          );
        } else {
          updated = [...stored, { ...anime, isStarred: true }];
        }
      } else {
        // Unstar → update or remove isStarred
        updated = stored.map((a) =>
          a.mal_id === anime.mal_id ? { ...a, isStarred: false } : a
        );
      }

      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Error saving to watchlist:", err);
    }
  },
  keys: STORAGE_KEYS,
};

export default storageManager;
// src/utils/storageManager.js

const STORAGE_KEYS = {
  type: "animeType",
  filter: "animeFilter",
  rating: "animeRating",
  sfw: "animeSfw",
  WATCHLIST_KEY: "watchlist",
  STARRED_KEY: "starredAnime",
  SETTINGS_KEY: "appSettings",
  CALENDAR_DATA_KEY: "calendarData",
  ANIME_CACHE_KEY: "animeScheduleCache",
  PRIMARY_COLOR_KEY: "primaryColor",
  CALENDAR_FILTERS: "calendarFilters",
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

  // ✅ Save to watchlist (now uses set method for consistency)
  saveToWatchlist(anime, isStarred) {
    const WATCHLIST_KEY = STORAGE_KEYS.WATCHLIST_KEY;
    try {
      const stored = this.get(WATCHLIST_KEY, []);
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

      this.set(WATCHLIST_KEY, updated);
    } catch (err) {
      console.error("Error saving to watchlist:", err);
    }
  },

  // ✅ Add anime to watchlist
  addToWatchlist(anime) {
    const WATCHLIST_KEY = STORAGE_KEYS.WATCHLIST_KEY;
    const stored = this.get(WATCHLIST_KEY, []);
    const exists = stored.find((a) => a.mal_id === anime.mal_id);
    if (!exists) {
      this.set(WATCHLIST_KEY, [...stored, { ...anime, isBookmarked: true }]);
    }
  },

  // ✅ Remove anime from watchlist
  removeFromWatchlist(animeId) {
    const WATCHLIST_KEY = STORAGE_KEYS.WATCHLIST_KEY;
    const stored = this.get(WATCHLIST_KEY, []);
    const updated = stored.filter((a) => a.mal_id !== animeId);
    this.set(WATCHLIST_KEY, updated);
  },

  // ✅ Check if anime is in watchlist
  isInWatchlist(animeId) {
    const WATCHLIST_KEY = STORAGE_KEYS.WATCHLIST_KEY;
    const stored = this.get(WATCHLIST_KEY, []);
    return stored.some((a) => a.mal_id === animeId);
  },

  // ✅ Get settings
  getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS_KEY, {
      theme: "theme-light",
      font: "font-basic",
      primaryColor: "primary-red",
      calendarView: "week",
    });
  },

  // ✅ Save settings
  saveSettings(settings) {
    const current = this.getSettings();
    this.set(STORAGE_KEYS.SETTINGS_KEY, { ...current, ...settings });
  },

  keys: STORAGE_KEYS,
};

export default storageManager;
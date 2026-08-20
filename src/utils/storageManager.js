// src/utils/storageManager.js

const STORAGE_KEYS = {
  type: "animeType",
  filter: "animeFilter",
  rating: "animeRating",
  sfw: "animeSfw",
  WATCHLIST_KEY: "watchlist",
  STARRED_KEY: "starredAnime",
  STARTED_KEY: "startedAnime",
  SETTINGS_KEY: "appSettings",
  CALENDAR_DATA_KEY: "calendarData",
  ANIME_CACHE_KEY: "animeScheduleCache",
  PRIMARY_COLOR_KEY: "primaryColor",
  CALENDAR_FILTERS: "calendarFilters",
  PROGRESS_KEY: "animeProgressMap_v1",
  RECENT_SEARCHES_KEY: "recentSearches_v1",
};

const storageManager = {
  // Save a value
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Storage set error:", err);
    }
  },

  // Get a value
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (err) {
      console.error("Storage get error:", err);
      return defaultValue;
    }
  },

  // Remove a value
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error("Storage remove error:", err);
    }
  },

  clearAll() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },

  // Watchlist methods
  saveToWatchlist(anime, isStarred) {
    const WATCHLIST_KEY = STORAGE_KEYS.WATCHLIST_KEY;
    try {
      const stored = this.get(WATCHLIST_KEY, []);
      let updated;

      if (isStarred) {
        const exists = stored.find((a) => a.mal_id === anime.mal_id);
        if (exists) {
          updated = stored.map((a) =>
            a.mal_id === anime.mal_id ? { ...a, isStarred: true } : a
          );
        } else {
          updated = [...stored, { ...anime, isStarred: true }];
        }
      } else {
        updated = stored.map((a) =>
          a.mal_id === anime.mal_id ? { ...a, isStarred: false } : a
        );
      }

      this.set(WATCHLIST_KEY, updated);
    } catch (err) {
      console.error("Error saving to watchlist:", err);
    }
  },

  addToWatchlist(anime) {
    const WATCHLIST_KEY = STORAGE_KEYS.WATCHLIST_KEY;
    const stored = this.get(WATCHLIST_KEY, []);
    const exists = stored.find((a) => a.mal_id === anime.mal_id);
    if (!exists) {
      this.set(WATCHLIST_KEY, [...stored, { ...anime, isBookmarked: true }]);
    }
  },

  removeFromWatchlist(animeId) {
    const WATCHLIST_KEY = STORAGE_KEYS.WATCHLIST_KEY;
    const stored = this.get(WATCHLIST_KEY, []);
    const updated = stored.filter((a) => a.mal_id !== animeId);
    this.set(WATCHLIST_KEY, updated);
  },

  isInWatchlist(animeId) {
    const WATCHLIST_KEY = STORAGE_KEYS.WATCHLIST_KEY;
    const stored = this.get(WATCHLIST_KEY, []);
    return stored.some((a) => a.mal_id === animeId);
  },

  // Settings
  getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS_KEY, {
      theme: "theme-dark",
      font: "font-basic",
      primaryColor: "primary-blue",
      calendarView: "week",
    });
  },

  saveSettings(settings) {
    const current = this.getSettings();
    this.set(STORAGE_KEYS.SETTINGS_KEY, { ...current, ...settings });
  },

  // Started / Continue Watching
  getStartedList() {
    return this.get(STORAGE_KEYS.STARTED_KEY, []);
  },

  isInStarted(animeId) {
    const stored = this.getStartedList();
    return stored.some((a) => a.mal_id === animeId);
  },

  addToStarted(anime) {
    if (!anime?.mal_id) return;
    const stored = this.getStartedList();
    const exists = stored.some((a) => a.mal_id === anime.mal_id);
    if (exists) return;

    const startedAnime = {
      ...anime,
      startedAt: Date.now(),
    };
    this.set(STORAGE_KEYS.STARTED_KEY, [startedAnime, ...stored]);
  },

  removeFromStarted(animeId) {
    const stored = this.getStartedList();
    const updated = stored.filter((a) => a.mal_id !== animeId);
    this.set(STORAGE_KEYS.STARTED_KEY, updated);
  },

  // ============================
  // Episode Progress Tracking
  // ============================

  getProgressMap() {
    return this.get(STORAGE_KEYS.PROGRESS_KEY, {});
  },

  getAnimeProgress(animeId) {
    if (!animeId) return { episode: 0, status: "plan_to_watch", updated: Date.now() };
    const map = this.getProgressMap();
    return map[animeId] || { episode: 0, status: "plan_to_watch", updated: Date.now() };
  },

  setAnimeProgress(animeId, progressData) {
    if (!animeId) return;
    const map = this.getProgressMap();
    const current = map[animeId] || {};
    map[animeId] = {
      ...current,
      ...progressData,
      updated: Date.now(),
    };
    this.set(STORAGE_KEYS.PROGRESS_KEY, map);
  },

  incrementEpisode(animeId, totalEpisodes = null) {
    const current = this.getAnimeProgress(animeId);
    const nextEp = current.episode + 1;
    const maxEp = totalEpisodes ? Math.min(nextEp, totalEpisodes) : nextEp;
    const isCompleted = totalEpisodes ? maxEp >= totalEpisodes : false;

    this.setAnimeProgress(animeId, {
      episode: maxEp,
      status: isCompleted ? "completed" : "watching",
    });
    return maxEp;
  },

  // ============================
  // Recent Searches
  // ============================

  getRecentSearches() {
    return this.get(STORAGE_KEYS.RECENT_SEARCHES_KEY, [
      "Frieren",
      "Solo Leveling",
      "Jujutsu Kaisen",
      "Demon Slayer",
    ]);
  },

  addRecentSearch(query) {
    if (!query || typeof query !== "string") return;
    const trimmed = query.trim();
    if (!trimmed) return;
    const current = this.getRecentSearches();
    const filtered = current.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
    this.set(STORAGE_KEYS.RECENT_SEARCHES_KEY, [trimmed, ...filtered].slice(0, 8));
  },

  clearRecentSearches() {
    this.set(STORAGE_KEYS.RECENT_SEARCHES_KEY, []);
  },

  keys: STORAGE_KEYS,
};

export default storageManager;

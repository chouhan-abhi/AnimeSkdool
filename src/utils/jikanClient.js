/**
 * Multi-Tier Resilient Anime API Client
 *
 * Tier 1: Jikan REST API v4 (with 380ms sequential throttling & fast 4.5s timeout)
 * Tier 2: AniList GraphQL (High-speed, 99.9% uptime fallback when Jikan returns 504 / 429)
 * Tier 3: Curated Offline Data & Persistent LocalStorage Cache
 */

import { fetchAniListCatalog, fetchAniListSingle } from "./aniListAdapter";
import { FALLBACK_TOP_AIRING, FALLBACK_REVIEWS } from "./fallbackData";

const BASE_URL = "https://api.jikan.moe/v4";
const MIN_REQUEST_INTERVAL_MS = 380;
const JIKAN_TIMEOUT_MS = 4500; // Fail over quickly to AniList if Jikan takes >4.5s
const CACHE_PREFIX = "jikan_cache_v3:";

const memoryCache = new Map();
let lastRequestTime = 0;
let queuePromise = Promise.resolve();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getCacheKey = (endpointOrUrl) => {
  const url = endpointOrUrl.startsWith("http")
    ? endpointOrUrl
    : `${BASE_URL}${endpointOrUrl.startsWith("/") ? "" : "/"}${endpointOrUrl}`;
  return `${CACHE_PREFIX}${url}`;
};

export const readCache = (endpointOrUrl) => {
  const key = getCacheKey(endpointOrUrl);
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (parsed && parsed.data) {
      if (Array.isArray(parsed.data) && parsed.data.length === 0) return null;
      if (Array.isArray(parsed.data?.data) && parsed.data.data.length === 0) return null;
      memoryCache.set(key, parsed.data);
      return parsed.data;
    }
  } catch {
    // Ignore storage parse errors
  }
  return null;
};

export const writeCache = (endpointOrUrl, data) => {
  if (!data) return;
  if (Array.isArray(data) && data.length === 0) return;
  if (Array.isArray(data?.data) && data.data.length === 0) return;
  const key = getCacheKey(endpointOrUrl);
  memoryCache.set(key, data);
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        cachedAt: Date.now(),
      })
    );
  } catch {
    // Ignore storage quota errors
  }
};

/**
 * Intelligent Fallback Handler using AniList GraphQL or Static Catalog
 */
async function fallbackProvider(endpoint, signal) {
  try {
    const lower = endpoint.toLowerCase();

    if (lower.includes("/reviews")) {
      return { data: FALLBACK_REVIEWS };
    }

    if (lower.match(/\/anime\/\d+$/)) {
      const match = lower.match(/\/anime\/(\d+)/);
      const malId = match ? Number(match[1]) : null;
      if (malId) {
        const single = await fetchAniListSingle(malId, signal);
        if (single) return { data: single };
        const found = FALLBACK_TOP_AIRING.find((a) => a.mal_id === malId);
        if (found) return { data: found };
      }
    }

    if (lower.includes("upcoming")) {
      const aniListUpcoming = await fetchAniListCatalog({ filter: "upcoming", limit: 24, signal });
      if (aniListUpcoming?.length) {
        return { data: aniListUpcoming, pagination: { has_next_page: false, current_page: 1 } };
      }
    }

    if (lower.includes("airing") || lower.includes("schedules")) {
      const aniListAiring = await fetchAniListCatalog({ filter: "airing", limit: 25, signal });
      if (aniListAiring?.length) {
        return { data: aniListAiring, pagination: { has_next_page: false, current_page: 1 } };
      }
    }

    if (lower.includes("anime?q=") || lower.includes("?q=")) {
      const queryMatch = endpoint.match(/[?&]q=([^&]+)/i);
      const searchTerm = queryMatch ? decodeURIComponent(queryMatch[1]) : "";
      if (searchTerm) {
        const aniListSearch = await fetchAniListCatalog({ search: searchTerm, limit: 24, signal });
        return { data: aniListSearch };
      }
    }

    if (lower.includes("/recommendations")) {
      const aniListRecs = await fetchAniListCatalog({ filter: "top", limit: 24, signal });
      return {
        data: aniListRecs.map((anime) => ({
          mal_id: anime.mal_id,
          entry: [anime],
          user: { username: "AniList" },
        })),
        pagination: { has_next_page: false },
      };
    }

    if (lower.includes("/top/anime") || lower.includes("/seasons")) {
      const aniListTop = await fetchAniListCatalog({ filter: "top", limit: 25, signal });
      if (aniListTop?.length) {
        return { data: aniListTop, pagination: { has_next_page: false, current_page: 1 } };
      }
    }
  } catch (err) {
    console.warn("[API Fallback] AniList fallback failed, using offline seed catalog:", err);
  }

  // Tier 3: Local Curated Seed Dataset
  const cached = readCache(endpoint);
  if (cached) return cached;

  return {
    data: FALLBACK_TOP_AIRING,
    pagination: { has_next_page: false, current_page: 1 },
  };
}

/**
 * Fetch with timeout helper
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = JIKAN_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const signal = options.signal
    ? (options.signal.addEventListener("abort", () => controller.abort()), controller.signal)
    : controller.signal;

  try {
    const res = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Executes a single request with automated failover
 */
async function executeRequest(url, options = {}) {
  // Enforce throttling interval
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL_MS) {
    await delay(MIN_REQUEST_INTERVAL_MS - timeSinceLast);
  }
  lastRequestTime = Date.now();

  try {
    const res = await fetchWithTimeout(url, options, JIKAN_TIMEOUT_MS);

    // If Jikan succeeds cleanly
    if (res.ok) {
      const json = await res.json();
      writeCache(url, json);
      return json;
    }

    // Jikan 504 / 502 / 503 / 429
    console.warn(`[Jikan] ${res.status} on ${url}. Activating AniList fallback tier...`);
  } catch (err) {
    console.warn(`[Jikan] Error/Timeout on ${url}. Activating AniList fallback tier...`, err);
  }

  // Automatically serve via Tier 2 (AniList) or Tier 3 (Cache/Fallback)
  const fallbackData = await fallbackProvider(url, options.signal);
  writeCache(url, fallbackData);
  return fallbackData;
}

/**
 * Main resilient fetcher for all anime queries.
 */
export const jikanFetch = (endpoint, options = {}) => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const queuedCall = queuePromise.then(() => executeRequest(url, options));
  queuePromise = queuedCall.catch(() => {});
  return queuedCall;
};

export default jikanFetch;

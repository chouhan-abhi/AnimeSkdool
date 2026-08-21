/**
 * Multi-Tier Resilient Anime API Client with Fast Circuit Breaker
 *
 * Tier 1: Jikan REST API v4 (Sequential throttling & fast 2s timeout)
 * Tier 2: AniList GraphQL (High-speed 99.9% uptime fallback when Jikan returns 504 / 502 / 429)
 * Tier 3: Curated Offline Data & Persistent LocalStorage Cache
 */

import { fetchAniListCatalog, fetchAniListSingle } from "./aniListAdapter";
import { FALLBACK_TOP_AIRING, FALLBACK_REVIEWS } from "./fallbackData";

const BASE_URL = "https://api.jikan.moe/v4";
const MIN_REQUEST_INTERVAL_MS = 300;
const JIKAN_TIMEOUT_MS = 2000; // Failover fast to AniList if Jikan takes > 2s
const CACHE_PREFIX = "jikan_cache_v4:";

const memoryCache = new Map();
let lastRequestTime = 0;
let queuePromise = Promise.resolve();

// Circuit Breaker State
let consecutiveFailures = 0;
let circuitOpenUntil = 0;

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

// Genre ID to Name Mapping
const GENRE_MAP = {
  1: "Action",
  2: "Adventure",
  4: "Comedy",
  5: "Avant Garde",
  6: "Mythology",
  7: "Mystery",
  8: "Drama",
  9: "Ecchi",
  10: "Fantasy",
  13: "Historical",
  14: "Horror",
  17: "Martial Arts",
  18: "Mecha",
  19: "Music",
  22: "Romance",
  23: "School",
  24: "Sci-Fi",
  26: "Girls Love",
  28: "Boys Love",
  30: "Sports",
  31: "Super Power",
  32: "Vampire",
  36: "Slice of Life",
  37: "Supernatural",
  38: "Military",
  40: "Psychological",
  41: "Suspense",
  46: "Award Winning",
  47: "Gourmet",
  62: "Isekai",
};

/**
 * Intelligent Fallback Handler using AniList GraphQL or Static Catalog
 */
async function fallbackProvider(endpoint, signal) {
  try {
    const lower = endpoint.toLowerCase();

    // 1. Reviews Fallback
    if (lower.includes("/reviews")) {
      return { data: FALLBACK_REVIEWS };
    }

    // 2. Pictures / Gallery Fallback
    if (lower.includes("/pictures")) {
      const match = lower.match(/\/anime\/(\d+)\/pictures/);
      const malId = match ? Number(match[1]) : null;
      if (malId) {
        const single = await fetchAniListSingle(malId, signal);
        const coverLarge =
          single?.images?.webp?.large_image_url ||
          single?.images?.jpg?.large_image_url;
        const banner = single?.banner_image;
        const pictures = [];
        if (banner)
          pictures.push({ jpg: { image_url: banner, large_image_url: banner } });
        if (coverLarge)
          pictures.push({
            jpg: { image_url: coverLarge, large_image_url: coverLarge },
          });
        if (pictures.length > 0) return { data: pictures };
      }
    }

    // 3. Videos / Trailers Fallback
    if (lower.includes("/videos")) {
      const match = lower.match(/\/anime\/(\d+)\/videos/);
      const malId = match ? Number(match[1]) : null;
      if (malId) {
        const single = await fetchAniListSingle(malId, signal);
        if (single?.trailer) {
          return {
            data: {
              promo: [{ trailer: single.trailer }],
              episodes: [],
            },
          };
        }
      }
    }

    // 4. Single Anime Details Fallback
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

    // 5. Seasons List Fallback
    if (lower === "/seasons" || lower === "/seasons/" || lower.endsWith("/seasons")) {
      return {
        data: [
          { year: 2026, seasons: ["winter"] },
          { year: 2025, seasons: ["winter", "spring", "summer", "fall"] },
          { year: 2024, seasons: ["winter", "spring", "summer", "fall"] },
          { year: 2023, seasons: ["winter", "spring", "summer", "fall"] },
          { year: 2022, seasons: ["winter", "spring", "summer", "fall"] },
          { year: 2021, seasons: ["winter", "spring", "summer", "fall"] },
        ],
      };
    }

    // 6. Parse URL parameters for Catalog / Rankings / Search / Seasons
    let urlObj;
    try {
      urlObj = new URL(endpoint.startsWith("http") ? endpoint : `https://api.jikan.moe/v4${endpoint.startsWith("/") ? "" : "/"}${endpoint}`);
    } catch {
      urlObj = new URL(`https://api.jikan.moe/v4/anime`);
    }

    const searchParams = urlObj.searchParams;
    const q = searchParams.get("q") || "";
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 24;
    const rawType = searchParams.get("type") || "";
    const rawStatus = searchParams.get("status") || "";
    const rawFilter = searchParams.get("filter") || "";
    const rawRating = searchParams.get("rating") || "";
    const rawSfw = searchParams.get("sfw") || "true";
    const rawGenres = searchParams.get("genres") || "";
    const rawOrderBy = searchParams.get("order_by") || "";
    const rawSort = searchParams.get("sort") || "";

    // Map Genre IDs to names
    let mappedGenres = [];
    if (rawGenres) {
      const ids = rawGenres.split(",").map((s) => s.trim());
      mappedGenres = ids.map((id) => GENRE_MAP[id] || id).filter(Boolean);
    }

    // Extract season path if present (e.g. /seasons/2025/winter or /seasons/upcoming or /seasons/now)
    let pathSeason = "";
    let pathYear = null;
    if (lower.includes("/seasons/upcoming")) {
      pathSeason = "upcoming";
    } else if (lower.includes("/seasons/now")) {
      pathSeason = "airing";
    } else {
      const seasonMatch = lower.match(/\/seasons\/(\d{4})\/([a-z]+)/);
      if (seasonMatch) {
        pathYear = Number(seasonMatch[1]);
        pathSeason = seasonMatch[2];
      }
    }

    // Map sorting to AniList
    let aniListSort = "POPULARITY_DESC";
    if (rawOrderBy === "score" || rawFilter === "top") {
      aniListSort = rawSort === "asc" ? "SCORE" : "SCORE_DESC";
    } else if (rawOrderBy === "favorites" || rawFilter === "favorite") {
      aniListSort = "FAVOURITES_DESC";
    } else if (rawOrderBy === "title") {
      aniListSort = rawSort === "desc" ? "TITLE_ROMAJI_DESC" : "TITLE_ROMAJI";
    } else if (rawOrderBy === "start_date") {
      aniListSort = rawSort === "asc" ? "START_DATE" : "START_DATE_DESC";
    } else if (rawOrderBy === "episodes") {
      aniListSort = rawSort === "asc" ? "EPISODES" : "EPISODES_DESC";
    }

    let filterMode = "all";
    if (pathSeason === "upcoming" || rawFilter === "upcoming" || rawStatus === "upcoming") {
      filterMode = "upcoming";
    } else if (pathSeason === "airing" || rawFilter === "airing" || rawStatus === "airing") {
      filterMode = "airing";
    } else if (rawFilter === "bypopularity") {
      filterMode = "popularity";
    }

    const aniListRes = await fetchAniListCatalog({
      filter: filterMode,
      limit,
      page,
      search: q,
      genres: mappedGenres,
      format: rawType,
      status: rawStatus,
      rating: rawRating,
      sfw: rawSfw,
      season: pathSeason && pathSeason !== "upcoming" && pathSeason !== "airing" ? pathSeason : "",
      seasonYear: pathYear,
      sort: aniListSort,
      signal,
    });

    if (aniListRes?.data?.length) {
      return aniListRes;
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
 * Executes a single request with circuit breaker and automated failover
 */
async function executeRequest(url, options = {}) {
  const now = Date.now();

  // If circuit breaker is OPEN due to repeated 504s, bypass Jikan immediately
  if (now < circuitOpenUntil) {
    const fallbackData = await fallbackProvider(url, options.signal);
    writeCache(url, fallbackData);
    return fallbackData;
  }

  // Enforce light throttling
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
      consecutiveFailures = 0; // Reset circuit breaker on success
      writeCache(url, json);
      return json;
    }

    // Upstream 504 / 502 / 503 / 429
    consecutiveFailures++;
    console.warn(`[Jikan] ${res.status} on ${url} (Failures: ${consecutiveFailures}). Routing to AniList...`);
    if (consecutiveFailures >= 2) {
      circuitOpenUntil = Date.now() + 60000; // Open circuit for 60 seconds
      console.warn(`[Jikan Circuit Breaker] Jikan is failing. Opened circuit for 60s -> Direct AniList mode active.`);
    }
  } catch (err) {
    consecutiveFailures++;
    console.warn(`[Jikan] Timeout/Network error on ${url}. Routing to AniList...`, err);
    if (consecutiveFailures >= 2) {
      circuitOpenUntil = Date.now() + 60000;
      console.warn(`[Jikan Circuit Breaker] Jikan is timing out. Opened circuit for 60s -> Direct AniList mode active.`);
    }
  }

  // Automatically serve via Tier 2 (AniList GraphQL)
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

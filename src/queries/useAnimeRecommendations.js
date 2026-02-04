import { useQuery } from "@tanstack/react-query";

const BASE = "https://api.jikan.moe/v4";

// Detect mobile for dynamic data (no caching)
const isMobile =
  typeof navigator !== "undefined" &&
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

/**
 * Fetches recent anime recommendations from Jikan API.
 * GET /recommendations/anime?page=1
 * Response: { data: [{ mal_id, entry: [{ mal_id, url, images, title }], content, user }], pagination }
 * Returns a flat, deduped list of anime entries (minimal: mal_id, url, images, title).
 */
const fetchAnimeRecommendations = async (page = 1) => {
  const res = await fetch(`${BASE}/recommendations/anime?page=${page}`);
  if (!res.ok) throw new Error("Failed to fetch anime recommendations");
  const json = await res.json();
  const data = json?.data ?? [];
  const entries = data.flatMap((rec) => rec?.entry ?? []).filter(Boolean);
  // Dedupe by mal_id (same anime can appear in multiple recommendations)
  const seen = new Set();
  return entries.filter((e) => {
    const id = e.mal_id;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

/**
 * Fetches multiple pages of recommendations and returns a single flat list.
 */
const fetchAnimeRecommendationsList = async (maxItems = 24) => {
  const all = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && all.length < maxItems) {
    const res = await fetch(`${BASE}/recommendations/anime?page=${page}`);
    if (!res.ok) throw new Error("Failed to fetch anime recommendations");
    const json = await res.json();
    const data = json?.data ?? [];
    const pagination = json?.pagination ?? {};

    const entries = data.flatMap((rec) => rec?.entry ?? []).filter(Boolean);
    const seen = new Set(all.map((e) => e.mal_id));
    for (const e of entries) {
      if (seen.has(e.mal_id)) continue;
      seen.add(e.mal_id);
      all.push(e);
      if (all.length >= maxItems) break;
    }

    hasMore = pagination.has_next_page === true && all.length < maxItems;
    page += 1;
  }

  return all;
};

export const useAnimeRecommendations = (maxItems = 24) => {
  return useQuery({
    queryKey: ["animeRecommendations", maxItems],
    queryFn: () => fetchAnimeRecommendationsList(maxItems),
    staleTime: isMobile ? 0 : 1000 * 60 * 5,
    gcTime: isMobile ? 0 : 1000 * 60 * 30,
    retry: 1,
  });
};

/**
 * Fetches full anime by MAL id (GET /anime/{id}).
 * Use when you have a minimal entry from recommendations and need full data for the details panel.
 */
export const fetchAnimeById = async (malId) => {
  const res = await fetch(`${BASE}/anime/${malId}`);
  if (!res.ok) throw new Error("Failed to fetch anime");
  const json = await res.json();
  return json?.data ?? null;
};

export default useAnimeRecommendations;

import { useQuery } from "@tanstack/react-query";
import { jikanFetch } from "../utils/jikanClient";
import { FALLBACK_TOP_AIRING } from "../utils/fallbackData";

/**
 * Fetches curated anime recommendations with heavy rate-limiting protection.
 * Enriches lightweight recommendation entries with offline seed data and cache to avoid secondary API calls.
 */
export const fetchAnimeRecommendations = async ({ page = 1, signal } = {}) => {
  try {
    const json = await jikanFetch(`/recommendations/anime?page=${page}`, { signal });
    const data = json?.data ?? [];
    const entries = data.flatMap((rec) => rec?.entry ?? []).filter(Boolean);

    // Dedupe by mal_id
    const seen = new Set();
    const deduped = entries.filter((e) => {
      const id = e.mal_id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    // Enrich with fallback top airing catalog where available
    const enriched = deduped.map((item) => {
      const match = FALLBACK_TOP_AIRING.find((f) => f.mal_id === item.mal_id);
      return match ? { ...match, ...item } : item;
    });

    if (enriched.length > 0) return enriched;
    return FALLBACK_TOP_AIRING;
  } catch (err) {
    console.warn("[Recommendations] Fetch failed, using curated catalog:", err);
    return FALLBACK_TOP_AIRING;
  }
};

export const useAnimeRecommendations = (maxItems = 24) => {
  return useQuery({
    queryKey: ["animeRecommendations", maxItems],
    queryFn: async ({ signal }) => {
      const list = await fetchAnimeRecommendations({ page: 1, signal });
      return list.slice(0, maxItems);
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache to prevent rate-limiting
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData: FALLBACK_TOP_AIRING.slice(0, maxItems),
  });
};

/**
 * Fetches full anime by MAL id (GET /anime/{id}).
 */
export const fetchAnimeById = async (malId, signal) => {
  const json = await jikanFetch(`/anime/${malId}`, { signal });
  return json?.data ?? null;
};

export default useAnimeRecommendations;

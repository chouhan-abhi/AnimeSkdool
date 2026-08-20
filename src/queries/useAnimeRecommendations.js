import { useQuery } from "@tanstack/react-query";
import { jikanFetch } from "../utils/jikanClient";

/**
 * Fetches recent anime recommendations from Jikan API.
 * GET /recommendations/anime?page=1
 * Response: { data: [{ mal_id, entry: [{ mal_id, url, images, title }], content, user }], pagination }
 * Returns a flat, deduped list of anime entries (minimal: mal_id, url, images, title).
 */
export const fetchAnimeRecommendations = async ({ page = 1, signal } = {}) => {
  const json = await jikanFetch(`/recommendations/anime?page=${page}`, { signal });
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

export const useAnimeRecommendations = (maxItems = 24) => {
  return useQuery({
    queryKey: ["animeRecommendations", maxItems],
    queryFn: async ({ signal }) => {
      const list = await fetchAnimeRecommendations({ page: 1, signal });
      return list.slice(0, maxItems);
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60,
    retry: 2,
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

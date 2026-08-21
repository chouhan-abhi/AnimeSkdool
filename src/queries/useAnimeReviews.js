import { useQuery } from "@tanstack/react-query";
import { jikanFetch } from "../utils/jikanClient";
import { FALLBACK_REVIEWS } from "../utils/fallbackData";

export const fetchAnimeReviews = async (signal) => {
  try {
    const json = await jikanFetch("/reviews/anime", { signal });
    const reviews = json?.data || [];
    if (reviews.length > 0) return reviews;
    return FALLBACK_REVIEWS;
  } catch (err) {
    console.warn("[Reviews] Failed to fetch live reviews, using cached fallback:", err);
    return FALLBACK_REVIEWS;
  }
};

export const useAnimeReviews = () => {
  return useQuery({
    queryKey: ["animeReviews"],
    queryFn: ({ signal }) => fetchAnimeReviews(signal),
    staleTime: 1000 * 60 * 60, // 1 hour stale time to minimize rate limits
    gcTime: 1000 * 60 * 60 * 24, // 24 hours in memory
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    initialData: FALLBACK_REVIEWS,
  });
};

export default useAnimeReviews;

import { useInfiniteQuery } from "@tanstack/react-query";

// Detect mobile for limiting data
const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const MAX_PAGES = isMobile ? 4 : 10;

const fetchAnimeRanking = async ({ pageParam = 1, queryKey, signal }) => {
  const [_key, params] = queryKey;
  const { type, filter, rating, sfw } = params;

  const queryParams = new URLSearchParams();
  if (type) queryParams.set("type", type);
  if (filter) queryParams.set("filter", filter);
  if (rating) queryParams.set("rating", rating);
  if (sfw !== undefined) queryParams.set("sfw", sfw.toString());
  queryParams.set("page", pageParam.toString());

  const res = await fetch(`https://api.jikan.moe/v4/top/anime?${queryParams}`, { signal });
  if (!res.ok) throw new Error("Failed to fetch anime rankings");

  const data = await res.json();
  return data;
};

export const useInfiniteAnimeRanking = (params) => {
  return useInfiniteQuery({
    queryKey: ["animeRankingInfinite", params],
    queryFn: fetchAnimeRanking,
    getNextPageParam: (lastPage, allPages) => {
      // Limit pages to prevent memory issues on mobile
      if (allPages.length >= MAX_PAGES) return undefined;
      return lastPage?.pagination?.has_next_page
        ? lastPage.pagination.current_page + 1
        : undefined;
    },
    refetchOnWindowFocus: false,
    // Mobile: No caching - always fresh data
    staleTime: isMobile ? 0 : 1000 * 60 * 5,
    gcTime: isMobile ? 0 : 1000 * 60 * 30,
    refetchOnMount: isMobile ? 'always' : true,
  });
};

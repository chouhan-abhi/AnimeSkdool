import { useInfiniteQuery } from "@tanstack/react-query";
import { jikanFetch } from "../utils/jikanClient";

const MAX_PAGES = 10;

const fetchAnimeRanking = async ({ pageParam = 1, queryKey, signal }) => {
  const [_key, params] = queryKey;
  const { type, filter, rating, sfw } = params || {};

  const queryParams = new URLSearchParams();
  if (type) queryParams.set("type", type);
  if (filter) queryParams.set("filter", filter);
  if (rating) queryParams.set("rating", rating);
  if (sfw !== undefined) queryParams.set("sfw", sfw.toString());
  queryParams.set("page", pageParam.toString());

  const data = await jikanFetch(`/top/anime?${queryParams}`, { signal });
  return data;
};

export const useInfiniteAnimeRanking = (params) => {
  return useInfiniteQuery({
    queryKey: ["animeRankingInfinite", params],
    queryFn: fetchAnimeRanking,
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length >= MAX_PAGES) return undefined;
      return lastPage?.pagination?.has_next_page
        ? lastPage.pagination.current_page + 1
        : undefined;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60,
    retry: 2,
  });
};

export default useInfiniteAnimeRanking;

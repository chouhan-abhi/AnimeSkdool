import { useInfiniteQuery } from "@tanstack/react-query";

const fetchAnimeRanking = async ({ pageParam = 1, queryKey }) => {
  const [_key, params] = queryKey;
  const { type, filter, rating, sfw } = params;

  const queryParams = new URLSearchParams();
  if (type) queryParams.set("type", type);
  if (filter) queryParams.set("filter", filter);
  if (rating) queryParams.set("rating", rating);
  if (sfw !== undefined) queryParams.set("sfw", sfw.toString());
  queryParams.set("page", pageParam.toString());

  const res = await fetch(`https://api.jikan.moe/v4/top/anime?${queryParams}`);
  if (!res.ok) throw new Error("Failed to fetch anime rankings");

  const data = await res.json();
  return data;
};

export const useInfiniteAnimeRanking = (params) => {
  return useInfiniteQuery({
    queryKey: ["animeRankingInfinite", params],
    queryFn: fetchAnimeRanking,
    getNextPageParam: (lastPage) => {
      return lastPage?.pagination?.has_next_page
        ? lastPage.pagination.current_page + 1
        : undefined;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });
};

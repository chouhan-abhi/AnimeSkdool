import { useInfiniteQuery } from "@tanstack/react-query";
import { jikanFetch } from "../utils/jikanClient";

const fetchAnimeRanking = async ({ pageParam = 1, queryKey, signal }) => {
  const [_key, params] = queryKey;
  const {
    type,
    filter,
    rating,
    sfw,
    genres,
    genres_exclude,
    status,
    order_by,
    sort,
    min_score,
    max_score,
    producers,
    start_date,
    end_date,
    letter,
    search,
    q,
  } = params || {};

  const queryParams = new URLSearchParams();
  queryParams.set("page", pageParam.toString());
  queryParams.set("limit", "24");

  const effectiveSearch = search || q || "";
  if (effectiveSearch) queryParams.set("q", effectiveSearch);
  if (type) queryParams.set("type", type);
  if (rating) queryParams.set("rating", rating);
  if (genres) queryParams.set("genres", Array.isArray(genres) ? genres.join(",") : genres.toString());
  if (genres_exclude) queryParams.set("genres_exclude", Array.isArray(genres_exclude) ? genres_exclude.join(",") : genres_exclude.toString());
  if (status) queryParams.set("status", status);
  if (min_score) queryParams.set("min_score", min_score.toString());
  if (max_score) queryParams.set("max_score", max_score.toString());
  if (producers) queryParams.set("producers", producers.toString());
  if (start_date) queryParams.set("start_date", start_date);
  if (end_date) queryParams.set("end_date", end_date);
  if (letter) queryParams.set("letter", letter);
  if (order_by) queryParams.set("order_by", order_by);
  if (sort) queryParams.set("sort", sort);
  if (sfw !== undefined) queryParams.set("sfw", sfw.toString());

  // Determine endpoint: use /anime when any filter, rating, type, genre, status, or search is active
  const hasCustomFilter =
    Boolean(effectiveSearch) ||
    Boolean(genres) ||
    Boolean(genres_exclude) ||
    Boolean(type) ||
    Boolean(status) ||
    Boolean(rating) ||
    Boolean(order_by) ||
    Boolean(min_score) ||
    Boolean(max_score) ||
    Boolean(producers) ||
    Boolean(start_date) ||
    Boolean(end_date) ||
    Boolean(letter) ||
    (sfw !== undefined && sfw !== "true");

  let endpoint = "";
  if (hasCustomFilter) {
    if (!order_by && !filter) {
      queryParams.set("order_by", "popularity");
      queryParams.set("sort", "asc");
    }
    endpoint = `/anime?${queryParams}`;
  } else {
    if (filter) queryParams.set("filter", filter);
    endpoint = `/top/anime?${queryParams}`;
  }

  const data = await jikanFetch(endpoint, { signal });
  return data;
};

export const useInfiniteAnimeRanking = (params) => {
  return useInfiniteQuery({
    queryKey: ["animeRankingInfinite", params],
    queryFn: fetchAnimeRanking,
    getNextPageParam: (lastPage, allPages) => {
      const pagination = lastPage?.pagination;
      if (pagination?.has_next_page) {
        return (pagination.current_page || allPages.length) + 1;
      }
      return undefined;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60,
    retry: 2,
  });
};

export default useInfiniteAnimeRanking;

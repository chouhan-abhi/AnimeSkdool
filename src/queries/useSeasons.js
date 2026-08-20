import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { jikanFetch } from "../utils/jikanClient";

const MAX_PAGES = 10;

const DEFAULT_SEASONS = [
  { year: 2025, seasons: ["winter", "spring", "summer", "fall"] },
  { year: 2024, seasons: ["winter", "spring", "summer", "fall"] },
  { year: 2023, seasons: ["winter", "spring", "summer", "fall"] },
  { year: 2022, seasons: ["winter", "spring", "summer", "fall"] },
  { year: 2021, seasons: ["winter", "spring", "summer", "fall"] },
];

// GET seasons list (years and seasons)
const fetchSeasonsList = async ({ signal }) => {
  const json = await jikanFetch("/seasons", { signal });
  return (json?.data && json.data.length > 0) ? json.data : DEFAULT_SEASONS;
};

export const useSeasonsList = () => {
  return useQuery({
    queryKey: ["seasonsList"],
    queryFn: fetchSeasonsList,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 48,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// GET anime by specific season with pagination
const fetchSeasonAnime = async ({ pageParam = 1, queryKey, signal }) => {
  const [_key, params] = queryKey;
  const { year, season, sfw } = params || {};

  const search = new URLSearchParams();
  search.set("page", String(pageParam));
  if (sfw !== undefined) search.set("sfw", String(sfw));

  const json = await jikanFetch(`/seasons/${year}/${season}?${search}`, { signal });
  return json;
};

export const useInfiniteSeasonAnime = (params) => {
  return useInfiniteQuery({
    queryKey: ["seasonAnimeInfinite", params],
    queryFn: fetchSeasonAnime,
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length >= MAX_PAGES) return undefined;
      return lastPage?.pagination?.has_next_page
        ? lastPage.pagination.current_page + 1
        : undefined;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export default useSeasonsList;

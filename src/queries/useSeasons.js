import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { jikanFetch } from "../utils/jikanClient";

const DEFAULT_SEASONS = [
  { year: 2026, seasons: ["winter"] },
  { year: 2025, seasons: ["winter", "spring", "summer", "fall"] },
  { year: 2024, seasons: ["winter", "spring", "summer", "fall"] },
  { year: 2023, seasons: ["winter", "spring", "summer", "fall"] },
  { year: 2022, seasons: ["winter", "spring", "summer", "fall"] },
  { year: 2021, seasons: ["winter", "spring", "summer", "fall"] },
];

// GET seasons list (years and seasons)
const fetchSeasonsList = async ({ signal }) => {
  try {
    const json = await jikanFetch("/seasons", { signal });
    const list = json?.data;
    if (Array.isArray(list) && list.length > 0 && Array.isArray(list[0]?.seasons)) {
      const has2025 = list.some((item) => item.year === 2025);
      const has2026 = list.some((item) => item.year === 2026);
      const merged = [...list];
      if (!has2026) merged.unshift({ year: 2026, seasons: ["winter"] });
      if (!has2025) merged.unshift({ year: 2025, seasons: ["winter", "spring", "summer", "fall"] });
      return merged;
    }
    return DEFAULT_SEASONS;
  } catch {
    return DEFAULT_SEASONS;
  }
};

export const useSeasonsList = () => {
  return useQuery({
    queryKey: ["seasonsList"],
    queryFn: fetchSeasonsList,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 48,
    refetchOnWindowFocus: false,
    retry: 2,
    initialData: DEFAULT_SEASONS,
  });
};

// GET anime by specific season with pagination
const fetchSeasonAnime = async ({ pageParam = 1, queryKey, signal }) => {
  const [_key, params] = queryKey;
  const { year, season, sfw } = params || {};

  const search = new URLSearchParams();
  search.set("page", String(pageParam));
  search.set("limit", "24");
  if (sfw !== undefined) search.set("sfw", String(sfw));

  let endpoint = "";
  if (season === "upcoming" || year === "upcoming") {
    endpoint = `/seasons/upcoming?${search}`;
  } else if (season === "now" || year === "now") {
    endpoint = `/seasons/now?${search}`;
  } else if (year && season) {
    endpoint = `/seasons/${year}/${season}?${search}`;
  } else {
    endpoint = `/seasons/now?${search}`;
  }

  const json = await jikanFetch(endpoint, { signal });
  return json;
};

export const useInfiniteSeasonAnime = (params) => {
  return useInfiniteQuery({
    queryKey: ["seasonAnimeInfinite", params],
    queryFn: fetchSeasonAnime,
    getNextPageParam: (lastPage, allPages) => {
      const pagination = lastPage?.pagination;
      if (pagination?.has_next_page) {
        return (pagination.current_page || allPages.length) + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export default useSeasonsList;

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

// Detect mobile for limiting data
const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const MAX_PAGES = isMobile ? 4 : 10;

// GET seasons list (years and seasons)
const fetchSeasonsList = async () => {
  const res = await fetch("https://api.jikan.moe/v4/seasons");
  if (!res.ok) throw new Error("Failed to fetch seasons list");
  const json = await res.json();
  return json.data;
};

export const useSeasonsList = () => {
  return useQuery({
    queryKey: ["seasonsList"],
    queryFn: fetchSeasonsList,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
};

// GET anime by specific season with pagination
const fetchSeasonAnime = async ({ pageParam = 1, queryKey }) => {
  const [_key, params] = queryKey;
  const { year, season, sfw } = params;

  const search = new URLSearchParams();
  search.set("page", String(pageParam));
  if (sfw !== undefined) search.set("sfw", String(sfw));

  const res = await fetch(`https://api.jikan.moe/v4/seasons/${year}/${season}?${search}`);
  if (!res.ok) throw new Error("Failed to fetch season anime");
  const json = await res.json();
  return json;
};

export const useInfiniteSeasonAnime = (params) => {
  return useInfiniteQuery({
    queryKey: ["seasonAnimeInfinite", params],
    queryFn: fetchSeasonAnime,
    getNextPageParam: (lastPage, allPages) => {
      // Limit pages to prevent memory issues on mobile
      if (allPages.length >= MAX_PAGES) return undefined;
      return lastPage?.pagination?.has_next_page
        ? lastPage.pagination.current_page + 1
        : undefined;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: isMobile ? 1000 * 60 * 5 : 1000 * 60 * 30, // shorter cache on mobile
    refetchOnWindowFocus: false,
  });
};



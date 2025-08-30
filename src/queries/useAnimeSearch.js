import { useQuery } from "@tanstack/react-query";

const fetchAnimeSearch = async (query) => {
  if (!query) return [];
  const res = await fetch(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&sfw=true`
  );
  if (!res.ok) throw new Error("Failed to fetch anime search results");
  const data = await res.json();
  return data?.data || [];
};

export const useAnimeSearch = (query) => {
  return useQuery({
    queryKey: ["animeSearch", query],
    queryFn: () => fetchAnimeSearch(query),
    enabled: !!query, // don’t run unless query exists
    staleTime: 1000 * 60 * 5, // cache for 5 min
    refetchOnWindowFocus: false,
  });
};

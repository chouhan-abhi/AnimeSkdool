import { useQuery } from "@tanstack/react-query";

// Detect mobile for dynamic data (no caching)
const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const fetchAnimeSearch = async ({ query, signal }) => {
  if (!query) return [];
  const res = await fetch(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&sfw=true`,
    { signal }
  );
  if (!res.ok) throw new Error("Failed to fetch anime search results");
  const data = await res.json();
  return data?.data || [];
};

export const useAnimeSearch = (query) => {
  return useQuery({
    queryKey: ["animeSearch", query],
    queryFn: ({ signal }) => fetchAnimeSearch({ query, signal }),
    enabled: !!query, // don't run unless query exists
    // Mobile: No caching - always fresh data
    staleTime: isMobile ? 0 : 1000 * 60 * 5,
    gcTime: isMobile ? 0 : 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
};

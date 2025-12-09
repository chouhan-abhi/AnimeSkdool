import { useQuery } from "@tanstack/react-query";

// Detect mobile for dynamic data (no caching)
const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const fetchEpisodes = async (animeId) => {
  const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/episodes`);
  if (!res.ok) throw new Error("Failed to fetch episodes");
  const data = await res.json();
  return data?.data?.reverse() || []; // reverse so latest is first
};

export const useEpisodes = (animeId) => {
  return useQuery({
    queryKey: ["episodes", animeId],
    queryFn: () => fetchEpisodes(animeId),
    enabled: !!animeId, // only run if animeId exists
    // Mobile: No caching - always fresh data
    staleTime: isMobile ? 0 : 1000 * 60 * 5,
    gcTime: isMobile ? 0 : 1000 * 60 * 30,
    retry: 1,
  });
};

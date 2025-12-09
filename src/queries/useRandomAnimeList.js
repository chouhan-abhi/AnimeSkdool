import { useQuery } from "@tanstack/react-query";

// Detect mobile for dynamic data (no caching)
const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const fetchRandomAnimeList = async (count = 8) => {
  // Fetch fewer items on mobile to reduce memory usage
  const mobileCount = Math.min(count, 4);
  const actualCount = isMobile ? mobileCount : count;
  
  const requests = Array.from({ length: actualCount }, () =>
    fetch("https://api.jikan.moe/v4/random/anime").then((res) => {
      if (!res.ok) throw new Error("Failed to fetch random anime");
      return res.json();
    })
  );

  const responses = await Promise.all(requests);
  const animeList = responses.map((r) => r?.data).filter(Boolean).slice(0, actualCount);
  return animeList;
};

export const useRandomAnimeList = (count = 8) => {
  return useQuery({
    queryKey: ["randomAnimeList", count],
    queryFn: () => fetchRandomAnimeList(count),
    // Mobile: No caching - always fresh data
    staleTime: isMobile ? 0 : 1000 * 60 * 5,
    gcTime: isMobile ? 0 : 1000 * 60 * 30,
    retry: 1,
  });
};

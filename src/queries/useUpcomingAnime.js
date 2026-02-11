import { useQuery } from "@tanstack/react-query";

// Detect mobile for dynamic data (no caching)
const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Fetch function with pagination
const fetchUpcomingAnime = async ({ queryKey, signal }) => {
  const [_key, page] = queryKey;
  const res = await fetch(`https://api.jikan.moe/v4/seasons/upcoming?page=${page}`, { signal });
  if (!res.ok) throw new Error("Failed to fetch upcoming anime");

  const data = await res.json();

  return {
    data: data.data,          // list of anime
    pagination: data.pagination, // pagination info
  };
};

// React Query hook
export const useUpcomingAnime = ({ page = 1 } = {}) => {
  return useQuery({
    queryKey: ["upcomingAnime", page],
    queryFn: fetchUpcomingAnime,
    keepPreviousData: !isMobile, // Disable on mobile to save memory
    // Mobile: No caching - always fresh data
    staleTime: isMobile ? 0 : 1000 * 60 * 5,
    gcTime: isMobile ? 0 : 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
};

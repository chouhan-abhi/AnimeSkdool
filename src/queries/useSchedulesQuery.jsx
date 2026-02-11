import { useInfiniteQuery } from "@tanstack/react-query";

// Detect mobile
const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const fetchSchedules = async ({ pageParam = 1, signal }) => {
  const res = await fetch(`https://api.jikan.moe/v4/schedules?page=${pageParam}`, { signal });
  if (!res.ok) throw new Error("Failed to fetch schedules");
  return res.json();
};

export const useSchedulesQuery = () =>
  useInfiniteQuery({
    queryKey: ["schedules"],
    queryFn: fetchSchedules,
    getNextPageParam: (lastPage) => {
      // Calendar needs ALL data - no page limit
      // The data is essential for showing the full week schedule
      return lastPage.pagination?.has_next_page
        ? lastPage.pagination.current_page + 1
        : undefined;
    },
    // Mobile: Fresh data, desktop: 5 min cache
    staleTime: isMobile ? 0 : 1000 * 60 * 5,
    gcTime: isMobile ? 1000 * 60 * 2 : 1000 * 60 * 30, // Keep minimal cache on mobile
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

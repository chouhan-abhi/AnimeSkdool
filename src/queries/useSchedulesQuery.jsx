import { useInfiniteQuery } from "@tanstack/react-query";

// Detect mobile for limiting data
const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const MAX_PAGES = isMobile ? 3 : 6;

const fetchSchedules = async ({ pageParam = 1 }) => {
  const res = await fetch(`https://api.jikan.moe/v4/schedules?page=${pageParam}`);
  if (!res.ok) throw new Error("Failed to fetch schedules");
  return res.json();
};

export const useSchedulesQuery = () =>
  useInfiniteQuery({
    queryKey: ["schedules"],
    queryFn: fetchSchedules,
    getNextPageParam: (lastPage, allPages) => {
      // Limit pages to prevent memory issues on mobile
      if (allPages.length >= MAX_PAGES) return undefined;
      return lastPage.pagination?.has_next_page
        ? lastPage.pagination.current_page + 1
        : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: isMobile ? 1000 * 60 * 5 : 1000 * 60 * 30, // shorter cache on mobile
    refetchOnWindowFocus: false,
  });

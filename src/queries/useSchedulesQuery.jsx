import { useInfiniteQuery } from "@tanstack/react-query";

const fetchSchedules = async ({ pageParam = 1 }) => {
  const res = await fetch(`https://api.jikan.moe/v4/schedules?page=${pageParam}`);
  if (!res.ok) throw new Error("Failed to fetch schedules");
  return res.json();
};

export const useSchedulesQuery = () =>
  useInfiniteQuery({
    queryKey: ["schedules"],
    queryFn: fetchSchedules,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.has_next_page
        ? lastPage.pagination.current_page + 1
        : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

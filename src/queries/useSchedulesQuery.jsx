import { useInfiniteQuery } from "@tanstack/react-query";
import { jikanFetch } from "../utils/jikanClient";

const fetchSchedules = async ({ pageParam = 1, signal }) => {
  const data = await jikanFetch(`/schedules?page=${pageParam}`, { signal });
  return data;
};

export const useSchedulesQuery = () =>
  useInfiniteQuery({
    queryKey: ["schedules"],
    queryFn: fetchSchedules,
    getNextPageParam: (lastPage) => {
      return lastPage?.pagination?.has_next_page
        ? lastPage.pagination.current_page + 1
        : undefined;
    },
    staleTime: 1000 * 60 * 60 * 4, // 4 hours
    gcTime: 1000 * 60 * 60 * 12,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });

export default useSchedulesQuery;

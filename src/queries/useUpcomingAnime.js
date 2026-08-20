import { useQuery } from "@tanstack/react-query";
import { jikanFetch } from "../utils/jikanClient";

const fetchUpcomingAnime = async ({ queryKey, signal }) => {
  const [_key, page] = queryKey;
  const data = await jikanFetch(`/seasons/upcoming?page=${page}`, { signal });
  return {
    data: data?.data || [],
    pagination: data?.pagination || {},
  };
};

export const useUpcomingAnime = ({ page = 1 } = {}) => {
  return useQuery({
    queryKey: ["upcomingAnime", page],
    queryFn: fetchUpcomingAnime,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export default useUpcomingAnime;

import { useQuery } from "@tanstack/react-query";
import { jikanFetch } from "../utils/jikanClient";

const fetchEpisodes = async ({ animeId, signal }) => {
  const data = await jikanFetch(`/anime/${animeId}/episodes`, { signal });
  return data?.data?.reverse() || []; // reverse so latest is first
};

export const useEpisodes = (animeId) => {
  return useQuery({
    queryKey: ["episodes", animeId],
    queryFn: ({ signal }) => fetchEpisodes({ animeId, signal }),
    enabled: !!animeId,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2,
    retry: 2,
  });
};

export default useEpisodes;

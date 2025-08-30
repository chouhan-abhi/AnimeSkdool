import { useQuery } from "@tanstack/react-query";

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
    staleTime: 1000 * 60 * 5, // 5 min cache
    cacheTime: 1000 * 60 * 30, // 30 min unused cache
    retry: 1,
  });
};

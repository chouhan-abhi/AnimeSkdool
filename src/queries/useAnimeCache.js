import { useQuery } from "@tanstack/react-query";
import storageManager from "../utils/storageManager";

export const useAnimeCache = () => {
  return useQuery({
    queryKey: ["animeScheduleCache"],
    queryFn: () => storageManager.get(storageManager.keys.ANIME_CACHE_KEY, []),
    staleTime: Infinity,
    cacheTime: Infinity,
  });
};

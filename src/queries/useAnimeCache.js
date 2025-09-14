import { useQuery } from "@tanstack/react-query";
import storageManager from "../utils/storageManager";

export const useAnimeCache = () => {
  return useQuery({
    queryKey: ["animeScheduleCache"],
    queryFn: () => storageManager.get({ key: "animeScheduleCache" }) || [],
    staleTime: Infinity,
    cacheTime: Infinity,
  });
};

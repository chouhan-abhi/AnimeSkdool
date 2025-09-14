import { useQuery } from "@tanstack/react-query";
import storageManager from "../utils/storageManager";

export const useStarredAnime = () => {
  return useQuery({
    queryKey: ["starredAnime"],
    queryFn: () => storageManager.get("starredAnime") || [],
    staleTime: Infinity,
    cacheTime: Infinity,
  });
};

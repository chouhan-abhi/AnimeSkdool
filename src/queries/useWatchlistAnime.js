import { useQuery } from "@tanstack/react-query";
import storageManager from "../utils/storageManager";

export const useWatchlistAnime = () => {
  return useQuery({
    queryKey: ["watchlistAnime"],
    queryFn: () => storageManager.get("watchlist") || [],
    staleTime: 0,
    cacheTime: 0, // 5 min
  });
};

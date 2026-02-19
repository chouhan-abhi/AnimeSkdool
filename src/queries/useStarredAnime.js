import { useQuery } from "@tanstack/react-query";
import storageManager from "../utils/storageManager";

export const useStarredAnime = () => {
  return useQuery({
    queryKey: ["starredAnime"],
    queryFn: () => {
      const watchlist = storageManager.get(storageManager.keys.WATCHLIST_KEY, []);
      return watchlist.filter((a) => a.isStarred);
    },
    staleTime: 0,
    gcTime: 0,
  });
};

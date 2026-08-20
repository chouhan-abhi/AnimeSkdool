import { useQuery } from "@tanstack/react-query";
import { jikanFetch } from "../utils/jikanClient";

const fetchRandomAnimeList = async ({ count = 3, signal } = {}) => {
  const actualCount = Math.min(count, 3);
  const animeList = [];

  for (let i = 0; i < actualCount; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      const res = await jikanFetch("/random/anime", { signal });
      if (res?.data) animeList.push(res.data);
    } catch (err) {
      console.warn("[Jikan] Error fetching random anime item", err);
      break;
    }
  }

  return animeList;
};

export const useRandomAnimeList = (count = 1) => {
  return useQuery({
    queryKey: ["randomAnimeList", count],
    queryFn: ({ signal }) => fetchRandomAnimeList({ count, signal }),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2,
    retry: 1,
  });
};

export default useRandomAnimeList;

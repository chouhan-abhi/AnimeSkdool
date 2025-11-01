import { useQuery } from "@tanstack/react-query";

const fetchRandomAnimeList = async (count = 8) => {
  const requests = Array.from({ length: count }, () =>
    fetch("https://api.jikan.moe/v4/random/anime").then((res) => {
      if (!res.ok) throw new Error("Failed to fetch random anime");
      return res.json();
    })
  );

  const responses = await Promise.all(requests);
  const animeList = responses.map((r) => r?.data).filter(Boolean).slice(0, count);
  return animeList;
};

export const useRandomAnimeList = (count = 8) => {
  return useQuery({
    queryKey: ["randomAnimeList", count],
    queryFn: () => fetchRandomAnimeList(count),
    staleTime: 1000 * 60 * 5, // cache valid for 5 mins
    cacheTime: 1000 * 60 * 30, // keep unused cache for 30 mins
    retry: 1,
  });
};

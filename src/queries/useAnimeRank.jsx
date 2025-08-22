// hooks/useAnimeSchedule.js
import { useQuery } from '@tanstack/react-query';

const fetchRanking = async (query) => {
  const response = await fetch(`https://api.jikan.moe/v4/top/anime?${query || ''}`, {
    method: "GET",
    redirect: "follow"
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data;
};

export const useAnimeRanking= (query) =>
  useQuery({
    queryKey: ['anime-ranking', query],
    queryFn: () => fetchRanking(query),
  });

import { useQuery } from '@tanstack/react-query';

const fetchAnimeRanking = async ({ queryKey }) => {
  const [_key, params] = queryKey;
  const { type, filter, rating, sfw, page } = params;

  const queryParams = new URLSearchParams({
    type: type || "",
    filter: filter || "bypopularity",
    rating: rating || "",
    sfw: sfw.toString(),
    page: page.toString(),
  }).toString();

  const res = await fetch(`https://api.jikan.moe/v4/top/anime?${queryParams}`);
  if (!res.ok) throw new Error('Failed to fetch anime rankings');

  const data = await res.json();
  return data;
};

export const useAnimeRanking = (params) => {
  return useQuery({
    queryKey: ['animeRanking', params],
    queryFn: fetchAnimeRanking,
    keepPreviousData: true,
  });
};

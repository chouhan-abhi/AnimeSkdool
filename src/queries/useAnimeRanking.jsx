import { useQuery } from "@tanstack/react-query";

// ✅ API call function
const fetchAnimeRanking = async ({ queryKey }) => {
  const [_key, params] = queryKey;
  const { type, filter, rating, sfw, page } = params;

  const queryParams = new URLSearchParams();

  if (type) queryParams.set("type", type);
  if (filter) queryParams.set("filter", filter);
  if (rating) queryParams.set("rating", rating);
  if (sfw) queryParams.set("sfw", "true"); // ✅ only add if true
  if (page) queryParams.set("page", page.toString());

  const res = await fetch(`https://api.jikan.moe/v4/top/anime?${queryParams}`);
  if (!res.ok) throw new Error("Failed to fetch anime rankings");

  const data = await res.json();

  // ✅ return both anime data & pagination info
  return {
    data: data.data || [],
    pagination: data.pagination || {},
  };
};

// ✅ React Query hook
export const useAnimeRanking = (params) => {
  return useQuery({
    queryKey: ["animeRanking", params],
    queryFn: fetchAnimeRanking,
  });
};

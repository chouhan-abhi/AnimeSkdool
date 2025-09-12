import { useQuery } from "@tanstack/react-query";

// Fetch function with pagination
const fetchUpcomingAnime = async ({ queryKey }) => {
  const [_key, page] = queryKey;
  const res = await fetch(`https://api.jikan.moe/v4/seasons/upcoming?page=${page}`);
  if (!res.ok) throw new Error("Failed to fetch upcoming anime");

  const data = await res.json();

  return {
    data: data.data,          // list of anime
    pagination: data.pagination, // pagination info
  };
};

// React Query hook
export const useUpcomingAnime = ({ page = 1 } = {}) => {
  return useQuery({
    queryKey: ["upcomingAnime", page],
    queryFn: fetchUpcomingAnime,
    keepPreviousData: true, // ✅ important for infinite scroll
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

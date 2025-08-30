import { useQuery } from "@tanstack/react-query";

// Fetch function
const fetchUpcomingAnime = async () => {
  const res = await fetch("https://api.jikan.moe/v4/seasons/upcoming");
  if (!res.ok) throw new Error("Failed to fetch upcoming anime");
  const data = await res.json();

  // Sort by airing date (closest first)
  return data.data.sort(
    (a, b) => new Date(a.aired.from) - new Date(b.aired.from)
  );
};

// React Query hook (v5 syntax)
export const useUpcomingAnime = () => {
  return useQuery({
    queryKey: ["upcomingAnime"],
    queryFn: fetchUpcomingAnime,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

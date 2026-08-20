import { useQuery } from "@tanstack/react-query";
import { jikanFetch } from "../utils/jikanClient";

const fetchAnimeSearch = async ({ query, signal }) => {
  if (!query) return [];
  const data = await jikanFetch(
    `/anime?q=${encodeURIComponent(query)}&sfw=true`,
    { signal }
  );
  return data?.data || [];
};

export const useAnimeSearch = (query) => {
  return useQuery({
    queryKey: ["animeSearch", query],
    queryFn: ({ signal }) => fetchAnimeSearch({ query, signal }),
    enabled: !!query,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export default useAnimeSearch;

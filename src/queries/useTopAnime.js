import { useQuery } from "@tanstack/react-query";

const BASE = "https://api.jikan.moe/v4";

const isMobile =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

/**
 * Fetches top anime from Jikan API.
 * GET /top/anime
 * Query: type, filter, rating, sfw, page, limit
 * filter: "airing" | "upcoming" | "bypopularity" | "favorite"
 */
const fetchTopAnime = async ({ filter = "airing", limit = 1, page = 1, sfw = true, signal } = {}) => {
    const params = new URLSearchParams();
    params.set("filter", filter);
    if (limit != null) params.set("limit", String(limit));
    params.set("page", String(page));
    if (sfw !== undefined) params.set("sfw", String(sfw));

    const res = await fetch(`${BASE}/top/anime?${params}`, { signal });
    if (!res.ok) throw new Error("Failed to fetch top anime");
    const json = await res.json();
    const data = json?.data ?? [];

    // Sort by score descending (highest first); null/0 scores last
    const sorted = [...data].sort((a, b) => {
        const scoreA = a?.score ?? 0;
        const scoreB = b?.score ?? 0;
        return scoreB - scoreA;
    });

    return sorted;
};

/**
 * Hook for top anime list (e.g. first page with limit).
 * Use for hero: useTopAnime({ filter: "airing", limit: 1 }) → returns [leadingTopAiring].
 */
export const useTopAnime = (params = {}) => {
    const { filter = "airing", limit = 1, page = 1, sfw = true } = params;

    return useQuery({
        queryKey: ["topAnime", { filter, limit, page, sfw }],
        queryFn: ({ signal }) => fetchTopAnime({ filter, limit, page, sfw, signal }),
        staleTime: isMobile ? 0 : 1000 * 60 * 5,
        gcTime: isMobile ? 0 : 1000 * 60 * 30,
        retry: 1,
    });
};

/**
 * Convenience hook for the leading top airing anime (hero).
 * Returns { data: anime | null, isLoading, isError, ... }.
 */
export const useTopAiringHero = () => {
    const result = useTopAnime({ filter: "airing", limit: 1, sfw: true });
    const leading = result.data?.[0] ?? null;
    return { ...result, data: leading };
};

export default useTopAnime;

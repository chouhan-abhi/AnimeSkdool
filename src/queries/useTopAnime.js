import { useQuery } from "@tanstack/react-query";

const BASE = "https://api.jikan.moe/v4";
const TOP_ANIME_CACHE_PREFIX = "topAnimeCache:v1";
const TOP_ANIME_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const TOP_ANIME_STALE_MS = 1000 * 60 * 45;
const TOP_ANIME_STALE_MOBILE_MS = 1000 * 60 * 20;

const isMobile =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const getCacheStorageKey = ({ filter, limit, page, sfw }) =>
    `${TOP_ANIME_CACHE_PREFIX}:${filter}:${limit}:${page}:${sfw}`;

const readTopAnimeCache = (params) => {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(getCacheStorageKey(params));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.data || !Array.isArray(parsed.data) || !parsed.cachedAt) return null;
        return parsed;
    } catch {
        return null;
    }
};

const writeTopAnimeCache = (params, data) => {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(
            getCacheStorageKey(params),
            JSON.stringify({ data, cachedAt: Date.now() })
        );
    } catch {
        // Ignore storage failures (private mode/full quota).
    }
};

const isCacheWithinTtl = (cachedAt) => Date.now() - cachedAt <= TOP_ANIME_CACHE_TTL_MS;

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

    try {
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

        writeTopAnimeCache({ filter, limit, page, sfw }, sorted);
        return sorted;
    } catch (error) {
        const cached = readTopAnimeCache({ filter, limit, page, sfw });
        if (cached?.data?.length) {
            return cached.data;
        }
        throw error;
    }
};

/**
 * Hook for top anime list (e.g. first page with limit).
 * Use for hero: useTopAnime({ filter: "airing", limit: 1 }) → returns [leadingTopAiring].
 */
export const useTopAnime = (params = {}) => {
    const { filter = "airing", limit = 1, page = 1, sfw = true } = params;
    const cached = readTopAnimeCache({ filter, limit, page, sfw });
    const hasFreshCache = cached?.cachedAt && isCacheWithinTtl(cached.cachedAt);

    return useQuery({
        queryKey: ["topAnime", { filter, limit, page, sfw }],
        queryFn: ({ signal }) => fetchTopAnime({ filter, limit, page, sfw, signal }),
        staleTime: isMobile ? TOP_ANIME_STALE_MOBILE_MS : TOP_ANIME_STALE_MS,
        gcTime: isMobile ? 0 : 1000 * 60 * 30,
        retry: 1,
        initialData: hasFreshCache ? cached.data : undefined,
        initialDataUpdatedAt: hasFreshCache ? cached.cachedAt : undefined,
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

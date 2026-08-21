import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  memo,
} from "react";
import { useInfiniteAnimeRanking } from "../../queries/useInfiniteAnimeRanking";
import AnimeDetailCard from "../../helperComponent/AnimeDetailCard";
import NoAnimeFound from "../../helperComponent/NoAnimeFound";
import { GridLoader, LoadingMore } from "../../helperComponent/PageLoader";
import {
  Star,
  Play,
  ArrowDown,
  ArrowUp,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";

// Standard 2:3 Portrait Poster Card
const AnimePosterCard = memo(({ anime, onSelect }) => {
  if (!anime) return null;
  const webp = anime.images?.webp || {};
  const jpg = anime.images?.jpg || {};
  const imgUrl =
    webp.large_image_url || webp.image_url || jpg.large_image_url || jpg.image_url;

  return (
    <div
      onClick={() => onSelect?.(anime)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect?.(anime);
      }}
      className="group relative rounded-2xl overflow-hidden bg-[#08080c] border border-white/[0.06] hover:border-white/20 transition-all duration-300 hover:scale-[1.025] hover:shadow-[0_20px_45px_rgba(0,0,0,0.95)] cursor-pointer flex flex-col justify-between p-2.5 sm:p-3 select-none"
    >
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-black/60 mb-2.5">
        {imgUrl && (
          <img
            src={imgUrl}
            alt={anime.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.parentElement.style.display = "none";
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {anime.score && (
          <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/75 backdrop-blur-md text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
            <Star size={9} fill="currentColor" /> {anime.score}
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="rounded-full bg-white text-black p-2.5 shadow-lg">
            <Play size={14} className="fill-black translate-x-0.5" />
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[var(--primary-color)] transition-colors">
          {anime.title}
        </h4>
        <p className="text-[11px] text-[var(--text-dim)] truncate mt-0.5">
          {anime.genres?.[0]?.name || "Series"} ·{" "}
          {anime.episodes ? `${anime.episodes} eps` : "Airing"}
        </p>
      </div>
    </div>
  );
});
AnimePosterCard.displayName = "AnimePosterCard";

const ExploreAnime = ({ externalState = null, onSelectAnime }) => {
  const type = externalState?.type || "";
  const filter = externalState?.filter || "";
  const rating = externalState?.rating || "";
  const sfw = externalState?.sfw || "true";
  const genres = externalState?.genres || "";
  const status = externalState?.status || "";
  const order_by = externalState?.order_by || "";
  const sort = externalState?.sort || "";
  const min_score = externalState?.min_score || "";
  const producers = externalState?.producers || "";
  const start_date = externalState?.start_date || "";
  const end_date = externalState?.end_date || "";
  const letter = externalState?.letter || "";
  const searchQuery = externalState?.searchQuery || "";
  const viewMode = externalState?.viewMode || "grid";

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [autoLoadOnScroll, setAutoLoadOnScroll] = useState(true);
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  // Fetch infinite query
  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useInfiniteAnimeRanking({
    type,
    filter:
      filter ||
      (searchQuery || genres || status || producers || start_date || letter
        ? ""
        : "bypopularity"),
    rating,
    sfw,
    genres,
    status,
    order_by,
    sort,
    min_score,
    producers,
    start_date,
    end_date,
    letter,
    search: searchQuery,
  });

  const rawList = useMemo(
    () => data?.pages.flatMap((page) => page?.data || []) || [],
    [data]
  );

  // Client-Side Secondary Filter Verification Pipeline
  const animeList = useMemo(() => {
    if (!rawList.length) return [];

    return rawList.filter((anime) => {
      if (!anime) return false;

      // 1. Age Rating Filter
      if (rating) {
        const r = (anime.rating || "").toLowerCase();
        if (rating === "g" && !(r.includes("g -") || r.includes("all ages") || r === "g")) return false;
        if (rating === "pg" && !(r.includes("pg -") || (r.includes("pg") && !r.includes("pg-13")) || r.includes("children"))) return false;
        if (rating === "pg13" && !(r.includes("pg-13") || r.includes("pg 13") || r.includes("teens") || r.includes("13 or older"))) return false;
        if (rating === "r17" && !(r.includes("r - 17") || r.includes("17+") || r.includes("violence"))) return false;
        if (rating === "r" && !(r.includes("r+") || r.includes("mild nudity") || r.includes("barely"))) return false;
        if (rating === "rx" && !(r.includes("rx") || r.includes("hentai") || r.includes("explicit"))) return false;
      }

      // 2. SFW Safe Content Filter
      if (sfw === "true") {
        const r = (anime.rating || "").toLowerCase();
        if (r.includes("rx") || r.includes("hentai") || r.includes("explicit") || r.includes("r+")) return false;
      }

      // 3. Format / Type Filter
      if (type) {
        const t = (anime.type || "").toLowerCase();
        if (t !== type.toLowerCase()) return false;
      }

      // 4. Status Filter
      if (status) {
        const s = (anime.status || "").toLowerCase();
        if (status === "airing" && !(s.includes("airing") || s.includes("releasing"))) return false;
        if (status === "upcoming" && !(s.includes("upcoming") || s.includes("not yet"))) return false;
        if (status === "complete" && !(s.includes("finished") || s.includes("complete"))) return false;
      }

      // 5. Min Score Filter
      if (min_score && Number(min_score) > 0) {
        if (!anime.score || Number(anime.score) < Number(min_score)) return false;
      }

      // 6. Letter Filter
      if (letter) {
        const title = (anime.title || "").toLowerCase();
        if (!title.startsWith(letter.toLowerCase())) return false;
      }

      return true;
    });
  }, [rawList, rating, sfw, type, status, min_score, letter]);

  const currentPageCount = data?.pages?.length || 1;
  const lastPageData = data?.pages?.[data.pages.length - 1];
  const lastVisiblePage = lastPageData?.pagination?.last_visible_page;

  useEffect(() => {
    if (animeList.length > 0 && isInitialLoad) setIsInitialLoad(false);
  }, [animeList.length, isInitialLoad]);

  // Infinite Scroll Sentinel Observer
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!autoLoadOnScroll) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isBatchLoading
        ) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "450px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isBatchLoading, fetchNextPage, autoLoadOnScroll]);

  // Batch load 3 pages in consecutive sequence
  const handleLoadMultiplePages = async (count = 3) => {
    if (!hasNextPage || isFetchingNextPage || isBatchLoading) return;
    setIsBatchLoading(true);
    try {
      for (let i = 0; i < count; i++) {
        const res = await fetchNextPage();
        if (!res?.data?.pages?.[res.data.pages.length - 1]?.pagination?.has_next_page) {
          break;
        }
      }
    } finally {
      setIsBatchLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full space-y-6">
      {/* Anime Content Grid */}
      {isInitialLoad && isLoading ? (
        <GridLoader count={6} />
      ) : error ? (
        <NoAnimeFound message={error.message} />
      ) : animeList.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {animeList.map((anime, idx) => (
              <AnimePosterCard
                key={`${anime.mal_id || idx}-${idx}`}
                anime={anime}
                onSelect={onSelectAnime}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {animeList.map((anime, idx) => (
              <AnimeDetailCard
                key={`${anime.mal_id || idx}-${idx}`}
                anime={anime}
              />
            ))}
          </div>
        )
      ) : (
        !isInitialLoad && <NoAnimeFound message="No anime match the selected criteria." />
      )}

      {/* Infinite Scroll Trigger Sentinel (When autoLoadOnScroll is true) */}
      {autoLoadOnScroll && <div ref={sentinelRef} className="h-10 w-full" />}

      {/* Dynamic Pagination & Load More Controls Hub */}
      {animeList.length > 0 && (
        <div className="mt-10 p-6 rounded-3xl bg-[#08080c] border border-white/[0.06] space-y-5 shadow-2xl">
          {/* Query Stats Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/60 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">
                Loaded {animeList.length} Titles
              </span>
              <span>•</span>
              <span>
                Page {currentPageCount}
                {lastVisiblePage ? ` of ${lastVisiblePage}` : ""}
              </span>
            </div>

            {/* Auto-load toggle */}
            <button
              type="button"
              onClick={() => setAutoLoadOnScroll((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                autoLoadOnScroll
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-white/10 text-white/70 border border-white/10"
              }`}
            >
              <span>Auto-load on scroll:</span>
              <span className="font-bold">{autoLoadOnScroll ? "ON" : "OFF"}</span>
            </button>
          </div>

          {/* Load Next Page & Batch Loading Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {hasNextPage ? (
              <>
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage || isBatchLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-xs sm:text-sm hover:scale-105 shadow-xl transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  <ArrowDown
                    size={15}
                    className={isFetchingNextPage ? "animate-bounce" : ""}
                  />
                  <span>
                    {isFetchingNextPage
                      ? `Loading Page ${currentPageCount + 1}...`
                      : `Load Next Page (+24 Titles)`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadMultiplePages(3)}
                  disabled={isFetchingNextPage || isBatchLoading}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white font-semibold text-xs sm:text-sm hover:scale-105 shadow-lg transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  <Layers
                    size={15}
                    className={isBatchLoading ? "animate-spin text-[var(--primary-color)]" : "text-[var(--primary-color)]"}
                  />
                  <span>
                    {isBatchLoading
                      ? "Loading 3 Pages..."
                      : "Load 3 Pages (+72 Titles)"}
                  </span>
                </button>
              </>
            ) : (
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 py-2">
                <Sparkles size={14} className="text-[var(--primary-color)]" />
                <span>You&apos;ve reached the end of this catalog query ({animeList.length} titles loaded)</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/[0.06] text-white/70 hover:text-white text-xs font-semibold transition-all hover:scale-105 disabled:opacity-40"
            >
              <RefreshCw size={13} className={isRefetching ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/[0.06] text-white/70 hover:text-white text-xs font-semibold transition-all hover:scale-105"
            >
              <ArrowUp size={13} />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreAnime;

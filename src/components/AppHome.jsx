import React, {
  useState,
  Suspense,
  lazy,
  useEffect,
  useCallback,
  useRef,
  memo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAnimeSearch } from "../queries/useAnimeSearch";
import { useStarredAnime } from "../queries/useStarredAnime";
import { useWatchlistAnime } from "../queries/useWatchlistAnime";
import { useTopAnime } from "../queries/useTopAnime";
import {
  useAnimeRecommendations,
  fetchAnimeById,
} from "../queries/useAnimeRecommendations";
import {
  MiniLoader,
  DetailsPanelLoader,
} from "../helperComponent/PageLoader";
import { useDebounce } from "../utils/utils";
import storageManager from "../utils/storageManager";
import { useToast } from "../utils/toast";
import { Search, Play, Plus, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import HeroCarousel from "./HeroCarousel";

const AnimeDetailsPanel = lazy(() => import("./AnimeDetailsPanel"));
const AnimeReview = lazy(() => import("./AnimeReview/AnimeReview"));

// --- Netflix-style poster card (used in rows) ---
const PosterCard = memo(({ anime, onSelect }) => {
  if (!anime) return null;
  const imgUrl =
    anime.images?.webp?.image_url || anime.images?.jpg?.image_url;

  return (
    <button
      type="button"
      onClick={() => onSelect(anime)}
      className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] group text-left focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2 focus:ring-offset-[var(--bg-color)] rounded"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-neutral-800 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:z-10 group-hover:shadow-2xl">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={anime.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              if (e.target) e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-sm font-semibold line-clamp-2 drop-shadow-lg">
            {anime.title}
          </p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="rounded-full bg-white/20 p-2">
            <Play size={28} className="text-white" fill="white" />
          </span>
        </div>
      </div>
      <p className="mt-1.5 text-sm font-medium text-[var(--text-color)] line-clamp-2 px-0.5 group-hover:text-[var(--primary-color)] transition-colors">
        {anime.title}
      </p>
    </button>
  );
});

// --- Horizontal row skeleton (poster-shaped) ---
const RowSkeleton = memo(({ count = 6 }) => (
  <div className="flex gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] animate-pulse"
      >
        <div className="aspect-[2/3] w-full rounded-md bg-white/10" />
        <div className="mt-1.5 h-4 bg-white/10 rounded w-full" />
        <div className="mt-1 h-3 bg-white/10 rounded w-4/5" />
      </div>
    ))}
  </div>
));

// --- Grid skeleton (for recommendations flex area) ---
const GridSkeleton = memo(({ count = 6 }) => (
  <div className="flex flex-wrap gap-3 sm:gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="min-w-[120px] sm:min-w-[140px] flex-[1_1_140px] max-w-[180px] animate-pulse"
      >
        <div className="aspect-[2/3] w-full rounded-md bg-white/10" />
        <div className="mt-1.5 h-4 bg-white/10 rounded w-full" />
        <div className="mt-1 h-3 bg-white/10 rounded w-4/5" />
      </div>
    ))}
  </div>
));

// --- Horizontal scrolling row ---
const Row = memo(({ title, children, className = "" }) => {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className={`relative pl-4 sm:pl-6 md:pl-8 lg:pl-12 ${className}`}>
      <div className="flex items-center justify-between pr-4 sm:pr-6 md:pr-8 lg:pr-12 mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          {title}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </section>
  );
});

const AppHome = () => {
  const [search, setSearch] = useState("");
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedSearch = useDebounce(search);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: results = [],
    isFetching,
    isError,
  } = useAnimeSearch(debouncedSearch);

  const { data: starredAnimes = [] } = useStarredAnime();
  const { data: watchlistAnimes = [] } = useWatchlistAnime();

  const {
    data: heroList = [],
    isLoading: heroLoading,
  } = useTopAnime({ filter: "airing", limit: 25, sfw: true });

  const {
    data: recommendedList = [],
    isLoading: recommendedLoading,
    isError: recommendedError,
    refetch: refetchRecommendations,
    isRefetching: recommendationsRefetching,
  } = useAnimeRecommendations(24);

  const recommendedRow = recommendedList.slice(0, 24);

  useEffect(() => {
    const preload = () => {
      import("./AnimeReview/AnimeReview");
      import("./AnimeDetailsPanel");
    };
    if ("requestIdleCallback" in window) {
      requestIdleCallback(preload);
    } else {
      setTimeout(preload, 2000);
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedAnime(null);
  }, []);

  // Recommendations API returns minimal entries (mal_id, url, images, title). Fetch full anime when opening details.
  const handleSelectAnime = useCallback(async (anime) => {
    if (!anime?.mal_id) return;
    const hasFullData = anime.synopsis != null;
    if (hasFullData) {
      setSelectedAnime(anime);
      return;
    }
    try {
      const full = await fetchAnimeById(anime.mal_id);
      if (full) setSelectedAnime(full);
      else setSelectedAnime(anime);
    } catch {
      setSelectedAnime(anime);
    }
  }, []);

  const handleAddToWatchlist = useCallback(
    (anime) => {
      if (!anime?.mal_id) return;
      const inList = watchlistAnimes.some((a) => a.mal_id === anime.mal_id);
      if (inList) {
        storageManager.removeFromWatchlist(anime.mal_id);
        showToast?.("Removed from watchlist", "info");
      } else {
        storageManager.saveToWatchlist(anime, true);
        showToast?.("Added to watchlist", "success");
      }
      queryClient.invalidateQueries({ queryKey: ["watchlistAnime"] });
    },
    [watchlistAnimes, showToast, queryClient]
  );

  const isInWatchlist = useCallback(
    (malId) => watchlistAnimes.some((a) => a.mal_id === malId),
    [watchlistAnimes]
  );

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      {/* Top bar: search */}
      <div className="sticky top-0 z-40 px-4 sm:px-6 md:px-8 lg:px-12 py-4 bg-[var(--bg-color)]/95 supports-[backdrop-filter]:bg-[var(--bg-color)]/80">
        <form
          onSubmit={(e) => e.preventDefault()}
          className={`max-w-xl transition-all duration-300 ${searchFocused ? "ring-2 ring-[var(--primary-color)] rounded-lg" : ""
            }`}
        >
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search anime..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-[var(--text-color)] placeholder-neutral-500 focus:outline-none focus:border-[var(--primary-color)]"
            />
          </div>
        </form>
      </div>

      <main className="pb-16">
        <HeroCarousel
          heroList={heroList?.slice(0, 8)}
          heroLoading={heroLoading}
          visible={!debouncedSearch}
          onSelectAnime={handleSelectAnime}
          onAddToWatchlist={handleAddToWatchlist}
          isInWatchlist={isInWatchlist}
        />

        {/* Search results row (when searching) - shown first, other sections move down */}
        {debouncedSearch && (
          <Row title="Search Results" className="mt-6">
            {isFetching ? (
              <RowSkeleton count={8} />
            ) : isError ? (
              <p className="px-4 text-[var(--error-color)]">Failed to load results.</p>
            ) : results.length > 0 ? (
              results.slice(0, 20).map((anime) => (
                <PosterCard
                  key={anime.mal_id}
                  anime={anime}
                  onSelect={handleSelectAnime}
                />
              ))
            ) : (
              <p className="px-4 text-neutral-400">No results for &quot;{debouncedSearch}&quot;</p>
            )}
          </Row>
        )}

        {/* Top Airing Now */}
        {heroList.length > 0 && (
          <Row title="Top Airing Now" className="mt-6">
            {heroList.map((anime) => (
              <PosterCard
                key={anime.mal_id}
                anime={anime}
                onSelect={handleSelectAnime}
              />
            ))}
          </Row>
        )}

        {/* Your List (starred) */}
        {starredAnimes.length > 0 && (
          <Row title="Your List" className="mt-8">
            {starredAnimes.map((anime) => (
              <PosterCard
                key={anime.mal_id}
                anime={anime}
                onSelect={handleSelectAnime}
              />
            ))}
          </Row>
        )}

        {/* My Watchlist */}
        {watchlistAnimes.length > 0 && (
          <Row title="My Watchlist" className="mt-8">
            {watchlistAnimes.map((anime) => (
              <PosterCard
                key={anime.mal_id}
                anime={anime}
                onSelect={handleSelectAnime}
              />
            ))}
          </Row>
        )}

        {/* Recommended for you + Recent Anime Reviews: side-by-side on desktop, stacked on mobile */}
        <div className="mt-8 px-4 sm:px-6 md:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Recommended for you (flex, scrollable, refresh) */}
          <section className="flex flex-col min-h-0 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Recommended for you
              </h2>
              <button
                type="button"
                onClick={() => refetchRecommendations()}
                disabled={recommendedLoading || recommendationsRefetching}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                aria-label="Refresh recommendations"
                title="Refresh recommendations"
              >
                <RefreshCw
                  size={18}
                  className={recommendationsRefetching ? "animate-spin" : ""}
                />
                <span className="text-sm font-medium hidden sm:inline">
                  {recommendationsRefetching ? "Refreshing…" : "Refresh"}
                </span>
              </button>
            </div>
            {recommendedLoading ? (
              <GridSkeleton count={6} />
            ) : recommendedError ? (
              <p className="text-neutral-400">Could not load recommendations.</p>
            ) : recommendedRow.length > 0 ? (
              <div
                className="flex flex-wrap gap-3 sm:gap-4 overflow-auto pb-2 -mr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                style={{ WebkitOverflowScrolling: "touch", maxHeight: "min(70vh, 640px)" }}
              >
                {recommendedRow.map((anime) => (
                  <div
                    key={anime.mal_id}
                    className="m-1 min-w-[120px] sm:min-w-[140px] flex-[1_1_140px] max-w-[180px] lg:max-w-[200px]"
                  >
                    <PosterCard
                      anime={anime}
                      onSelect={handleSelectAnime}
                      fillWidth
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-400">No recommendations yet.</p>
            )}
          </section>

          {/* Recent Anime Reviews */}
          <section className="lg:min-w-0 flex flex-col min-h-0">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-3 sm:mb-4">
              Recent Anime Reviews
            </h2>
            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-1 min-h-[280px] lg:min-h-[400px]">
              <Suspense fallback={<MiniLoader text="Loading reviews..." />}>
                <AnimeReview />
              </Suspense>
            </div>
          </section>
        </div>
      </main>

      {/* Details panel (portal inside AnimeDetailsPanel) */}
      {selectedAnime && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/90 z-[9999] flex">
              <div className="hidden md:block md:flex-1 bg-gray-900" />
              <div className="flex-1 p-6 text-white">
                <DetailsPanelLoader />
              </div>
            </div>
          }
        >
          <AnimeDetailsPanel
            anime={selectedAnime}
            onClose={handleClosePanel}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AppHome;

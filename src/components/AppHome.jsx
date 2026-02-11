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
import { useUpcomingAnime } from "../queries/useUpcomingAnime";
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
import { Play, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import HeroCarousel from "./HeroCarousel";
import SectionHeader from "./ui/SectionHeader";
import GlassCard from "./ui/GlassCard";
import AnimeDetailCard from "../helperComponent/AnimeDetailCard";
import DailyScheduleStrip from "./home/DailyScheduleStrip";

const AnimeDetailsPanel = lazy(() => import("./AnimeDetailsPanel"));
const AnimeReview = lazy(() => import("./AnimeReview/AnimeReview"));

const buildSrcSet = (urls, widths) => {
  const entries = urls
    .map((url, i) => (url ? `${url} ${widths[i]}w` : null))
    .filter(Boolean);
  return entries.length ? entries.join(", ") : undefined;
};

// --- Netflix-style poster card (used in rows) ---
const PosterCard = memo(({ anime, onSelect, size = "md" }) => {
  if (!anime) return null;
  const sizeClass =
    size === "lg"
      ? "w-[180px] sm:w-[200px] md:w-[220px]"
      : "w-[150px] sm:w-[170px] md:w-[190px]";
  const webp = anime.images?.webp || {};
  const jpg = anime.images?.jpg || {};
  const webpSrcSet = buildSrcSet(
    [webp.small_image_url, webp.image_url, webp.large_image_url],
    [120, 240, 360]
  );
  const jpgSrcSet = buildSrcSet(
    [jpg.small_image_url, jpg.image_url, jpg.large_image_url],
    [120, 240, 360]
  );
  const imgUrl =
    webp.image_url ||
    jpg.image_url ||
    webp.small_image_url ||
    jpg.small_image_url;

  return (
    <button
      type="button"
      onClick={() => onSelect(anime)}
      className={`flex-shrink-0 ${sizeClass} group text-left focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2 focus:ring-offset-[var(--bg-color)] rounded-2xl`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-white/5 shadow-[0_20px_60px_-40px_var(--shadow-color)] transition-all duration-300 group-hover:scale-[1.03] group-hover:z-10 group-hover:shadow-[0_30px_80px_-40px_var(--glow-color)] border border-[var(--border-color)]">
        {imgUrl ? (
          <picture>
            {webpSrcSet && (
              <source
                type="image/webp"
                srcSet={webpSrcSet}
                sizes="(min-width: 1024px) 180px, (min-width: 640px) 160px, 140px"
              />
            )}
            {jpgSrcSet && (
              <source
                type="image/jpeg"
                srcSet={jpgSrcSet}
                sizes="(min-width: 1024px) 180px, (min-width: 640px) 160px, 140px"
              />
            )}
            <img
              src={imgUrl}
              alt={anime.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                if (e.target) e.target.style.display = "none";
              }}
            />
          </picture>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
      <p className="mt-2 min-h-[2.75rem] text-sm font-medium text-white line-clamp-2 px-0.5 leading-snug group-hover:text-[var(--primary-color)] transition-colors">
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
const Row = memo(({ title, children, className = "", actionLabel, onAction }) => {
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
        <SectionHeader title={title} actionLabel={actionLabel} onAction={onAction} />
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

const AppHome = ({ searchQuery = "", onSearchChange, onNavigate }) => {
  const [selectedAnime, setSelectedAnime] = useState(null);
  const debouncedSearch = useDebounce(searchQuery);
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

  const recommendedRow = recommendedList.slice(0, 10);

  const {
    data: upcomingData,
    isLoading: upcomingLoading,
    isError: upcomingError,
  } = useUpcomingAnime({ page: 1 });

  const upcomingList = upcomingData?.data || [];
  const recentlyAddedList =
    upcomingList.length > 0 ? upcomingList : recommendedList;

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

  const handleRefreshRecommendations = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ["animeRecommendations"],
      refetchType: "active",
    });
    await refetchRecommendations({ cancelRefetch: false });
  }, [queryClient, refetchRecommendations]);

  return (
    <div className="min-h-screen text-[var(--text-color)]">
      <main className="pb-16">
        <HeroCarousel
          heroList={heroList?.slice(0, 8)}
          heroLoading={heroLoading}
          visible={!debouncedSearch}
          onSelectAnime={handleSelectAnime}
          onAddToWatchlist={handleAddToWatchlist}
          isInWatchlist={isInWatchlist}
        />

        <div className="md:hidden px-4 sm:px-6 mt-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search anime..."
              className="w-full rounded-full border border-[var(--border-color)] bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
            />
          </div>
        </div>

        <div className="mt-8 px-4 sm:px-6 md:px-10">
          <DailyScheduleStrip
            onNavigate={onNavigate}
            onSelectAnime={handleSelectAnime}
          />
        </div>

        {/* Search results row (when searching) - shown first, other sections move down */}
        {debouncedSearch && (
          <Row title="Search Results" className="mt-10">
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
          <Row title="Trending Now" className="mt-10">
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
          <Row title="Your Favorites" className="mt-10">
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
          <div className="mt-10 px-4 sm:px-6 md:px-8 lg:px-12">
            <SectionHeader
              title="Your Watchlist"
              actionLabel="Manage"
              onAction={() => onNavigate?.("watchList")}
            />
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {watchlistAnimes.map((anime) => (
                <PosterCard
                  key={anime.mal_id}
                  anime={anime}
                  onSelect={handleSelectAnime}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recommended for you + Recent Anime Reviews: side-by-side on desktop, stacked on mobile */}
        <div className="mt-10 px-4 sm:px-6 md:px-8 lg:px-12 space-y-10">
          {/* Recommended for you */}
          <section className="flex flex-col min-h-0 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
              <SectionHeader
                title="Recommended for you"
                subtitle="Personal picks based on today’s buzz"
              />
              <button
                type="button"
                onClick={handleRefreshRecommendations}
                disabled={recommendedLoading || recommendationsRefetching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
            <GlassCard className="p-4">
              {recommendedLoading ? (
                <GridSkeleton count={6} />
              ) : recommendedError ? (
                <p className="text-neutral-400">Could not load recommendations.</p>
              ) : recommendedRow.length > 0 ? (
                <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {recommendedRow.map((anime) => (
                    <div key={anime.mal_id} className="min-w-[320px] sm:min-w-[360px]">
                      <AnimeDetailCard anime={anime} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-400">No recommendations yet.</p>
              )}
            </GlassCard>
          </section>

          {/* Recent Anime Reviews */}
          <section className="flex flex-col min-h-0">
            <SectionHeader title="Recent Anime Reviews" className="mb-3 sm:mb-4" />
            <div className="rounded-3xl border border-[var(--border-color)] bg-[radial-gradient(1200px_600px_at_0%_-10%,rgba(168,85,247,0.25),rgba(15,11,20,0.9))] overflow-hidden min-h-[320px]">
              <Suspense fallback={<MiniLoader text="Loading reviews..." />}>
                <AnimeReview onSelectAnime={handleSelectAnime} />
              </Suspense>
            </div>
          </section>
        </div>

        <div className="mt-12 px-4 sm:px-6 md:px-8 lg:px-12">
          <SectionHeader title="Recently Added" />
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {upcomingLoading && recentlyAddedList.length === 0 ? (
              <RowSkeleton count={6} />
            ) : upcomingError && recentlyAddedList.length === 0 ? (
              <p className="text-neutral-400">Could not load recently added.</p>
            ) : recentlyAddedList.length > 0 ? (
              recentlyAddedList.slice(0, 12).map((anime) => (
                <PosterCard
                  key={anime.mal_id}
                  anime={anime}
                  onSelect={handleSelectAnime}
                />
              ))
            ) : (
              <p className="text-neutral-400">No recent items yet.</p>
            )}
          </div>
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

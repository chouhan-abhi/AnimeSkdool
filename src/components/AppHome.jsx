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
import {
  Play,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Star,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
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

const PosterCard = memo(({ anime, onSelect, rank, onWatchlistToggle, isInWatchlist }) => {
  if (!anime) return null;

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
    webp.image_url || jpg.image_url || webp.small_image_url || jpg.small_image_url;

  const inWatchlist = isInWatchlist?.(anime.mal_id);

  return (
    <div className="flex-shrink-0 w-[150px] sm:w-[165px] md:w-[180px] group">
      <button
        type="button"
        onClick={() => onSelect(anime)}
        className="relative w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] rounded-xl"
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-[var(--surface-1)] border border-[var(--border-color)] transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_20px_50px_-16px_var(--glow-color)] group-hover:border-[var(--primary-color)]/25">
          {imgUrl ? (
            <picture>
              {webpSrcSet && (
                <source
                  type="image/webp"
                  srcSet={webpSrcSet}
                  sizes="(min-width: 768px) 180px, 150px"
                />
              )}
              {jpgSrcSet && (
                <source
                  type="image/jpeg"
                  srcSet={jpgSrcSet}
                  sizes="(min-width: 768px) 180px, 150px"
                />
              )}
              <img
                src={imgUrl}
                alt={anime.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                onError={(e) => {
                  if (e.target) e.target.style.display = "none";
                }}
              />
            </picture>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs">
              No image
            </div>
          )}

          {rank && (
            <span className="absolute top-2 left-2 text-2xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-none">
              {rank}
            </span>
          )}

          {anime.score && (
            <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 glass text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              <Star size={9} fill="currentColor" />
              {anime.score}
            </span>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="rounded-full bg-[var(--primary-color)]/80 p-2.5 shadow-[0_0_20px_var(--glow-color)]">
              <Play size={22} className="text-white" fill="white" />
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white text-xs font-semibold line-clamp-2 drop-shadow-lg">
              {anime.title}
            </p>
          </div>
        </div>
      </button>

      {onWatchlistToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onWatchlistToggle(anime);
          }}
          className={`absolute top-2 right-2 z-10 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${
            inWatchlist
              ? "bg-[var(--primary-color)]/80 text-white"
              : "bg-black/50 text-white/70 hover:text-white"
          }`}
          aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          {inWatchlist ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        </button>
      )}

      <p className="mt-2 text-[13px] font-medium text-[var(--text-color)] line-clamp-2 px-0.5 leading-snug group-hover:text-[var(--primary-color)] transition-colors">
        {anime.title}
      </p>
    </div>
  );
});

const RowSkeleton = memo(({ count = 6 }) => (
  <div className="flex gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex-shrink-0 w-[150px] sm:w-[165px] md:w-[180px]">
        <div className="aspect-[2/3] w-full rounded-xl bg-[var(--surface-1)] animate-shimmer" />
        <div className="mt-2 h-3.5 bg-[var(--surface-1)] rounded w-full" />
        <div className="mt-1.5 h-3 bg-[var(--surface-1)] rounded w-3/4" />
      </div>
    ))}
  </div>
));

const Row = memo(({ title, subtitle, children, className = "", actionLabel, onAction }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className={`relative ${className}`}>
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-14 mb-4">
        <SectionHeader title={title} subtitle={subtitle} actionLabel={actionLabel} onAction={onAction} />
        <div className="flex gap-1.5 ml-3">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="p-1.5 rounded-lg bg-[var(--surface-1)]/80 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--surface-1)] disabled:opacity-25 disabled:cursor-default transition-all border border-[var(--border-color)]"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="p-1.5 rounded-lg bg-[var(--surface-1)]/80 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--surface-1)] disabled:opacity-25 disabled:cursor-default transition-all border border-[var(--border-color)]"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto overflow-y-hidden pb-3 pl-4 sm:pl-6 md:pl-10 lg:pl-14 pr-4 sm:pr-6 md:pr-10 lg:pr-14 scroll-smooth snap-row scrollbar-hide"
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

  const startedList = storageManager.getStartedList();

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
      queryClient.invalidateQueries({ queryKey: ["starredAnime"] });
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
      <main className="pb-8">
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
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search anime..."
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-1)]/60 glass px-4 py-3 pl-10 text-sm text-[var(--text-color)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
            />
          </div>
        </div>

        <div className="mt-8 px-4 sm:px-6 md:px-10 lg:px-14">
          <DailyScheduleStrip
            onNavigate={onNavigate}
            onSelectAnime={handleSelectAnime}
          />
        </div>

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
                  isInWatchlist={isInWatchlist}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 w-full text-center">
                <Search size={40} className="text-[var(--text-muted)] mb-3" />
                <p className="text-[var(--text-muted)]">No results for &ldquo;{debouncedSearch}&rdquo;</p>
              </div>
            )}
          </Row>
        )}

        {startedList.length > 0 && (
          <Row
            title="Continue Watching"
            subtitle="Pick up where you left off"
            className="mt-10"
          >
            {startedList.slice(0, 15).map((anime) => (
              <PosterCard
                key={anime.mal_id}
                anime={anime}
                onSelect={handleSelectAnime}
                isInWatchlist={isInWatchlist}
              />
            ))}
          </Row>
        )}

        {heroList.length > 0 && (
          <Row
            title="Trending Now"
            subtitle="Top airing anime this season"
            className="mt-10"
          >
            {heroList.map((anime, idx) => (
              <PosterCard
                key={anime.mal_id}
                anime={anime}
                onSelect={handleSelectAnime}
                rank={idx + 1}
                isInWatchlist={isInWatchlist}
              />
            ))}
          </Row>
        )}

        {starredAnimes.length > 0 && (
          <Row title="Your Favorites" className="mt-10">
            {starredAnimes.map((anime) => (
              <PosterCard
                key={anime.mal_id}
                anime={anime}
                onSelect={handleSelectAnime}
                isInWatchlist={isInWatchlist}
              />
            ))}
          </Row>
        )}

        {watchlistAnimes.length > 0 && (
          <Row
            title="Your Watchlist"
            actionLabel="Manage"
            onAction={() => onNavigate?.("watchList")}
            className="mt-10"
          >
            {watchlistAnimes.map((anime) => (
              <PosterCard
                key={anime.mal_id}
                anime={anime}
                onSelect={handleSelectAnime}
                isInWatchlist={isInWatchlist}
              />
            ))}
          </Row>
        )}

        <div className="mt-12 px-4 sm:px-6 md:px-10 lg:px-14 space-y-12">
          <section>
            <div className="flex items-center justify-between gap-2 mb-4">
              <SectionHeader
                title="Recommended for You"
                subtitle="Personal picks based on today's buzz"
              />
              <button
                type="button"
                onClick={handleRefreshRecommendations}
                disabled={recommendedLoading || recommendationsRefetching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-1)]/80 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--surface-1)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Refresh recommendations"
              >
                <RefreshCw
                  size={16}
                  className={recommendationsRefetching ? "animate-spin" : ""}
                />
                <span className="text-xs font-medium hidden sm:inline">
                  {recommendationsRefetching ? "Refreshing..." : "Refresh"}
                </span>
              </button>
            </div>
            <GlassCard className="p-5" hover>
              {recommendedLoading ? (
                <RowSkeleton count={4} />
              ) : recommendedError ? (
                <p className="text-[var(--text-muted)] py-8 text-center">Could not load recommendations.</p>
              ) : recommendedRow.length > 0 ? (
                <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-thin snap-row">
                  {recommendedRow.map((anime) => (
                    <div key={anime.mal_id} className="min-w-[300px] sm:min-w-[340px] flex-shrink-0">
                      <AnimeDetailCard anime={anime} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-muted)] py-8 text-center">No recommendations yet.</p>
              )}
            </GlassCard>
          </section>

          <section>
            <SectionHeader title="Recent Anime Reviews" className="mb-4" />
            <GlassCard className="overflow-hidden min-h-[300px]" hover>
              <Suspense fallback={<MiniLoader text="Loading reviews..." />}>
                <AnimeReview onSelectAnime={handleSelectAnime} />
              </Suspense>
            </GlassCard>
          </section>
        </div>

        {recentlyAddedList.length > 0 && (
          <Row title="Recently Added" subtitle="Fresh from the vault" className="mt-12">
            {(upcomingLoading && recentlyAddedList.length === 0) ? (
              <RowSkeleton count={6} />
            ) : (upcomingError && recentlyAddedList.length === 0) ? (
              <p className="text-[var(--text-muted)]">Could not load recently added.</p>
            ) : (
              recentlyAddedList.slice(0, 15).map((anime) => (
                <PosterCard
                  key={anime.mal_id}
                  anime={anime}
                  onSelect={handleSelectAnime}
                  isInWatchlist={isInWatchlist}
                />
              ))
            )}
          </Row>
        )}
      </main>

      {selectedAnime && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/90 z-[9999] flex">
              <div className="hidden md:block md:flex-1 bg-[var(--bg-color)]" />
              <div className="flex-1 p-6 text-[var(--text-color)]">
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

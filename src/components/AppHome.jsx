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
  Plus,
  Check,
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

// ----------------------------------------------------
// Apple TV Standard 2:3 Portrait Poster Card
// ----------------------------------------------------
const PosterCard = memo(({ anime, onSelect, onWatchlistToggle, isInWatchlist }) => {
  if (!anime) return null;

  const webp = anime.images?.webp || {};
  const jpg = anime.images?.jpg || {};
  const webpSrcSet = buildSrcSet(
    [webp.small_image_url, webp.image_url, webp.large_image_url],
    [150, 300, 480]
  );
  const jpgSrcSet = buildSrcSet(
    [jpg.small_image_url, jpg.image_url, jpg.large_image_url],
    [150, 300, 480]
  );
  const imgUrl =
    webp.image_url || jpg.image_url || webp.small_image_url || jpg.small_image_url;

  const inWatchlist = isInWatchlist?.(anime.mal_id);

  return (
    <div className="flex-shrink-0 w-[155px] sm:w-[175px] md:w-[195px] lg:w-[210px] group relative select-none">
      <div
        onClick={() => onSelect(anime)}
        className="relative cursor-pointer focus:outline-none"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect(anime);
        }}
      >
        {/* Card Frame */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#14141d] border border-white/[0.08] transition-all duration-300 group-hover:scale-[1.04] group-hover:-translate-y-1.5 group-hover:border-white/25 group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.9),0_0_30px_-5px_var(--glow-color)]">
          {/* Specular Highlight Line */}
          <div className="specular-highlight opacity-40 group-hover:opacity-100 transition-opacity" />

          {imgUrl ? (
            <picture>
              {webpSrcSet && (
                <source
                  type="image/webp"
                  srcSet={webpSrcSet}
                  sizes="(min-width: 1024px) 210px, (min-width: 768px) 195px, 155px"
                />
              )}
              {jpgSrcSet && (
                <source
                  type="image/jpeg"
                  srcSet={jpgSrcSet}
                  sizes="(min-width: 1024px) 210px, (min-width: 768px) 195px, 155px"
                />
              )}
              <img
                src={imgUrl}
                alt={anime.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  if (e.target) e.target.style.display = "none";
                }}
              />
            </picture>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs">
              No Image
            </div>
          )}

          {/* Apple TV Score Pill */}
          {anime.score && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-md text-yellow-400 text-[11px] font-bold px-2 py-0.5 rounded-full border border-white/10 shadow-md">
              <Star size={10} fill="currentColor" />
              <span>{anime.score}</span>
            </div>
          )}

          {/* Airing / Type Badge */}
          {anime.type && (
            <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white/90 text-[10px] font-semibold tracking-wider border border-white/10 uppercase">
              {anime.type}
            </div>
          )}

          {/* Dark Vignette Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Apple TV Play Trigger Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
            <span className="rounded-full bg-white text-black p-3.5 shadow-[0_4px_24px_rgba(255,255,255,0.4)]">
              <Play size={20} className="fill-black translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add to Watchlist / Up Next Button */}
      {onWatchlistToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onWatchlistToggle(anime);
          }}
          className={`absolute top-2.5 left-2.5 z-10 p-1.5 rounded-full backdrop-blur-xl border transition-all duration-200 opacity-0 group-hover:opacity-100 ${
            inWatchlist
              ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-[0_0_12px_var(--glow-color)]"
              : "bg-black/60 text-white/80 border-white/15 hover:bg-white/30 hover:text-white"
          }`}
          aria-label={inWatchlist ? "Remove from Up Next" : "Add to Up Next"}
        >
          {inWatchlist ? <Check size={13} /> : <Plus size={13} />}
        </button>
      )}

      {/* Title & Metadata under Card */}
      <div className="mt-2.5 px-0.5">
        <h3 className="text-xs sm:text-sm font-semibold text-white truncate leading-tight group-hover:text-[var(--primary-color)] transition-colors">
          {anime.title}
        </h3>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
          {[
            anime.genres?.[0]?.name,
            anime.episodes ? `${anime.episodes} eps` : null,
            anime.year || anime.status,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </div>
  );
});

// ----------------------------------------------------
// Apple TV 16:9 Widescreen Landscape Card (Up Next)
// ----------------------------------------------------
const UpNextCard = memo(({ anime, onSelect }) => {
  if (!anime) return null;

  const webp = anime.images?.webp || {};
  const jpg = anime.images?.jpg || {};
  const imgUrl =
    webp.large_image_url || webp.image_url || jpg.large_image_url || jpg.image_url;

  return (
    <div className="flex-shrink-0 w-[260px] sm:w-[300px] md:w-[340px] group relative select-none">
      <div
        onClick={() => onSelect(anime)}
        className="relative cursor-pointer focus:outline-none"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect(anime);
        }}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#14141d] border border-white/[0.08] transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1 group-hover:border-white/25 group-hover:shadow-[0_20px_45px_rgba(0,0,0,0.9),0_0_25px_-5px_var(--glow-color)]">
          <div className="specular-highlight opacity-40 group-hover:opacity-100 transition-opacity" />

          {imgUrl && (
            <img
              src={imgUrl}
              alt={anime.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Episode Tag */}
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold tracking-wider uppercase border border-white/10">
            {anime.episodes ? `Episode 1 of ${anime.episodes}` : "New Episode"}
          </div>

          {/* Center Play Icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
            <span className="rounded-full bg-white text-black p-3 shadow-lg">
              <Play size={18} className="fill-black translate-x-0.5" />
            </span>
          </div>

          {/* Apple TV Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-[var(--primary-color)] w-2/5 rounded-full" />
          </div>
        </div>
      </div>

      <div className="mt-2.5 px-0.5 flex justify-between items-start">
        <div className="min-w-0 pr-2">
          <h3 className="text-sm font-semibold text-white truncate leading-tight group-hover:text-[var(--primary-color)] transition-colors">
            {anime.title}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
            {anime.genres?.slice(0, 2).map((g) => g.name).join(" · ") || "Anime"}
          </p>
        </div>
      </div>
    </div>
  );
});

// ----------------------------------------------------
// Apple TV Top 10 Chart Card with Big Rank Numbers
// ----------------------------------------------------
const TopChartCard = memo(({ anime, rank, onSelect, onWatchlistToggle, isInWatchlist }) => {
  if (!anime) return null;

  const webp = anime.images?.webp || {};
  const jpg = anime.images?.jpg || {};
  const webpSrcSet = buildSrcSet(
    [webp.small_image_url, webp.image_url, webp.large_image_url],
    [150, 300, 480]
  );
  const jpgSrcSet = buildSrcSet(
    [jpg.small_image_url, jpg.image_url, jpg.large_image_url],
    [150, 300, 480]
  );
  const imgUrl =
    webp.image_url || jpg.image_url || webp.small_image_url || jpg.small_image_url;

  const inWatchlist = isInWatchlist?.(anime.mal_id);

  return (
    <div className="flex-shrink-0 relative pl-10 sm:pl-12 md:pl-14 w-[195px] sm:w-[225px] md:w-[250px] lg:w-[265px] group select-none">
      {/* Big Apple TV Typographic Rank Number */}
      <span
        className="rank-number absolute left-0 bottom-7 sm:bottom-8 md:bottom-9 text-7xl sm:text-8xl md:text-9xl tracking-tighter leading-none select-none z-0 pointer-events-none"
        aria-hidden="true"
      >
        {rank}
      </span>

      {/* Poster Card with Uniform Dimensions */}
      <div className="relative z-10 w-full">
        <div
          onClick={() => onSelect(anime)}
          className="relative cursor-pointer focus:outline-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onSelect(anime);
          }}
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#14141d] border border-white/[0.08] transition-all duration-300 group-hover:scale-[1.04] group-hover:-translate-y-1.5 group-hover:border-white/25 group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.9),0_0_30px_-5px_var(--glow-color)]">
            <div className="specular-highlight opacity-40 group-hover:opacity-100 transition-opacity" />

            {imgUrl ? (
              <picture>
                {webpSrcSet && (
                  <source
                    type="image/webp"
                    srcSet={webpSrcSet}
                    sizes="(min-width: 1024px) 210px, (min-width: 768px) 195px, 155px"
                  />
                )}
                {jpgSrcSet && (
                  <source
                    type="image/jpeg"
                    srcSet={jpgSrcSet}
                    sizes="(min-width: 1024px) 210px, (min-width: 768px) 195px, 155px"
                  />
                )}
                <img
                  src={imgUrl}
                  alt={anime.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    if (e.target) e.target.style.display = "none";
                  }}
                />
              </picture>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs">
                No Image
              </div>
            )}

            {anime.score && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-md text-yellow-400 text-[11px] font-bold px-2 py-0.5 rounded-full border border-white/10 shadow-md">
                <Star size={10} fill="currentColor" />
                <span>{anime.score}</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
              <span className="rounded-full bg-white text-black p-3.5 shadow-[0_4px_24px_rgba(255,255,255,0.4)]">
                <Play size={18} className="fill-black translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Quick Add to Watchlist Button */}
        {onWatchlistToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onWatchlistToggle(anime);
            }}
            className={`absolute top-2 left-2 z-20 p-2 rounded-full backdrop-blur-xl border transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-md active:scale-90 ${
              inWatchlist
                ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-[0_0_12px_var(--glow-color)] !opacity-100"
                : "bg-black/60 text-white/80 hover:text-white border-white/15 hover:bg-black/80"
            }`}
            title={inWatchlist ? "In Up Next" : "Add to Up Next"}
          >
            {inWatchlist ? <Check size={13} /> : <Plus size={13} />}
          </button>
        )}

        {/* Title */}
        <div className="mt-2.5 px-0.5">
          <h3 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-[var(--primary-color)] transition-colors">
            {anime.title}
          </h3>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
            {anime.genres?.[0]?.name || "Anime"} · {anime.score || "Popular"} ★
          </p>
        </div>
      </div>
    </div>
  );
});

// ----------------------------------------------------
// Row Skeleton Loader
// ----------------------------------------------------
const RowSkeleton = memo(({ count = 6, wide = false }) => (
  <div className="flex gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`flex-shrink-0 ${
          wide
            ? "w-[260px] sm:w-[300px] md:w-[340px]"
            : "w-[155px] sm:w-[175px] md:w-[195px] lg:w-[210px]"
        }`}
      >
        <div
          className={`${
            wide ? "aspect-[16/9]" : "aspect-[2/3]"
          } w-full rounded-2xl bg-white/[0.05] animate-shimmer border border-white/[0.05]`}
        />
        <div className="mt-3 h-4 bg-white/[0.06] rounded-md w-full" />
        <div className="mt-1.5 h-3 bg-white/[0.04] rounded-md w-2/3" />
      </div>
    ))}
  </div>
));

// ----------------------------------------------------
// Smooth Horizontal Row Container
// ----------------------------------------------------
const Row = memo(({ title, subtitle, badge, children, className = "", actionLabel, onAction }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 15);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 15);
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
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className={`relative ${className}`}>
      <div className="flex items-end justify-between px-6 sm:px-10 md:px-14 lg:px-18 mb-4 max-w-[1800px] mx-auto">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          badge={badge}
          actionLabel={actionLabel}
          onAction={onAction}
        />
        <div className="hidden sm:flex gap-2 ml-4 pb-0.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="p-2 rounded-full bg-white/[0.06] text-white/70 hover:text-white hover:bg-white/15 disabled:opacity-20 disabled:pointer-events-none transition-all border border-white/10 backdrop-blur-md"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="p-2 rounded-full bg-white/[0.06] text-white/70 hover:text-white hover:bg-white/15 disabled:opacity-20 disabled:pointer-events-none transition-all border border-white/10 backdrop-blur-md"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto overflow-y-hidden pb-4 pt-1 pl-6 sm:pl-10 md:pl-14 lg:pl-18 pr-6 sm:pr-10 md:pr-14 lg:pr-18 scroll-smooth snap-row scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </section>
  );
});

// ----------------------------------------------------
// Main AppHome Component
// ----------------------------------------------------
const AppHome = ({ searchQuery = "", onSearchChange, onNavigate, onSelectAnime }) => {
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
      if (onSelectAnime) onSelectAnime(anime);
      else setSelectedAnime(anime);
      return;
    }
    try {
      const full = await fetchAnimeById(anime.mal_id);
      const target = full || anime;
      if (onSelectAnime) onSelectAnime(target);
      else setSelectedAnime(target);
    } catch {
      if (onSelectAnime) onSelectAnime(anime);
      else setSelectedAnime(anime);
    }
  }, [onSelectAnime]);

  const handleAddToWatchlist = useCallback(
    (anime) => {
      if (!anime?.mal_id) return;
      const inList = watchlistAnimes.some((a) => a.mal_id === anime.mal_id);
      if (inList) {
        storageManager.removeFromWatchlist(anime.mal_id);
        showToast?.("Removed from Up Next", "info");
      } else {
        storageManager.saveToWatchlist(anime, true);
        showToast?.("Added to Up Next", "success");
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
    <div className="min-h-screen text-white bg-[var(--bg-color)]">
      <main className="pb-16">
        {/* Apple TV Full-Bleed Hero */}
        <HeroCarousel
          heroList={heroList?.slice(0, 8)}
          heroLoading={heroLoading}
          visible={!debouncedSearch}
          onSelectAnime={handleSelectAnime}
          onAddToWatchlist={handleAddToWatchlist}
          isInWatchlist={isInWatchlist}
        />

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 sm:px-6 mt-6">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search anime, movies..."
              className="w-full rounded-full border border-white/10 bg-white/[0.08] backdrop-blur-2xl px-5 py-3 pl-11 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>

        {/* Apple TV Daily Release Radar Strip */}
        <div className="mt-8 px-6 sm:px-10 md:px-14 lg:px-18 max-w-[1800px] mx-auto">
          <DailyScheduleStrip
            onNavigate={onNavigate}
            onSelectAnime={handleSelectAnime}
          />
        </div>

        {/* Search Results Row */}
        {debouncedSearch && (
          <Row title="Search Results" subtitle={`Matching "${debouncedSearch}"`} className="mt-12">
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
                  onWatchlistToggle={handleAddToWatchlist}
                  isInWatchlist={isInWatchlist}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 w-full text-center">
                <Search size={44} className="text-white/30 mb-3" />
                <p className="text-white/60 font-medium">
                  No anime found for &ldquo;{debouncedSearch}&rdquo;
                </p>
              </div>
            )}
          </Row>
        )}

        {/* Apple TV "Up Next" Row (Continue Watching) */}
        {startedList.length > 0 && !debouncedSearch && (
          <Row
            title="Up Next"
            subtitle="Pick up where you left off"
            badge="Personalized"
            className="mt-12"
          >
            {startedList.slice(0, 12).map((anime) => (
              <UpNextCard
                key={anime.mal_id}
                anime={anime}
                onSelect={handleSelectAnime}
              />
            ))}
          </Row>
        )}

        {/* Apple TV Top 10 Trending Airing Row */}
        {heroList.length > 0 && !debouncedSearch && (
          <Row
            title="Top 10 on AniSkdool"
            subtitle="Most watched series today"
            badge="Live Chart"
            className="mt-14"
          >
            {heroList.slice(0, 10).map((anime, idx) => (
              <TopChartCard
                key={anime.mal_id}
                anime={anime}
                rank={idx + 1}
                onSelect={handleSelectAnime}
                onWatchlistToggle={handleAddToWatchlist}
                isInWatchlist={isInWatchlist}
              />
            ))}
          </Row>
        )}

        {/* User Watchlist Row */}
        {watchlistAnimes.length > 0 && !debouncedSearch && (
          <Row
            title="Saved in Up Next"
            subtitle="Your queued series and movies"
            actionLabel="View All"
            onAction={() => onNavigate?.("watchList")}
            className="mt-14"
          >
            {watchlistAnimes.map((anime) => (
              <PosterCard
                key={anime.mal_id}
                anime={anime}
                onSelect={handleSelectAnime}
                onWatchlistToggle={handleAddToWatchlist}
                isInWatchlist={isInWatchlist}
              />
            ))}
          </Row>
        )}

        {/* Starred / Favorites Row */}
        {starredAnimes.length > 0 && !debouncedSearch && (
          <Row
            title="Favorite Spotlight"
            subtitle="Masterpieces from your collection"
            className="mt-14"
          >
            {starredAnimes.map((anime) => (
              <PosterCard
                key={anime.mal_id}
                anime={anime}
                onSelect={handleSelectAnime}
                onWatchlistToggle={handleAddToWatchlist}
                isInWatchlist={isInWatchlist}
              />
            ))}
          </Row>
        )}

        {/* Curated Recommendations & Community Reviews Section */}
        {!debouncedSearch && (
          <div className="mt-16 px-6 sm:px-10 md:px-14 lg:px-18 max-w-[1800px] mx-auto space-y-14">
            {/* Recommended for You Shelf */}
            <section>
              <div className="flex items-center justify-between gap-4 mb-5">
                <SectionHeader
                  title="Recommended For You"
                  subtitle="Curated daily selections based on trending anime"
                  badge="For You"
                />
                <button
                  type="button"
                  onClick={handleRefreshRecommendations}
                  disabled={recommendedLoading || recommendationsRefetching}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] border border-white/10 text-white/80 hover:text-white hover:bg-white/15 disabled:opacity-40 transition-all text-xs font-semibold backdrop-blur-xl"
                  aria-label="Refresh recommendations"
                >
                  <RefreshCw
                    size={14}
                    className={recommendationsRefetching ? "animate-spin" : ""}
                  />
                  <span>{recommendationsRefetching ? "Refreshing..." : "Refresh"}</span>
                </button>
              </div>

              <GlassCard className="p-6">
                {recommendedLoading ? (
                  <RowSkeleton count={4} wide />
                ) : recommendedError ? (
                  <p className="text-[var(--text-muted)] py-8 text-center">
                    Could not load recommendations.
                  </p>
                ) : recommendedRow.length > 0 ? (
                  <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-thin snap-row">
                    {recommendedRow.map((anime) => (
                      <div
                        key={anime.mal_id}
                        className="min-w-[320px] sm:min-w-[360px] flex-shrink-0"
                      >
                        <AnimeDetailCard anime={anime} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-muted)] py-8 text-center">
                    No recommendations yet.
                  </p>
                )}
              </GlassCard>
            </section>

            {/* Apple TV Critic & Community Reviews */}
            <section>
              <SectionHeader
                title="Viewer Insights & Reviews"
                subtitle="What the anime community is saying"
                className="mb-5"
              />
              <GlassCard className="overflow-hidden min-h-[300px] p-2 sm:p-4" hover>
                <Suspense fallback={<MiniLoader text="Loading reviews..." />}>
                  <AnimeReview onSelectAnime={handleSelectAnime} />
                </Suspense>
              </GlassCard>
            </section>
          </div>
        )}

        {/* Recently Added / Vault Releases */}
        {recentlyAddedList.length > 0 && !debouncedSearch && (
          <Row
            title="Fresh Releases & Vault"
            subtitle="Latest additions to the anime catalog"
            className="mt-16"
          >
            {upcomingLoading && recentlyAddedList.length === 0 ? (
              <RowSkeleton count={6} />
            ) : (
              recentlyAddedList.slice(0, 15).map((anime) => (
                <PosterCard
                  key={anime.mal_id}
                  anime={anime}
                  onSelect={handleSelectAnime}
                  onWatchlistToggle={handleAddToWatchlist}
                  isInWatchlist={isInWatchlist}
                />
              ))
            )}
          </Row>
        )}
      </main>

      {/* Apple TV Cinematic Show/Movie Sheet Modal */}
      {selectedAnime && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center">
              <DetailsPanelLoader />
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

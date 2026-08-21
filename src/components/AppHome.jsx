import React, {
  useState,
  useMemo,
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
// Standard 2:3 Portrait Poster Card
// ----------------------------------------------------
const PosterCard = memo(({ anime, onSelect, onWatchlistToggle, isInWatchlist }) => {
  if (!anime) return null;

  const webp = anime.images?.webp || {};
  const jpg = anime.images?.jpg || {};
  const webpSrcSet = buildSrcSet(
    [webp.small_image_url, webp.image_url, webp.large_image_url],
    [200, 360, 600]
  );
  const jpgSrcSet = buildSrcSet(
    [jpg.small_image_url, jpg.image_url, jpg.large_image_url],
    [200, 360, 600]
  );
  const imgUrl =
    webp.large_image_url || jpg.large_image_url || webp.image_url || jpg.image_url;

  const inWatchlist = isInWatchlist?.(anime.mal_id);

  return (
    <div className="flex-shrink-0 w-[185px] sm:w-[215px] md:w-[245px] lg:w-[265px] group relative select-none">
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
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#08080c] border border-white/[0.06] transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1.5 group-hover:border-white/20 group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.95)]">
          {/* Specular Highlight Line */}
          <div className="specular-highlight opacity-30 group-hover:opacity-100 transition-opacity" />

          {imgUrl ? (
            <picture>
              {webpSrcSet && (
                <source
                  type="image/webp"
                  srcSet={webpSrcSet}
                  sizes="(min-width: 1024px) 265px, (min-width: 768px) 245px, 185px"
                />
              )}
              {jpgSrcSet && (
                <source
                  type="image/jpeg"
                  srcSet={jpgSrcSet}
                  sizes="(min-width: 1024px) 265px, (min-width: 768px) 245px, 185px"
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

          {/* Score Pill */}
          {anime.score && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-md text-yellow-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/10 shadow-md">
              <Star size={10} fill="currentColor" />
              <span>{anime.score}</span>
            </div>
          )}

          {/* Airing / Type Badge */}
          {anime.type && (
            <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white/90 text-[10px] font-semibold tracking-wider border border-white/10 uppercase">
              {anime.type}
            </div>
          )}

          {/* Dark Vignette Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play Trigger Button */}
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
              : "bg-black/70 text-white/80 border-white/15 hover:bg-white/30 hover:text-white"
          }`}
          aria-label={inWatchlist ? "Remove from Up Next" : "Add to Up Next"}
        >
          {inWatchlist ? <Check size={13} /> : <Plus size={13} />}
        </button>
      )}

      {/* Title & Metadata */}
      <div className="mt-3 px-0.5">
        <h3 className="text-xs sm:text-sm font-semibold text-white truncate leading-tight group-hover:text-[var(--primary-color)] transition-colors">
          {anime.title}
        </h3>
        <p className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
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
// 16:9 Widescreen Landscape Card (Up Next)
// ----------------------------------------------------
const UpNextCard = memo(({ anime, onSelect }) => {
  if (!anime) return null;

  const webp = anime.images?.webp || {};
  const jpg = anime.images?.jpg || {};
  const imgUrl =
    webp.large_image_url || webp.image_url || jpg.large_image_url || jpg.image_url;

  return (
    <div className="flex-shrink-0 w-[300px] sm:w-[360px] md:w-[410px] group relative select-none">
      <div
        onClick={() => onSelect(anime)}
        className="relative cursor-pointer focus:outline-none"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect(anime);
        }}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#08080c] border border-white/[0.06] transition-all duration-300 group-hover:scale-[1.025] group-hover:-translate-y-1 group-hover:border-white/20 group-hover:shadow-[0_20px_45px_rgba(0,0,0,0.95)]">
          <div className="specular-highlight opacity-30 group-hover:opacity-100 transition-opacity" />

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
          <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white/90 text-[10px] font-bold tracking-wider uppercase border border-white/10">
            {anime.episodes ? `Episode 1 of ${anime.episodes}` : "New Episode"}
          </div>

          {/* Center Play Icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
            <span className="rounded-full bg-white text-black p-3.5 shadow-lg">
              <Play size={18} className="fill-black translate-x-0.5" />
            </span>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-[var(--primary-color)] w-2/5 rounded-full" />
          </div>
        </div>
      </div>

      <div className="mt-3 px-0.5 flex justify-between items-start">
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
// Top 10 Chart Card with Big Rank Numbers
// ----------------------------------------------------
const TopChartCard = memo(({ anime, rank, onSelect, onWatchlistToggle, isInWatchlist }) => {
  if (!anime) return null;

  const webp = anime.images?.webp || {};
  const jpg = anime.images?.jpg || {};
  const webpSrcSet = buildSrcSet(
    [webp.small_image_url, webp.image_url, webp.large_image_url],
    [200, 360, 600]
  );
  const jpgSrcSet = buildSrcSet(
    [jpg.small_image_url, jpg.image_url, jpg.large_image_url],
    [200, 360, 600]
  );
  const imgUrl =
    webp.large_image_url || jpg.large_image_url || webp.image_url || jpg.image_url;

  const inWatchlist = isInWatchlist?.(anime.mal_id);

  return (
    <div className="flex-shrink-0 relative pl-12 sm:pl-14 md:pl-16 w-[235px] sm:w-[275px] md:w-[310px] lg:w-[335px] group select-none">
      {/* Big Typographic Rank Number */}
      <span
        className="rank-number absolute left-0 bottom-7 sm:bottom-8 md:bottom-9 text-8xl sm:text-9xl md:text-[10rem] tracking-tighter leading-none select-none z-0 pointer-events-none"
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
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#08080c] border border-white/[0.06] transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1.5 group-hover:border-white/20 group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.95)]">
            <div className="specular-highlight opacity-30 group-hover:opacity-100 transition-opacity" />

            {imgUrl ? (
              <picture>
                {webpSrcSet && (
                  <source
                    type="image/webp"
                    srcSet={webpSrcSet}
                    sizes="(min-width: 1024px) 265px, (min-width: 768px) 245px, 185px"
                  />
                )}
                {jpgSrcSet && (
                  <source
                    type="image/jpeg"
                    srcSet={jpgSrcSet}
                    sizes="(min-width: 1024px) 265px, (min-width: 768px) 245px, 185px"
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
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-md text-yellow-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/10 shadow-md">
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
            className={`absolute top-2.5 left-2.5 z-20 p-1.5 rounded-full backdrop-blur-xl border transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-md active:scale-90 ${
              inWatchlist
                ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-[0_0_12px_var(--glow-color)] !opacity-100"
                : "bg-black/70 text-white/80 hover:text-white border-white/15 hover:bg-black/90"
            }`}
            title={inWatchlist ? "In Up Next" : "Add to Up Next"}
          >
            {inWatchlist ? <Check size={13} /> : <Plus size={13} />}
          </button>
        )}

        {/* Title */}
        <div className="mt-3 px-0.5">
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
            ? "w-[300px] sm:w-[360px] md:w-[410px]"
            : "w-[185px] sm:w-[215px] md:w-[245px] lg:w-[265px]"
        }`}
      >
        <div
          className={`${
            wide ? "aspect-[16/9]" : "aspect-[2/3]"
          } w-full rounded-2xl bg-white/[0.04] animate-shimmer border border-white/[0.04]`}
        />
        <div className="mt-3 h-4 bg-white/[0.05] rounded-md w-full" />
        <div className="mt-1.5 h-3 bg-white/[0.03] rounded-md w-2/3" />
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
      <div className="flex items-end justify-between px-4 sm:px-8 md:px-12 lg:px-18 mb-4 max-w-[1800px] mx-auto">
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
        className="flex gap-4 sm:gap-5 overflow-x-auto overflow-y-hidden pb-4 pt-1 pl-4 sm:pl-8 md:pl-12 lg:pl-18 pr-4 sm:pr-8 md:pr-12 lg:pr-18 scroll-smooth snap-row scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </section>
  );
});

// ----------------------------------------------------
// Curated Dual-Pane Recommendations Showcase
// ----------------------------------------------------
const RecommendedShowcase = memo(
  ({
    items = [],
    isLoading,
    isError,
    onRefresh,
    isRefreshing,
    onSelect,
    onWatchlistToggle,
    isInWatchlist,
  }) => {
    const [activeCategory, setActiveCategory] = useState("all");

    const categories = [
      { key: "all", label: "For You" },
      { key: "action", label: "Action & Fantasy" },
      { key: "top", label: "Critically Acclaimed" },
      { key: "supernatural", label: "Supernatural & Sci-Fi" },
    ];

    const filteredItems = useMemo(() => {
      if (!items.length) return [];
      if (activeCategory === "action") {
        return items.filter((a) =>
          a.genres?.some((g) =>
            ["Action", "Fantasy", "Adventure"].includes(g.name)
          )
        );
      }
      if (activeCategory === "top") {
        return items.filter((a) => (a.score || 0) >= 8.5);
      }
      if (activeCategory === "supernatural") {
        return items.filter((a) =>
          a.genres?.some((g) =>
            ["Supernatural", "Sci-Fi", "Mystery", "Drama"].includes(g.name)
          )
        );
      }
      return items;
    }, [items, activeCategory]);

    const displayList = filteredItems.length > 0 ? filteredItems : items;
    const spotlightAnime = displayList[0] || null;
    const gridAnime = displayList.slice(1, 5);

    return (
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionHeader
            title="Recommended For You"
            subtitle="Curated picks personalized for your taste"
            badge="Curated"
          />

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Chips - Zero network calls on switch */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/[0.06] overflow-x-auto">
              {categories.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setActiveCategory(c.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    activeCategory === c.key
                      ? "bg-white text-black shadow-md scale-[1.02]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading || isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 text-white/80 hover:text-white hover:bg-white/15 disabled:opacity-40 transition-all text-xs font-semibold backdrop-blur-xl"
              aria-label="Refresh recommendations"
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          </div>
        </div>

        {isLoading && !items.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-6">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] rounded-2xl bg-[#08080c] border border-white/[0.04] animate-shimmer"
                />
              ))}
            </div>
            <div className="aspect-[16/9] rounded-3xl bg-[#08080c] border border-white/[0.04] animate-shimmer" />
          </div>
        ) : isError && !items.length ? (
          <div className="p-12 rounded-3xl bg-[#08080c] border border-white/[0.06] text-center text-white/50 text-sm">
            Could not load recommendations.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-6 items-stretch">
            {/* Left Curated 4-Tile Grid */}
            <div className="grid grid-cols-2 gap-4">
              {gridAnime.map((anime) => (
                <div
                  key={anime.mal_id}
                  onClick={() => onSelect(anime)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSelect(anime);
                  }}
                  className="group/card relative rounded-2xl overflow-hidden bg-[#08080c] border border-white/[0.06] hover:border-white/20 transition-all duration-300 cursor-pointer flex flex-col justify-between p-3 select-none"
                >
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/60 mb-2.5">
                    <img
                      src={
                        anime.images?.webp?.large_image_url ||
                        anime.images?.jpg?.large_image_url ||
                        anime.images?.webp?.image_url
                      }
                      alt={anime.title}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    {anime.score && (
                      <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/75 backdrop-blur-md text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                        <Star size={9} fill="currentColor" /> {anime.score}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <span className="rounded-full bg-white text-black p-2 shadow-lg">
                        <Play size={13} className="fill-black translate-x-0.5" />
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover/card:text-[var(--primary-color)] transition-colors">
                      {anime.title}
                    </h4>
                    <p className="text-[11px] text-[var(--text-dim)] truncate mt-0.5">
                      {anime.genres?.[0]?.name || "Series"} ·{" "}
                      {anime.episodes ? `${anime.episodes} eps` : "Airing"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Spotlight Right Feature Card */}
            {spotlightAnime && (
              <div
                onClick={() => onSelect(spotlightAnime)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    onSelect(spotlightAnime);
                }}
                className="relative rounded-3xl overflow-hidden bg-[#08080c] border border-white/[0.06] hover:border-white/20 transition-all duration-300 group cursor-pointer flex flex-col justify-end p-6 sm:p-8 min-h-[360px] shadow-[0_20px_50px_rgba(0,0,0,0.95)] select-none"
              >
                <img
                  src={
                    spotlightAnime.banner_image ||
                    spotlightAnime.images?.webp?.large_image_url ||
                    spotlightAnime.images?.jpg?.large_image_url ||
                    spotlightAnime.images?.webp?.image_url
                  }
                  alt={spotlightAnime.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.75] contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/60 to-transparent" />
                <div className="specular-highlight opacity-30 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/30 text-[10px] font-bold uppercase tracking-wider">
                      Featured Pick
                    </span>
                    {spotlightAnime.score && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 text-xs font-bold border border-yellow-500/25">
                        <Star size={10} fill="currentColor" />
                        {spotlightAnime.score}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md leading-tight group-hover:text-[var(--primary-color)] transition-colors">
                    {spotlightAnime.title}
                  </h3>

                  {spotlightAnime.synopsis && (
                    <p className="text-xs sm:text-sm text-white/80 line-clamp-2 max-w-xl leading-relaxed">
                      {spotlightAnime.synopsis
                        .replace(/\[Written by.*?\]/gi, "")
                        .trim()}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-xs font-bold shadow-md group-hover:scale-105 transition-transform">
                      <Play size={14} className="fill-black" />
                      Watch Show
                    </span>
                    {onWatchlistToggle && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWatchlistToggle(spotlightAnime);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 text-xs font-semibold backdrop-blur-xl border border-white/15 transition-all"
                      >
                        {isInWatchlist?.(spotlightAnime.mal_id) ? (
                          <Check size={14} />
                        ) : (
                          <Plus size={14} />
                        )}
                        <span>
                          {isInWatchlist?.(spotlightAnime.mal_id)
                            ? "In Up Next"
                            : "Add to Up Next"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    );
  }
);

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
        {/* Full-Bleed Hero */}
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

        {/* Daily Release Radar Strip */}
        <div className="mt-8 px-4 sm:px-8 md:px-12 lg:px-18 max-w-[1800px] mx-auto">
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

        {/* "Up Next" Row (Continue Watching) */}
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

        {/* Top 10 Trending Airing Row */}
        {heroList.length > 0 && !debouncedSearch && (
          <Row
            title="Top 10 on AnimeSkdool"
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
          <div className="mt-16 px-4 sm:px-8 md:px-12 lg:px-18 max-w-[1800px] mx-auto space-y-16">
            {/* Recommended for You Curated Showcase */}
            <RecommendedShowcase
              items={recommendedList}
              isLoading={recommendedLoading}
              isError={recommendedError}
              onRefresh={handleRefreshRecommendations}
              isRefreshing={recommendationsRefetching}
              onSelect={handleSelectAnime}
              onWatchlistToggle={handleAddToWatchlist}
              isInWatchlist={isInWatchlist}
            />

            {/* Critic & Community Reviews */}
            <section className="space-y-6">
              <SectionHeader
                title="Viewer Insights & Community Reviews"
                subtitle="In-depth reactions, analysis, and scores from verified anime fans"
                badge="Community Voices"
              />
              <Suspense fallback={<MiniLoader text="Loading reviews..." />}>
                <AnimeReview onSelectAnime={handleSelectAnime} />
              </Suspense>
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

      {/* Cinematic Show/Movie Sheet Modal */}
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
            onSelectAnime={handleSelectAnime}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AppHome;

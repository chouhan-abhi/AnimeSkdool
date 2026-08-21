import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import { useSeasonsList, useInfiniteSeasonAnime } from "../../queries/useSeasons";
import AnimeDetailCard from "../../helperComponent/AnimeDetailCard";
import NoAnimeFound from "../../helperComponent/NoAnimeFound";
import { GridLoader, LoadingMore, DetailsPanelLoader } from "../../helperComponent/PageLoader";
import {
  ChevronDown,
  RefreshCw,
  Star,
  Play,
  Grid,
  List,
  Calendar,
  ArrowDown,
  ArrowUp,
  Layers,
  Sparkles,
} from "lucide-react";

const AnimeDetailsPanel = lazy(() => import("../AnimeDetailsPanel"));

const SEASONS_ORDER = ["winter", "spring", "summer", "fall"];

// Standard 2:3 Portrait Poster Card
const SeasonPosterCard = memo(({ anime, onSelect }) => {
  if (!anime) return null;
  const webp = anime.images?.webp || {};
  const jpg = anime.images?.jpg || {};
  const imgUrl =
    webp.large_image_url || webp.image_url || jpg.large_image_url || jpg.image_url;

  return (
    <div
      onClick={() => onSelect(anime)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(anime);
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
SeasonPosterCard.displayName = "SeasonPosterCard";

const SPECIAL_SEASON_OPTIONS = [
  { year: "upcoming", season: "upcoming", label: "🌟 Upcoming Releases" },
  { year: "now", season: "now", label: "🟢 Airing This Season" },
];

const ExploreSeasons = ({ onSelectAnime }) => {
  const { data: seasons, isLoading: loadingSeasons, error: seasonsError } = useSeasonsList();
  const [selected, setSelected] = useState({ year: "now", season: "now" });
  const [sfw, setSfw] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "cards"
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [autoLoadOnScroll, setAutoLoadOnScroll] = useState(true);
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  const handleSelect = useCallback(
    (anime) => {
      if (onSelectAnime) onSelectAnime(anime);
      else setSelectedAnime(anime);
    },
    [onSelectAnime]
  );

  const seasonalArchiveOptions = useMemo(() => {
    if (!Array.isArray(seasons) || seasons.length === 0) return [];
    const regular = seasons
      .filter((item) => item && typeof item.year === "number" && Array.isArray(item.seasons))
      .sort((a, b) => b.year - a.year)
      .flatMap(({ year, seasons: seasonList = [] }) =>
        (Array.isArray(seasonList) ? seasonList : [])
          .slice()
          .sort((a, b) => SEASONS_ORDER.indexOf(b) - SEASONS_ORDER.indexOf(a))
          .map((season) => ({
            year,
            season,
            label: `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`,
          }))
      );

    return [...SPECIAL_SEASON_OPTIONS, ...regular];
  }, [seasons]);

  const quickPillOptions = useMemo(() => {
    return seasonalArchiveOptions.slice(0, 10);
  }, [seasonalArchiveOptions]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
    isRefetching,
  } = useInfiniteSeasonAnime({
    year: selected?.year,
    season: selected?.season,
    sfw,
  });

  const animeList = useMemo(() => {
    return data?.pages.flatMap((p) => p?.data ?? []) ?? [];
  }, [data]);

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

  // Batch load 3 pages
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

  const handleRefresh = async () => {
    setIsInitialLoad(true);
    await refetch({ cancelRefetch: false });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loadingSeasons)
    return (
      <div className="p-4">
        <GridLoader count={6} />
      </div>
    );
  if (seasonsError) return <NoAnimeFound message={seasonsError.message} />;

  return (
    <div className="w-full space-y-6">
      {/* Seasons Controls & Filter Toolbar */}
      <div className="p-5 rounded-3xl bg-[#08080c] border border-white/[0.06] space-y-4 shadow-xl">
        {/* Quick Season Select Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-white/50 mr-1 flex-shrink-0 flex items-center gap-1.5">
            <Calendar size={13} className="text-[var(--primary-color)]" />
            <span>Season:</span>
          </span>

          {quickPillOptions.map((opt) => {
            const isCurrent =
              String(selected?.year) === String(opt.year) &&
              String(selected?.season) === String(opt.season);
            return (
              <button
                key={`${opt.year}-${opt.season}`}
                type="button"
                onClick={() => {
                  setSelected({ year: opt.year, season: opt.season });
                  setIsInitialLoad(true);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isCurrent
                    ? "bg-white text-black shadow-md scale-[1.02]"
                    : "bg-white/[0.05] text-white/70 hover:text-white hover:bg-white/[0.12] border border-white/[0.06]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Options Bar: Year/Season Archive Dropdown + SFW + Layout + Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
          <div className="flex flex-wrap items-center gap-3">
            {/* Full Archive Dropdown */}
            <div className="relative min-w-[200px]">
              <select
                value={selected ? `${selected.year}-${selected.season}` : "now-now"}
                onChange={(e) => {
                  const [y, s] = e.target.value.split("-");
                  setSelected({ year: y === "upcoming" || y === "now" ? y : Number(y), season: s });
                  setIsInitialLoad(true);
                }}
                className="w-full appearance-none rounded-full border border-white/10 bg-white/[0.07] backdrop-blur-xl py-2 pl-4 pr-9 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 capitalize cursor-pointer"
              >
                {seasonalArchiveOptions.map((opt) => (
                  <option
                    key={`${opt.year}-${opt.season}`}
                    value={`${opt.year}-${opt.season}`}
                    className="bg-[#12121a] text-white"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/50" />
            </div>

            {/* SFW Safe Content Button */}
            <button
              type="button"
              onClick={() => setSfw((p) => !p)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                sfw
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}
            >
              {sfw ? "✓ SFW Safe" : "All Content"}
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading || isRefetching}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] hover:bg-white/15 px-4 py-2 text-xs font-semibold text-white/80 hover:text-white transition-all disabled:opacity-40"
            >
              <RefreshCw
                size={13}
                className={isRefetching ? "animate-spin" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>

          {/* Grid vs Cards Layout Switcher */}
          <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === "grid"
                  ? "bg-white text-black shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
              title="Poster Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === "cards"
                  ? "bg-white text-black shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
              title="Detailed Cards View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Catalog Anime Content */}
      <div className="relative">
        {isInitialLoad && isLoading ? (
          <GridLoader count={6} />
        ) : error ? (
          <NoAnimeFound message={error.message} />
        ) : animeList.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {animeList.map((anime, idx) => (
                <SeasonPosterCard
                  key={`${anime.mal_id || idx}-${idx}`}
                  anime={anime}
                  onSelect={handleSelect}
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
        ) : !isInitialLoad && (
          <NoAnimeFound message="No anime found for this season." />
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
                  <span>You&apos;ve reached the end of this season ({animeList.length} titles loaded)</span>
                </div>
              )}

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

      {/* Fallback Details Modal if not passed from parent */}
      {selectedAnime && !onSelectAnime && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center">
              <DetailsPanelLoader />
            </div>
          }
        >
          <AnimeDetailsPanel
            anime={selectedAnime}
            onClose={() => setSelectedAnime(null)}
            onSelectAnime={setSelectedAnime}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ExploreSeasons;

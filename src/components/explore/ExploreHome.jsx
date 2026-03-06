import React, { useState, useCallback, useMemo, useEffect, lazy, Suspense } from "react";
import ExploreAnime from "./ExploreAnime";
import ExploreSeasons from "./ExploreSeasons";
import {
  Calendar,
  TrendingUp,
  Sparkles,
  Search,
  Star,
  ChevronDown,
} from "lucide-react";
import { useRandomAnimeList } from "../../queries/useRandomAnimeList";
import { useQuery } from "@tanstack/react-query";
import storageManager from "../../utils/storageManager";
import GlassCard from "../ui/GlassCard";
import Pill from "../ui/Pill";
import { DetailsPanelLoader } from "../../helperComponent/PageLoader";
import { RANKING_FILTER_CONFIG } from "../../utils/constants";

const AnimeDetailsPanel = lazy(() => import("../AnimeDetailsPanel"));

const usePersistedState = (key, defaultValue) => {
  const [state, setState] = useState(() =>
    storageManager.get(key, defaultValue)
  );
  useEffect(() => {
    storageManager.set(key, state);
  }, [key, state]);
  return [state, setState];
};

const ExploreHome = () => {
  const [viewMode, setViewMode] = useState("seasons");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnime, setSelectedAnime] = useState(null);

  const [type, setType] = usePersistedState(storageManager.keys.type, "");
  const [filter, setFilter] = usePersistedState(
    storageManager.keys.filter,
    "bypopularity"
  );
  const [rating, setRating] = usePersistedState(
    storageManager.keys.rating,
    ""
  );
  const [sfw, setSfw] = usePersistedState(storageManager.keys.sfw, "true");

  const handleModeChange = useCallback((mode) => {
    if (mode === viewMode || isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode(mode);
      setIsTransitioning(false);
    }, 200);
  }, [viewMode, isTransitioning]);

  const quickFilters = useMemo(
    () => [
      { key: "all", label: "All Media", onClick: () => { setType(""); setFilter("bypopularity"); } },
      { key: "airing", label: "Airing Now", onClick: () => { setFilter("airing"); setType(""); } },
      { key: "upcoming", label: "Upcoming", onClick: () => { setFilter("upcoming"); setType(""); } },
      { key: "tv", label: "TV Series", onClick: () => { setType("tv"); setFilter("bypopularity"); } },
      { key: "movie", label: "Movies", onClick: () => { setType("movie"); setFilter("bypopularity"); } },
      { key: "ova", label: "OVAs", onClick: () => { setType("ova"); setFilter("bypopularity"); } },
    ],
    [setType, setFilter]
  );

  const { data: randomList = [], isLoading: randomLoading } =
    useRandomAnimeList(1);
  const randomPick = randomList[0];

  const { data: recentReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["recentReviewsLite"],
    queryFn: async ({ signal }) => {
      const res = await fetch("https://api.jikan.moe/v4/reviews/anime", {
        signal,
      });
      if (!res.ok) throw new Error("Failed to load reviews");
      const json = await res.json();
      return (json?.data || []).slice(0, 3);
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const isRanking = viewMode === "ranking";
  const hasAdvancedFilters = type || rating || sfw !== "true";
  const handleResetAdvancedFilters = useCallback(() => {
    setType("");
    setRating("");
    setSfw("true");
  }, [setType, setRating, setSfw]);

  const modes = [
    {
      key: "seasons",
      label: "Seasons",
      icon: Calendar,
      description: "Browse by season",
    },
    {
      key: "ranking",
      label: "Explore",
      icon: TrendingUp,
      description: "Top ranked anime",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 px-4 sm:px-6 md:px-8 lg:px-10 pt-6 pb-10">

        {/* Main Content */}
        <section className="min-w-0">
          <GlassCard className="p-4 mb-4">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {modes.map((mode) => {
                const Icon = mode.icon;
                const active = viewMode === mode.key;
                return (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => handleModeChange(mode.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                      active
                        ? "bg-[var(--primary-color)] text-white shadow-[0_0_18px_var(--glow-color)]"
                        : "bg-white/5 text-[var(--text-color)]/75 hover:text-[var(--text-color)]"
                    }`}
                    title={mode.description}
                  >
                    <Icon size={14} />
                    {mode.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                {isRanking ? (
                  <>
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search anime, studios, or users..."
                      className="w-full rounded-full border border-[var(--border-color)] bg-white/10 py-2.5 pl-9 pr-4 text-sm text-[var(--text-color)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/50"
                    />
                  </>
                ) : (
                  <p className="rounded-full border border-[var(--border-color)] bg-white/5 px-4 py-2.5 text-sm text-[var(--text-color)]/70">
                    Browse anime by year and season. Switch to Explore for ranking filters.
                  </p>
                )}
              </div>
            </div>
            {isRanking && (
              <>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)]">Quick Filters:</span>
                  {quickFilters.map((item) => {
                    const isActive =
                      (item.key === "all" && !type && filter === "bypopularity") ||
                      (item.key === "airing" && filter === "airing") ||
                      (item.key === "upcoming" && filter === "upcoming") ||
                      (item.key === "tv" && type === "tv" && filter === "bypopularity") ||
                      (item.key === "movie" && type === "movie" && filter === "bypopularity") ||
                      (item.key === "ova" && type === "ova" && filter === "bypopularity");
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={item.onClick}
                        className={`rounded-full px-3 py-1 text-xs font-semibold border transition ${
                          isActive
                            ? "border-[var(--primary-color)]/40 bg-[var(--primary-color)]/20 text-[var(--primary-color)]"
                            : "border-[var(--border-color)] bg-white/5 text-[var(--text-color)]/70 hover:text-[var(--text-color)]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 rounded-2xl border border-[var(--border-color)] bg-white/5 p-3 sm:p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs text-[var(--text-muted)]">
                      Fine tune results
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative min-w-[135px]">
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-[var(--border-color)] bg-white/10 py-2 pl-3 pr-8 text-xs text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
                        >
                          {RANKING_FILTER_CONFIG.type.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                      </div>
                      <div className="relative min-w-[150px]">
                        <select
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-[var(--border-color)] bg-white/10 py-2 pl-3 pr-8 text-xs text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
                        >
                          {RANKING_FILTER_CONFIG.filter.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                      </div>
                      <div className="relative min-w-[150px]">
                        <select
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-[var(--border-color)] bg-white/10 py-2 pl-3 pr-8 text-xs text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
                        >
                          {RANKING_FILTER_CONFIG.rating.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSfw((prev) => (prev === "true" ? "false" : "true"))}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                          sfw === "true"
                            ? "bg-emerald-500/90 text-white"
                            : "bg-rose-500/90 text-white"
                        }`}
                      >
                        {sfw === "true" ? "Safe Content" : "All Content"}
                      </button>
                      {hasAdvancedFilters && (
                        <button
                          type="button"
                          onClick={handleResetAdvancedFilters}
                          className="rounded-xl border border-[var(--border-color)] bg-white/10 px-3 py-2 text-xs font-semibold text-[var(--text-color)]/80 hover:bg-white/20 transition"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </GlassCard>

          <div className="relative">
            {isTransitioning && (
              <div className="absolute inset-0 bg-[var(--bg-color)]/90 z-10 flex items-center justify-center rounded-2xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Sparkles
                      className="w-8 h-8 text-[var(--primary-color)] animate-spin"
                      style={{ animationDuration: "1.5s" }}
                    />
                    <div className="absolute inset-0 w-8 h-8 rounded-full bg-[var(--primary-color)]/20 animate-ping" />
                  </div>
                  <span className="text-xs text-[var(--text-color)]/50 font-medium tracking-wide">
                    Loading...
                  </span>
                </div>
              </div>
            )}
            <div
              className={`transition-all duration-300 ease-out ${
                isTransitioning ? "opacity-0 scale-[0.99]" : "opacity-100 scale-100"
              }`}
            >
              {viewMode === "seasons" ? (
                <ExploreSeasons embedded />
              ) : (
                <ExploreAnime
                  embedded
                  externalState={{
                    type,
                    setType,
                    filter,
                    setFilter,
                    rating,
                    setRating,
                    sfw,
                    setSfw,
                    searchQuery,
                    setSearchQuery,
                  }}
                />
              )}
            </div>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="hidden xl:flex flex-col gap-4">
          <GlassCard className="p-4">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-2">
              Random Pick
            </div>
            {randomLoading ? (
              <div className="h-40 rounded-xl bg-white/5 animate-pulse" />
            ) : randomPick ? (
              <button
                type="button"
                onClick={() => setSelectedAnime(randomPick)}
                className="w-full rounded-2xl border border-[var(--border-color)] bg-white/5 p-3 text-left transition hover:shadow-[0_18px_50px_-35px_var(--glow-color)]"
              >
                <img
                  src={
                    randomPick.images?.webp?.image_url ||
                    randomPick.images?.jpg?.image_url
                  }
                  alt={randomPick.title}
                  className="h-32 w-full rounded-xl object-cover"
                />
                <div className="mt-3 flex items-center gap-2">
                  <Pill className="bg-[var(--primary-color)]/20 text-[var(--primary-color)]">
                    Must Watch
                  </Pill>
                  {randomPick.score && (
                    <span className="text-xs text-yellow-400">★ {randomPick.score}</span>
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold text-[var(--text-color)] line-clamp-2">
                  {randomPick.title}
                </p>
              </button>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">No pick yet.</p>
            )}
          </GlassCard>

          <GlassCard className="p-4">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-3">
              Recent Reviews
            </div>
            <div className="space-y-3">
              {reviewsLoading && (
                <div className="space-y-2">
                  <div className="h-16 rounded-xl bg-white/5 animate-pulse" />
                  <div className="h-16 rounded-xl bg-white/5 animate-pulse" />
                </div>
              )}
              {!reviewsLoading &&
                recentReviews.map((review) => (
                  <button
                    key={review.mal_id}
                    type="button"
                    onClick={() => setSelectedAnime(review.entry)}
                    className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] bg-white/5 p-3 text-left hover:bg-white/10 transition"
                  >
                    <img
                      src={
                        review.entry?.images?.webp?.image_url ||
                        review.entry?.images?.jpg?.image_url
                      }
                      alt={review.entry?.title}
                      className="h-12 w-9 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-color)] line-clamp-2">
                        {review.entry?.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                        <Star size={10} className="text-yellow-400" />
                        <span>{review.score || "?"}</span>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </GlassCard>
        </aside>
      </div>

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
            onClose={() => setSelectedAnime(null)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ExploreHome;

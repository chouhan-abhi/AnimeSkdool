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
  Compass,
  Play,
} from "lucide-react";
import { useRandomAnimeList } from "../../queries/useRandomAnimeList";
import { useQuery } from "@tanstack/react-query";
import storageManager from "../../utils/storageManager";
import GlassCard from "../ui/GlassCard";
import Pill from "../ui/Pill";
import SectionHeader from "../ui/SectionHeader";
import { DetailsPanelLoader } from "../../helperComponent/PageLoader";
import { RANKING_FILTER_CONFIG } from "../../utils/constants";
import { jikanFetch } from "../../utils/jikanClient";

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

const ExploreHome = ({ onSelectAnime }) => {
  const [viewMode, setViewMode] = useState("seasons");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnime, setSelectedAnime] = useState(null);

  const handleSelect = useCallback(
    (anime) => {
      if (onSelectAnime) onSelectAnime(anime);
      else setSelectedAnime(anime);
    },
    [onSelectAnime]
  );

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

  const handleModeChange = useCallback(
    (mode) => {
      if (mode === viewMode || isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setViewMode(mode);
        setIsTransitioning(false);
      }, 150);
    },
    [viewMode, isTransitioning]
  );

  const quickFilters = useMemo(
    () => [
      {
        key: "all",
        label: "All Catalog",
        onClick: () => {
          setType("");
          setFilter("bypopularity");
        },
      },
      {
        key: "airing",
        label: "Airing Now",
        onClick: () => {
          setFilter("airing");
          setType("");
        },
      },
      {
        key: "upcoming",
        label: "Upcoming",
        onClick: () => {
          setFilter("upcoming");
          setType("");
        },
      },
      {
        key: "tv",
        label: "TV Series",
        onClick: () => {
          setType("tv");
          setFilter("bypopularity");
        },
      },
      {
        key: "movie",
        label: "Feature Films",
        onClick: () => {
          setType("movie");
          setFilter("bypopularity");
        },
      },
      {
        key: "ova",
        label: "OVAs & Specials",
        onClick: () => {
          setType("ova");
          setFilter("bypopularity");
        },
      },
    ],
    [setType, setFilter]
  );

  const { data: randomList = [], isLoading: randomLoading } =
    useRandomAnimeList(1);
  const randomPick = randomList[0];

  const { data: recentReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["recentReviewsLite"],
    queryFn: async ({ signal }) => {
      const json = await jikanFetch("/reviews/anime", { signal });
      return (json?.data || []).slice(0, 3);
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
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
      label: "Seasonal Catalog",
      icon: Calendar,
      description: "Browse anime by year and premiere season",
    },
    {
      key: "ranking",
      label: "Charts & Rankings",
      icon: TrendingUp,
      description: "Top rated and most popular anime",
    },
  ];

  return (
    <div className="min-h-screen text-white px-6 sm:px-10 md:px-14 lg:px-18 max-w-[1800px] mx-auto pb-24">
      {/* Header */}
      <div className="pt-8 pb-6">
        <SectionHeader
          title="Browse Catalog"
          subtitle="Discover anime across premier seasons, top charts, and curated genres"
          badge="Discovery"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        {/* Main Section */}
        <section className="min-w-0">
          {/* Apple TV Segmented Switcher & Search Filter Bar */}
          <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl mb-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Apple TV Segmented Switcher */}
              <div className="flex items-center p-1 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const active = viewMode === mode.key;
                  return (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => handleModeChange(mode.key)}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                        active
                          ? "bg-white text-black shadow-md scale-[1.02]"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar for Rankings */}
              {isRanking && (
                <div className="relative flex-1 min-w-[220px] max-w-md">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                  />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, studio, author..."
                    className="w-full rounded-full border border-white/10 bg-white/[0.07] backdrop-blur-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
              )}
            </div>

            {/* Quick Filter Pills */}
            {isRanking && (
              <div className="space-y-4 pt-2 border-t border-white/[0.06]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-white/50 mr-1">Filter:</span>
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
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-white text-black shadow-sm scale-[1.02]"
                            : "bg-white/[0.06] text-white/70 border border-white/10 hover:text-white hover:bg-white/[0.12]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {/* Advanced Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[130px]">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full appearance-none rounded-full border border-white/10 bg-white/[0.07] py-1.5 pl-3.5 pr-8 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                      {RANKING_FILTER_CONFIG.type.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#12121a] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                  </div>

                  <div className="relative min-w-[140px]">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full appearance-none rounded-full border border-white/10 bg-white/[0.07] py-1.5 pl-3.5 pr-8 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                      {RANKING_FILTER_CONFIG.filter.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#12121a] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setSfw((prev) => (prev === "true" ? "false" : "true"))}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      sfw === "true"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {sfw === "true" ? "✓ SFW Safe" : "All Content"}
                  </button>

                  {hasAdvancedFilters && (
                    <button
                      type="button"
                      onClick={handleResetAdvancedFilters}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Catalog Content Grid */}
          <div className="relative">
            {isTransitioning ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
              </div>
            ) : viewMode === "seasons" ? (
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
        </section>

        {/* Apple TV Right Discovery Sidebar */}
        <aside className="hidden xl:flex flex-col gap-6">
          {/* Spotlight Spotlight Card */}
          <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl space-y-3">
            <p className="text-xs uppercase font-bold tracking-wider text-white/50">
              Spotlight of the Day
            </p>

            {randomLoading ? (
              <div className="h-48 rounded-2xl bg-white/5 animate-shimmer" />
            ) : randomPick ? (
              <div
                onClick={() => handleSelect(randomPick)}
                className="group relative rounded-2xl overflow-hidden bg-[#14141d] border border-white/10 cursor-pointer transition-all hover:scale-[1.02]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleSelect(randomPick);
                }}
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <img
                    src={
                      randomPick.images?.webp?.large_image_url ||
                      randomPick.images?.jpg?.large_image_url ||
                      randomPick.images?.webp?.image_url
                    }
                    alt={randomPick.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="rounded-full bg-white text-black p-2.5 shadow-lg">
                      <Play size={16} className="fill-black translate-x-0.5" />
                    </span>
                  </div>
                </div>

                <div className="p-3.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-white/90">
                      Must Watch
                    </span>
                    {randomPick.score && (
                      <span className="text-xs text-yellow-400 font-bold flex items-center gap-0.5">
                        <Star size={10} fill="currentColor" /> {randomPick.score}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[var(--primary-color)] transition-colors">
                    {randomPick.title}
                  </h4>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40">No pick available.</p>
            )}
          </div>

          {/* Critic & Community Reviews Sidebar */}
          <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl space-y-4">
            <p className="text-xs uppercase font-bold tracking-wider text-white/50">
              Community Reviews
            </p>

            <div className="space-y-3">
              {reviewsLoading && (
                <div className="space-y-2">
                  <div className="h-16 rounded-2xl bg-white/5 animate-shimmer" />
                  <div className="h-16 rounded-2xl bg-white/5 animate-shimmer" />
                </div>
              )}

              {!reviewsLoading &&
                recentReviews.map((review) => (
                  <div
                    key={review.mal_id}
                    onClick={() => handleSelect(review.entry)}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 cursor-pointer transition-all group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleSelect(review.entry);
                    }}
                  >
                    <img
                      src={
                        review.entry?.images?.webp?.image_url ||
                        review.entry?.images?.jpg?.image_url
                      }
                      alt={review.entry?.title}
                      className="w-11 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-semibold text-white truncate group-hover:text-[var(--primary-color)] transition-colors">
                        {review.entry?.title}
                      </h5>
                      <div className="flex items-center gap-1 text-[11px] text-yellow-400 font-semibold mt-1">
                        <Star size={10} fill="currentColor" />
                        <span>Score: {review.score || "8.5"}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Details Sheet Modal */}
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
            onClose={() => setSelectedAnime(null)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ExploreHome;

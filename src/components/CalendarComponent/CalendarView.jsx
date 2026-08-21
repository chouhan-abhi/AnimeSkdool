import React, { useMemo, useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import {
  SlidersHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";
import { useSchedulesQuery } from "../../queries/useSchedulesQuery";
import { weekDays, extractGenres } from "./utils";
import FiltersBar from "./FiltersBar";
import MinimalDayView from "./MinimalDayView";
import NoAnimeFound from "../../helperComponent/NoAnimeFound";
import CalendarLoader from "../../helperComponent/CalendarLoader";
import PageLoader, { DetailsPanelLoader } from "../../helperComponent/PageLoader";
import SectionHeader from "../ui/SectionHeader";
import storageManager from "../../utils/storageManager";
import { useToast } from "../../utils/toast";
import { useDebounce } from "../../utils/utils";

const AnimeDetailsPanel = lazy(() => import("../AnimeDetailsPanel"));

const CalendarView = ({ onSelectAnime }) => {
  const { showToast } = useToast();
  const { data, error, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSchedulesQuery();

  const [selectedAnime, setSelectedAnime] = useState(null);
  const [cachedData, setCachedData] = useState(null);
  const [useCache, setUseCache] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSelect = useCallback(
    (anime) => {
      if (onSelectAnime) onSelectAnime(anime);
      else setSelectedAnime(anime);
    },
    [onSelectAnime]
  );

  const handleClosePanel = useCallback(() => {
    setSelectedAnime(null);
  }, []);

  // Load from cache first
  useEffect(() => {
    try {
      const stored = storageManager.get(storageManager.keys.CALENDAR_DATA_KEY);
      if (stored && stored.length > 0) {
        setCachedData(stored);
        setUseCache(true);
      }
    } catch (e) {
      console.warn("Could not load cached calendar data", e);
    }
  }, []);

  // Cache data
  const cacheTimeoutRef = useRef(null);
  useEffect(() => {
    if (data && !isLoading && !useCache) {
      clearTimeout(cacheTimeoutRef.current);
      cacheTimeoutRef.current = setTimeout(() => {
        const flat = data.pages.flatMap((page) => page.data);
        if (flat.length > 0) {
          storageManager.set(storageManager.keys.CALENDAR_DATA_KEY, flat);
        }
      }, 1000);
    }
    return () => clearTimeout(cacheTimeoutRef.current);
  }, [data, isLoading, useCache]);

  // Auto fetch all pages in background
  const idleFetchRef = useRef(null);
  useEffect(() => {
    if (useCache || !hasNextPage || isFetchingNextPage || idleFetchRef.current) return;

    const scheduleFetch = () => {
      fetchNextPage();
      idleFetchRef.current = null;
    };

    if ("requestIdleCallback" in window) {
      idleFetchRef.current = requestIdleCallback(scheduleFetch, { timeout: 1500 });
    } else {
      idleFetchRef.current = setTimeout(scheduleFetch, 250);
    }

    return () => {
      if (!idleFetchRef.current) return;
      if ("cancelIdleCallback" in window) cancelIdleCallback(idleFetchRef.current);
      else clearTimeout(idleFetchRef.current);
      idleFetchRef.current = null;
    };
  }, [hasNextPage, fetchNextPage, useCache, isFetchingNextPage]);

  const allAnime = useMemo(() => {
    if (useCache && cachedData) return cachedData;
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data, cachedData, useCache]);

  const todayIndex = useMemo(() => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1;
  }, []);

  const [currentDayIndex, setCurrentDayIndex] = useState(todayIndex);

  const savedFilters = storageManager.get(storageManager.keys.CALENDAR_FILTERS, {
    search: "",
    selectedGenre: "All",
    selectedStatus: "All",
    showStarredOnly: false,
  });

  const [search, setSearch] = useState(savedFilters.search);
  const [selectedGenre, setSelectedGenre] = useState(savedFilters.selectedGenre);
  const [selectedStatus, setSelectedStatus] = useState(savedFilters.selectedStatus);
  const [showStarredOnly, setShowStarredOnly] = useState(savedFilters.showStarredOnly);

  const debouncedSearch = useDebounce(search, 300);

  const [starredSet, setStarredSet] = useState(() => {
    const watchlist = storageManager.get(storageManager.keys.WATCHLIST_KEY, []);
    const starredIds = watchlist
      .filter((anime) => anime.isStarred)
      .map((anime) => anime.mal_id);
    return new Set(starredIds);
  });

  useEffect(() => {
    storageManager.set(storageManager.keys.CALENDAR_FILTERS, {
      search,
      selectedGenre,
      selectedStatus,
      showStarredOnly,
    });
  }, [search, selectedGenre, selectedStatus, showStarredOnly]);

  const genres = useMemo(() => extractGenres(allAnime), [allAnime]);

  const toggleStar = useCallback(
    (anime) => {
      setStarredSet((prev) => {
        const isCurrentlyStarred = prev.has(anime.mal_id);
        const willBeStarred = !isCurrentlyStarred;
        storageManager.saveToWatchlist(anime, willBeStarred);
        showToast(
          willBeStarred
            ? `⭐ Added ${anime.title} to favorites`
            : `Removed ${anime.title} from favorites`,
          willBeStarred ? "success" : "info"
        );
        const newSet = new Set(prev);
        if (willBeStarred) newSet.add(anime.mal_id);
        else newSet.delete(anime.mal_id);
        return newSet;
      });
    },
    [showToast]
  );

  const filteredList = useMemo(() => {
    if (!allAnime.length) return [];
    const searchLower = debouncedSearch.toLowerCase();
    const hasSearch = searchLower.length > 0;
    const statusCheck =
      selectedStatus === "All"
        ? null
        : selectedStatus === "Upcoming"
        ? "Not yet aired"
        : selectedStatus;

    return allAnime.filter((anime) => {
      if (hasSearch && !anime.title.toLowerCase().includes(searchLower)) return false;
      if (selectedGenre !== "All" && !anime.genres?.some((g) => g.name === selectedGenre))
        return false;
      if (statusCheck && anime.status !== statusCheck) return false;
      if (showStarredOnly && !starredSet.has(anime.mal_id)) return false;
      return true;
    });
  }, [allAnime, debouncedSearch, selectedGenre, selectedStatus, showStarredOnly, starredSet]);

  const animeByDay = useMemo(() => {
    const grouped = {};
    const counts = {};
    for (const day of weekDays) {
      grouped[day] = [];
      counts[day] = 0;
    }
    for (const anime of filteredList) {
      const day = anime.broadcast?.day;
      if (!day) continue;
      const normalizedDay = weekDays.find((d) =>
        day.toLowerCase().startsWith(d.toLowerCase())
      );
      if (!normalizedDay) continue;
      grouped[normalizedDay].push({
        ...anime,
        starred: starredSet.has(anime.mal_id),
        onToggleStar: () => toggleStar(anime),
      });
      counts[normalizedDay]++;
    }
    return { grouped, counts };
  }, [filteredList, starredSet, toggleStar]);

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setSelectedGenre("All");
    setSelectedStatus("All");
    setShowStarredOnly(false);
    showToast("Filters reset", "info");
  }, [showToast]);

  const currentDay = weekDays[currentDayIndex];

  return (
    <div className="min-h-screen px-4 sm:px-8 md:px-12 lg:px-18 max-w-[1800px] mx-auto pb-24 text-white">
      {/* Header */}
      <div className="pt-8 pb-6">
        <SectionHeader
          title="Weekly Airing Guide"
          subtitle="Explore broadcast television release times across Japan and worldwide"
          badge="Live Guide"
        />
      </div>

      {/* Day Switcher Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {weekDays.map((day, idx) => {
          const active = currentDayIndex === idx;
          const isToday = idx === todayIndex;
          const count = animeByDay.counts[day] || 0;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setCurrentDayIndex(idx)}
              className={`flex-1 min-w-[100px] sm:min-w-[120px] p-3.5 rounded-2xl border transition-all duration-200 select-none text-center ${
                active
                  ? "bg-white text-black border-white shadow-[0_4px_24px_rgba(255,255,255,0.2)] scale-[1.03]"
                  : "bg-[#08080c] text-white/80 border-white/[0.06] hover:border-white/20 hover:bg-[#0c0c12] hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">{day}</span>
                {isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      active ? "bg-black" : "bg-[var(--primary-color)]"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  active ? "text-black/60" : "text-white/40"
                }`}
              >
                {count} {count === 1 ? "Show" : "Shows"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-3xl bg-[#08080c] border border-white/[0.06] mb-8 flex flex-wrap items-center justify-between gap-4">
        <FiltersBar
          search={search}
          setSearch={setSearch}
          genres={genres}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          showStarredOnly={showStarredOnly}
          setShowStarredOnly={setShowStarredOnly}
          onClearFilters={clearAllFilters}
        />

        <button
          type="button"
          onClick={async () => {
            setIsRefreshing(true);
            setUseCache(false);
            try {
              await refetch();
              showToast("Guide updated", "success");
            } finally {
              setIsRefreshing(false);
            }
          }}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/15 border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all disabled:opacity-40"
        >
          <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
          <span>Sync</span>
        </button>
      </div>

      {/* Day Content View */}
      {isLoading && !useCache ? (
        <CalendarLoader />
      ) : error ? (
        <NoAnimeFound message={error.message} />
      ) : (
        <MinimalDayView
          schedule={animeByDay.grouped[currentDay] || []}
          day={currentDay}
          onSelectAnime={handleSelect}
        />
      )}

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
            onClose={handleClosePanel}
            onSelectAnime={handleSelect}
          />
        </Suspense>
      )}
    </div>
  );
};

export default CalendarView;

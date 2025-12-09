import React, { useMemo, useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import {
  SlidersHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useSchedulesQuery } from "../../queries/useSchedulesQuery";
import { weekDays, extractGenres } from "./utils";
import FiltersBar from "./FiltersBar";
import MinimalDayView from "./MinimalDayView";
import NoAnimeFound from "../../helperComponent/NoAnimeFound";
import PageLoader from "../../helperComponent/PageLoader";
import storageManager from "../../utils/storageManager";
import { useToast } from "../../utils/toast";
import { useDebounce } from "../../utils/utils";

// ✅ Lazy load heavy components
const AnimeDetailsPanel = lazy(() => import("../AnimeDetailsPanel"));

const CalendarView = () => {
  const { showToast } = useToast();
  const { data, error, isLoading, refetch, fetchNextPage, hasNextPage } =
    useSchedulesQuery();

  const [selectedAnime, setSelectedAnime] = useState(null);
  const [cachedData, setCachedData] = useState(null);
  const [useCache, setUseCache] = useState(false);

  // Memoize onClose to prevent re-renders
  const handleClosePanel = useCallback(() => {
    setSelectedAnime(null);
  }, []);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ Load from storageManager first
  useEffect(() => {
    try {
      const stored = storageManager.get(storageManager.keys.CALENDAR_DATA_KEY);
      if (stored && stored.length > 0) {
        setCachedData(stored);
        setUseCache(true);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // ✅ Cache API data once it's fully loaded (debounced to avoid excessive writes)
  const cacheTimeoutRef = useRef(null);
  useEffect(() => {
    if (data && !isLoading && !useCache) {
      clearTimeout(cacheTimeoutRef.current);
      cacheTimeoutRef.current = setTimeout(() => {
        const flat = data.pages.flatMap((page) => page.data);
        if (flat.length > 0) {
          storageManager.set(storageManager.keys.CALENDAR_DATA_KEY, flat);
        }
      }, 1000); // Debounce cache writes
    }
    return () => clearTimeout(cacheTimeoutRef.current);
  }, [data, isLoading, useCache]);

  // ✅ Auto–fetch next page with LIMIT to prevent memory issues
  // Only fetch up to 3 pages on mobile, 5 on desktop
  const MAX_PAGES = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 3 : 5;
  const pageCountRef = useRef(0);
  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    // Reset page count when data changes (e.g., on initial load)
    if (!data?.pages) {
      pageCountRef.current = 0;
    } else {
      pageCountRef.current = data.pages.length;
    }
  }, [data?.pages?.length]);
  
  useEffect(() => {
    // Stop fetching if we hit the limit or using cache
    if (useCache || !hasNextPage || hasFetchedRef.current) return;
    if (pageCountRef.current >= MAX_PAGES) return;
    
    hasFetchedRef.current = true;
    fetchNextPage().finally(() => {
      hasFetchedRef.current = false;
    });
  }, [hasNextPage, fetchNextPage, useCache]);

  // ✅ Final dataset (either cached or API)
  const allAnime = useMemo(() => {
    if (useCache && cachedData) return cachedData;
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data, cachedData, useCache]);

  // ✅ App settings
  const appSettings = useMemo(() => {
    return storageManager.getSettings();
  }, []);
  const isDayView = appSettings.calendarView === "day";

  // ✅ Day handling - memoize today calculation
  const todayIndex = useMemo(() => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1;
  }, []);
  const [currentDayIndex, setCurrentDayIndex] = useState(todayIndex);

  // ✅ Load saved filters from storage
  const savedFilters = storageManager.get(storageManager.keys.CALENDAR_FILTERS, {
    search: "",
    selectedGenre: "All",
    selectedStatus: "All",
    showStarredOnly: false,
  });

  // ✅ Filters - initialized from storage
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(savedFilters.search);
  const [selectedGenre, setSelectedGenre] = useState(savedFilters.selectedGenre);
  const [selectedStatus, setSelectedStatus] = useState(savedFilters.selectedStatus);
  const [showStarredOnly, setShowStarredOnly] = useState(savedFilters.showStarredOnly);
  
  // ✅ Debounce search for better performance
  const debouncedSearch = useDebounce(search, 300);
  
  // ✅ Load starred anime from storage on mount - use Set for O(1) lookup
  const [starredSet, setStarredSet] = useState(() => {
    const watchlist = storageManager.get(storageManager.keys.WATCHLIST_KEY, []);
    const starredIds = watchlist
      .filter((anime) => anime.isStarred)
      .map((anime) => anime.mal_id);
    return new Set(starredIds);
  });
  
  // ✅ Convert Set to array for backward compatibility (only where needed)
  const starred = useMemo(() => Array.from(starredSet), [starredSet]);

  // ✅ Initial sync of starred state on mount
  useEffect(() => {
    const watchlist = storageManager.get(storageManager.keys.WATCHLIST_KEY, []);
    const starredIds = watchlist
      .filter((anime) => anime.isStarred)
      .map((anime) => anime.mal_id);
    setStarredSet(new Set(starredIds));
  }, []); // Run once on mount

  // ✅ Persist filters to storage
  useEffect(() => {
    storageManager.set(storageManager.keys.CALENDAR_FILTERS, {
      search,
      selectedGenre,
      selectedStatus,
      showStarredOnly,
    });
  }, [search, selectedGenre, selectedStatus, showStarredOnly]);

  // ✅ Sync starred state with storage - runs on mount and when data is loaded
  const allAnimeLengthRef = useRef(0);
  useEffect(() => {
    // Sync when anime data is first loaded or changes
    if (allAnime.length > 0 && allAnime.length !== allAnimeLengthRef.current) {
      allAnimeLengthRef.current = allAnime.length;
      const watchlist = storageManager.get(storageManager.keys.WATCHLIST_KEY, []);
      const starredIds = watchlist
        .filter((anime) => anime.isStarred)
        .map((anime) => anime.mal_id);
      const newSet = new Set(starredIds);
      
      // Only update if there's a change to avoid unnecessary re-renders
      setStarredSet((prev) => {
        if (prev.size !== newSet.size || !starredIds.every(id => prev.has(id))) {
          return newSet;
        }
        return prev;
      });
    }
  }, [allAnime.length]);

  // ✅ Memoize genres extraction
  const genres = useMemo(() => extractGenres(allAnime), [allAnime]);

  const toggleStar = useCallback((anime) => {
    setStarredSet((prev) => {
      const isCurrentlyStarred = prev.has(anime.mal_id);
      const willBeStarred = !isCurrentlyStarred;
      
      // Update storage immediately
      storageManager.saveToWatchlist(anime, willBeStarred);
      
      // Show toast notification
      showToast(
        willBeStarred 
          ? `⭐ ${anime.title} added to favorites` 
          : `Removed ${anime.title} from favorites`,
        willBeStarred ? 'success' : 'info'
      );
      
      // Return updated Set
      const newSet = new Set(prev);
      if (willBeStarred) {
        newSet.add(anime.mal_id);
      } else {
        newSet.delete(anime.mal_id);
      }
      return newSet;
    });
  }, [showToast]);


  // ✅ Optimized filter with early returns and cached values
  const filteredList = useMemo(() => {
    if (!allAnime.length) return [];
    
    // Cache lowercase search for performance
    const searchLower = debouncedSearch.toLowerCase();
    const hasSearch = searchLower.length > 0;
    
    // Pre-compute status check
    const statusCheck = selectedStatus === "All" 
      ? null 
      : selectedStatus === "Upcoming" 
        ? "Not yet aired" 
        : selectedStatus;
    
    return allAnime.filter((anime) => {
      // Early return for search
      if (hasSearch && !anime.title.toLowerCase().includes(searchLower)) {
        return false;
      }
      
      // Early return for genre
      if (selectedGenre !== "All" && !anime.genres?.some((g) => g.name === selectedGenre)) {
        return false;
      }
      
      // Early return for status
      if (statusCheck && anime.status !== statusCheck) {
        return false;
      }
      
      // Early return for starred filter
      if (showStarredOnly && !starredSet.has(anime.mal_id)) {
        return false;
      }
      
      return true;
    });
  }, [allAnime, debouncedSearch, selectedGenre, selectedStatus, showStarredOnly, starredSet]);

  // ✅ Group by day with counts - optimized with Set lookup
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

  // ✅ Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearch("");
    setSelectedGenre("All");
    setSelectedStatus("All");
    setShowStarredOnly(false);
    showToast("All filters cleared", "info");
  }, [showToast]);

  // ✅ Jump to today
  const jumpToToday = useCallback(() => {
    setCurrentDayIndex(todayIndex);
    showToast("Jumped to today", "info");
  }, [showToast, todayIndex]);

  // ✅ Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if no input is focused
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Escape to close details panel
      if (e.key === 'Escape' && selectedAnime) {
        setSelectedAnime(null);
        return;
      }

      // Only handle arrow keys in day view
      if (!isDayView) return;

      // Left/Right arrows to navigate days
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentDayIndex((prev) => (prev - 1 + weekDays.length) % weekDays.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentDayIndex((prev) => (prev + 1) % weekDays.length);
      } else if (e.key === 't' || e.key === 'T') {
        // 'T' key to jump to today
        e.preventDefault();
        jumpToToday();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDayView, selectedAnime, jumpToToday]);

  if (isLoading && !useCache) return <PageLoader />;
  if (error) {
    return (
      <div className="p-8 text-center">
        <NoAnimeFound message={error.message} />
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const currentDay = weekDays[currentDayIndex];
  const totalAnimeCount = filteredList.length;

  return (
    <div className="relative w-full bg-[var(--bg-color)] border border-[var(--text-color)]/10 p-2 my-4 md:p-6 rounded-xl shadow-inner">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4">
        {/* First Row: Title and Action Buttons */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold text-[var(--text-color)]">
              Calendar
            </h2>
            {totalAnimeCount > 0 && (
              <span className="px-2 py-1 rounded-full bg-[var(--primary-color)]/20 text-[var(--primary-color)] text-xs font-medium">
                {totalAnimeCount} anime
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Jump to Today (Day View Only) */}
            {isDayView && (
              <button
                type="button"
                onClick={jumpToToday}
                className="flex items-center gap-1 rounded-full text-xs px-3 py-2 shadow-md bg-[var(--text-color)]/10 hover:bg-[var(--text-color)]/20 text-[var(--text-color)] transition"
                title="Jump to today (Press T)"
              >
                <CalendarIcon size={14} />
                Today
              </button>
            )}
            
            <button
              type="button"
              onClick={async () => {
                setIsRefreshing(true);
                setUseCache(false);
                try {
                  await refetch();
                  showToast("Calendar refreshed", "success");
                } catch (err) {
                  showToast("Failed to refresh", "error");
                } finally {
                  setIsRefreshing(false);
                }
              }}
              disabled={isRefreshing}
              className="flex items-center rounded-full text-xs p-2 shadow-md bg-[var(--text-color)]/10 hover:bg-[var(--text-color)]/20 text-[var(--text-color)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh calendar data"
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="md:hidden p-2 bg-[var(--primary-color)] text-white rounded-full hover:opacity-90 transition"
              aria-label="Open filters"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Second Row: Desktop Filters */}
        <div className="hidden md:block">
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
        </div>
      </div>

      {/* Empty State for No Results */}
      {totalAnimeCount === 0 && allAnime.length > 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="text-[var(--text-color)]/50 mb-4">
            <SlidersHorizontal size={64} className="opacity-50" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-color)]/80 mb-2">
            No anime match your filters
          </h3>
          <p className="text-sm text-[var(--text-color)]/60 mb-4">
            Try adjusting your search, genre, or status filters
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          {/* Day / Week View */}
          {isDayView ? (
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentDayIndex(
                      (prev) => (prev - 1 + weekDays.length) % weekDays.length
                    )
                  }
                  className="p-2 rounded-full bg-[var(--text-color)]/10 hover:bg-[var(--text-color)]/20 text-[var(--text-color)] transition"
                  title="Previous day (←)"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[var(--primary-color)]">
                    {currentDay}
                  </h3>
                  {animeByDay.counts[currentDay] > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--primary-color)]/20 text-[var(--primary-color)] text-xs font-medium">
                      {animeByDay.counts[currentDay]}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentDayIndex((prev) => (prev + 1) % weekDays.length)
                  }
                  className="p-2 rounded-full bg-[var(--text-color)]/10 hover:bg-[var(--text-color)]/20 text-[var(--text-color)] transition"
                  title="Next day (→)"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <MinimalDayView
                schedule={animeByDay.grouped[currentDay] || []}
                day={currentDay}
                onSelectAnime={setSelectedAnime}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weekDays.map((day) => (
                <div key={day} className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    {animeByDay.counts[day] > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--primary-color)]/90 text-white text-xs font-medium shadow-lg">
                        ({animeByDay.counts[day]})
                      </span>
                    )}
                  </div>
                  <MinimalDayView
                    schedule={animeByDay.grouped[day] || []}
                    day={day}
                    onSelectAnime={setSelectedAnime}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Filters Overlay */}
      {showFilters && (
        <div className="fixed inset-0 bg-[var(--bg-color)] z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-[var(--bg-color)] border-b border-[var(--text-color)]/20">
            <h3 className="text-lg font-bold text-[var(--text-color)]">Filters</h3>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="text-[var(--text-color)]/60 hover:text-[var(--text-color)] transition"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
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
          </div>
        </div>
      )}

      {/* Details Panel - Lazy Loaded */}
      {selectedAnime && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center">
              <PageLoader />
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

export default CalendarView;

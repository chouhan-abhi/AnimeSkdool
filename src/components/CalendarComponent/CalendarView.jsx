import React, { useMemo, useState, useEffect } from "react";
import {
  SlidersHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useSchedulesQuery } from "../../queries/useSchedulesQuery";
import { weekDays, extractGenres } from "./utils";
import FiltersBar from "./FiltersBar";
import MinimalDayView from "./MinimalDayView";
import AnimeDetailsPanel from "../AnimeDetailsPanel";
import NoAnimeFound from "../../helperComponent/NoAnimeFound";
import PageLoader from "../../helperComponent/PageLoader";
import storageManager from "../../utils/storageManager";

const LOCAL_KEY = "calendarData";

const CalendarView = () => {
  const { data, error, isLoading, refetch, fetchNextPage, hasNextPage } =
    useSchedulesQuery();

  const [selectedAnime, setSelectedAnime] = useState(null);
  const [cachedData, setCachedData] = useState(null);
  const [useCache, setUseCache] = useState(false);

  // ✅ Load from localStorage first
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_KEY));
      if (stored && stored.length > 0) {
        setCachedData(stored);
        setUseCache(true);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // ✅ Cache API data once it's fully loaded
  useEffect(() => {
    if (data && !isLoading && !useCache) {
      const flat = data.pages.flatMap((page) => page.data);
      if (flat.length > 0) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(flat));
      }
    }
  }, [data, isLoading, useCache]);

  // ✅ Auto–fetch next page until no more
  useEffect(() => {
    if (!useCache && hasNextPage) {
      fetchNextPage();
    }
  }, [data, hasNextPage, fetchNextPage, useCache]);

  // ✅ Final dataset (either cached or API)
  const allAnime = useMemo(() => {
    if (useCache && cachedData) return cachedData;
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data, cachedData, useCache]);

  // ✅ App settings
  const appSettings = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("appSettings")) || {};
    } catch {
      return {};
    }
  }, []);
  const isDayView = appSettings.calendarView === "day";

  // ✅ Day handling
  const todayIndex = new Date().getDay();
  const normalizedIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  const [currentDayIndex, setCurrentDayIndex] = useState(normalizedIndex);

  // ✅ Filters
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [starred, setStarred] = useState([]);

  const genres = extractGenres(allAnime);

  const toggleStar = (anime) => {
    setStarred((prev) =>
      prev.includes(anime.mal_id)
        ? prev.filter((id) => id !== anime.mal_id)
        : [...prev, anime.mal_id]
    );

    const willBeStarred = !starred.includes(anime.mal_id);
    storageManager.saveToWatchlist(anime, willBeStarred);
  };


  const filteredList = useMemo(() => {
    return allAnime.filter((anime) => {
      const matchesSearch = anime.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesGenre =
        selectedGenre === "All" ||
        anime.genres.some((g) => g.name === selectedGenre);
      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Upcoming"
          ? anime.status === "Not yet aired"
          : anime.status === selectedStatus);
      const matchesStarred = !showStarredOnly || starred.includes(anime.mal_id);
      return (
        matchesSearch && matchesGenre && matchesStatus && matchesStarred
      );
    });
  }, [allAnime, search, selectedGenre, selectedStatus, showStarredOnly, starred]);

  // ✅ Group by day
  const animeByDay = useMemo(() => {
    const grouped = {};
    weekDays.forEach((day) => (grouped[day] = []));
    filteredList.forEach((anime) => {
      const day = anime.broadcast?.day;
      if (!day) return;
      const normalizedDay = weekDays.find((d) =>
        day.toLowerCase().startsWith(d.toLowerCase())
      );
      if (!normalizedDay) return;
      grouped[normalizedDay].push({
        ...anime,
        starred: starred.includes(anime.mal_id),
        onToggleStar: () => toggleStar(anime),
      });
    });
    return grouped;
  }, [filteredList, starred]);

  if (isLoading && !useCache) return <PageLoader />;
  if (error) return <NoAnimeFound message={error.message} />;

  const currentDay = weekDays[currentDayIndex];

  return (
    <div className="relative w-full bg-gray-950 p-2 my-4 md:p-6 rounded-xl shadow-inner">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-100 flex justify-between items-center gap-2">
          Calendar
          <div className="flex items-center gap-2">
            {/* No Load More button anymore */}
            <button
              onClick={() => {
                setUseCache(false);
                refetch();
              }}
              className="flex items-center rounded-full text-xs px-4 py-2 shadow-md bg-gray-800 text-gray-200 hover:bg-gray-700"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              onClick={() => setShowFilters(true)}
              className="md:hidden p-2 bg-[var(--primary-color)] text-white rounded-full"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </h2>

        {/* Desktop Filters */}
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
          />
        </div>
      </div>

      {/* Day / Week View */}
      {isDayView ? (
        <div className="relative">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={() =>
                setCurrentDayIndex(
                  (prev) => (prev - 1 + weekDays.length) % weekDays.length
                )
              }
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-200"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-bold text-[var(--primary-color)]">
              {currentDay}
            </h3>
            <button
              onClick={() =>
                setCurrentDayIndex((prev) => (prev + 1) % weekDays.length)
              }
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <MinimalDayView
            schedule={animeByDay[currentDay] || []}
            day={currentDay}
            onSelectAnime={setSelectedAnime}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => (
            <MinimalDayView
              key={day}
              schedule={animeByDay[day] || []}
              day={day}
              onSelectAnime={setSelectedAnime}
            />
          ))}
        </div>
      )}

      {/* Filters Overlay */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-white"
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
            />
          </div>
        </div>
      )}

      {/* Details Panel */}
      {selectedAnime && (
        <AnimeDetailsPanel
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
        />
      )}
    </div>
  );
};

export default CalendarView;

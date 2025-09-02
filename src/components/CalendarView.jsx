import React, { useMemo, useEffect, useState } from "react";
import AnimeDetailsPanel from "./AnimeDetailsPanel";
import MinimalDayView from "../helperComponent/MinimalDayView";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const LOCAL_STORAGE_KEY = "animeScheduleCache";
const STARRED_KEY = "starredAnime";
const FILTER_KEY = "animeFilters";
const APP_SETTINGS_KEY = "appSettings";

const CalendarView = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);

  const appSettings = JSON.parse(localStorage.getItem(APP_SETTINGS_KEY)) || {};
  const [calendarView, setCalendarView] = useState(appSettings.calendarView || "week");
  const [mobileDayIndex, setMobileDayIndex] = useState(new Date().getDay() - 1);

  // Filters
  const savedFilters = JSON.parse(localStorage.getItem(FILTER_KEY)) || {};
  const [search, setSearch] = useState(savedFilters.search || "");
  const [selectedGenre, setSelectedGenre] = useState(savedFilters.selectedGenre || "All");
  const [selectedStatus, setSelectedStatus] = useState(savedFilters.selectedStatus || "All");
  const [showStarredOnly, setShowStarredOnly] = useState(savedFilters.showStarredOnly || false);

  const [genres, setGenres] = useState([]);
  const [starred, setStarred] = useState(() => JSON.parse(localStorage.getItem(STARRED_KEY)) || []);
  const [selectedAnime, setSelectedAnime] = useState(null);

  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setAnimeList(parsed);
      extractGenres(parsed);
    }
  }, []);

  const extractGenres = (list) => {
    const allGenres = new Set();
    list.forEach((anime) => anime.genres?.forEach((g) => allGenres.add(g.name)));
    setGenres(["All", ...Array.from(allGenres).sort()]);
  };

  const toggleStar = (animeId) => {
    const updated = starred.includes(animeId)
      ? starred.filter((id) => id !== animeId)
      : [...starred, animeId];
    setStarred(updated);
    localStorage.setItem(STARRED_KEY, JSON.stringify(updated));
  };

  const filteredList = useMemo(() => {
    return animeList.filter((anime) => {
      const matchesSearch = anime.title.toLowerCase().includes(search.toLowerCase());
      const matchesGenre = selectedGenre === "All" || anime.genres.some((g) => g.name === selectedGenre);
      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Upcoming" ? anime.status === "Not yet aired" : anime.status === selectedStatus);
      const matchesStarred = !showStarredOnly || starred.includes(anime.mal_id);
      return matchesSearch && matchesGenre && matchesStatus && matchesStarred;
    });
  }, [animeList, search, selectedGenre, selectedStatus, showStarredOnly, starred]);

  const animeByDay = useMemo(() => {
    const grouped = {};
    weekDays.forEach((day) => (grouped[day] = []));
    filteredList.forEach((anime) => {
      const day = anime.broadcast?.day;
      if (!day) return;
      const normalizedDay = weekDays.find((d) => day.toLowerCase().startsWith(d.toLowerCase()));
      if (!normalizedDay) return;
      grouped[normalizedDay].push({
        ...anime,
        localTime: anime.broadcast?.time || "??:??",
        starred: starred.includes(anime.mal_id),
        onToggleStar: () => toggleStar(anime.mal_id),
      });
    });
    return grouped;
  }, [filteredList, starred]);

  const handlePrevDay = () => setMobileDayIndex((prev) => (prev - 1 + weekDays.length) % weekDays.length);
  const handleNextDay = () => setMobileDayIndex((prev) => (prev + 1) % weekDays.length);
  const currentDay = weekDays[mobileDayIndex % 7];

  return (
    <div className="relative w-full bg-gray-950 p-4 rounded-xl shadow-inner">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-100">Anime Calendar</h2>

        {/* Filters - right side on large screens */}
        <div className="flex items-center gap-2 flex-wrap md:ml-auto">
          {/* Show filters inline on large screens */}
          <div className="hidden md:flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-2 py-1 rounded-full bg-gray-800 text-white w-36"
            />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-2 py-1 rounded-full  bg-gray-800 text-white"
            >
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2 py-1 rounded-full  bg-gray-800 text-white"
            >
              <option value="All">All</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Airing">Airing</option>
            </select>
            <button
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              className={`flex items-center gap-2 px-3 py-[6px] rounded-full text-sm font-medium transition ${showStarredOnly
                  ? "bg-[var(--primary-color)] text-white"
                  : "bg-gray-800 text-gray-200"
                }`}
            >
              {showStarredOnly ? "★ Starred Only" : "☆ Starred Only"}
            </button>

          </div>

          {/* Toggle button for small screens */}
          <button
            className="md:hidden flex items-center gap-1 px-2 py-1 bg-gray-800 rounded"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Search className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Day switcher */}
        {calendarView === "day" && (
          <div className="flex items-center w-32 justify-between bg-gray-800 px-1 py-1 rounded-lg mt-2 md:mt-0">
            <button onClick={handlePrevDay} className="rounded-full hover:bg-gray-700">
              <ChevronLeft className="w-5 h-5 text-gray-200" />
            </button>
            <span className="text-gray-100 font-medium mx-1 text-center">{currentDay}</span>
            <button onClick={handleNextDay} className="rounded-full hover:bg-gray-700">
              <ChevronRight className="w-5 h-5 text-gray-200" />
            </button>
          </div>
        )}
      </div>


      {/* Filter panel for small screens */}
      {filtersOpen && (
        <div className="flex flex-col gap-2 mb-4 md:hidden bg-gray-800 p-2 rounded">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-2 py-1 rounded bg-gray-700 text-white"
          />
          <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className="px-2 py-1 rounded bg-gray-700 text-white">
            {genres.map((g) => (<option key={g} value={g}>{g}</option>))}
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-2 py-1 rounded bg-gray-700 text-white">
            <option value="All">All</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Airing">Airing</option>
          </select>
          <label className="flex items-center gap-1 text-sm text-gray-200">
            <input type="checkbox" checked={showStarredOnly} onChange={() => setShowStarredOnly(!showStarredOnly)} />
            Starred Only
          </label>
        </div>
      )}

      {/* Calendar Views */}
      {calendarView === "week" ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => (
            <MinimalDayView key={day} schedule={animeByDay[day] || []} day={day} onSelectAnime={setSelectedAnime} />
          ))}
        </div>
      ) : (
        <MinimalDayView schedule={animeByDay[currentDay] || []} day={currentDay} onSelectAnime={setSelectedAnime} />
      )}

      {selectedAnime && <AnimeDetailsPanel anime={selectedAnime} onClose={() => setSelectedAnime(null)} />}
    </div>
  );
};

export default CalendarView;

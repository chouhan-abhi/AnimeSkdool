import React, { useMemo, useEffect, useState } from "react";
import AnimeDetailsPanel from "./AnimeDetailsPanel";

const getTimeInHours = (timeStr = "00:00") => {
  const [h, m] = timeStr.split(":");
  return parseInt(h) + parseInt(m) / 60;
};

const getDurationInMin = (durationStr = "24 min") => {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 24;
};

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const LOCAL_STORAGE_KEY = "animeScheduleCache";
const STARRED_KEY = "starredAnime";
const FILTER_KEY = "animeFilters"; // ✅ NEW KEY

const fetchAnimeSchedule = async (page) => {
  const response = await fetch(`https://api.jikan.moe/v4/seasons/now?filter=tv&page=${page}`);
  const json = await response.json();
  return json?.data || [];
};

const CalendarView = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Initialize filters from localStorage
  const savedFilters = JSON.parse(localStorage.getItem(FILTER_KEY)) || {};
  const [search, setSearch] = useState(savedFilters.search || "");
  const [selectedGenre, setSelectedGenre] = useState(savedFilters.selectedGenre || "All");
  const [selectedStatus, setSelectedStatus] = useState(savedFilters.selectedStatus || "All");
  const [showStarredOnly, setShowStarredOnly] = useState(savedFilters.showStarredOnly || false);

  const [genres, setGenres] = useState([]);
  const [starred, setStarred] = useState(() => JSON.parse(localStorage.getItem(STARRED_KEY)) || []);
  const [selectedAnime, setSelectedAnime] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ✅ Persist filter changes
  useEffect(() => {
    localStorage.setItem(
      FILTER_KEY,
      JSON.stringify({ search, selectedGenre, selectedStatus, showStarredOnly })
    );
  }, [search, selectedGenre, selectedStatus, showStarredOnly]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setAnimeList(parsed);
      extractGenres(parsed);
    } else {
      fetchAllSchedules();
    }
  }, []);

  const fetchAllSchedules = async () => {
    setLoading(true);
    try {
      const [page1, page2, page3] = await Promise.all([
        fetchAnimeSchedule(1),
        fetchAnimeSchedule(2),
        fetchAnimeSchedule(3),
      ]);
      const combined = [...page1, ...page2, ...page3].slice(0, 75);
      setAnimeList(combined);
      extractGenres(combined);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combined));
    } catch (error) {
      console.error("Failed to fetch anime schedule:", error);
    } finally {
      setLoading(false);
    }
  };

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
      const matchesGenre =
        selectedGenre === "All" || anime.genres.some((g) => g.name === selectedGenre);
      const matchesStatus = selectedStatus === "All" || anime.status === selectedStatus;
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
        start: anime.broadcast?.time ? getTimeInHours(anime.broadcast.time) : null,
      });
    });
    Object.keys(grouped).forEach((day) =>
      grouped[day].sort((a, b) => (a.start ?? Infinity) - (b.start ?? Infinity))
    );
    return grouped;
  }, [filteredList]);

  if (loading && animeList.length === 0) {
    return <div className="text-center text-gray-400 py-10">Loading schedule...</div>;
  }

  return (
    <div className="relative w-full bg-gray-950 p-4 rounded-xl shadow-inner">
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-100">Weekly Anime Schedule</h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-700 text-sm"
          />
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-700 text-sm"
          >
            {genres.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-700 text-sm"
          >
            <option value="All">All Status</option>
            <option value="Currently Airing">Currently Airing</option>
            <option value="Finished Airing">Finished Airing</option>
          </select>
          <button
            onClick={() => setShowStarredOnly((prev) => !prev)}
            className={`px-3 py-1 rounded text-sm font-semibold ${
              showStarredOnly ? "bg-yellow-500 text-black" : "bg-gray-700 text-white"
            }`}
          >
            {showStarredOnly ? "★ Starred" : "☆ All"}
          </button>
        </div>
      </div>

      {/* Responsive Calendar */}
      <div
        className={`${
          isMobile
            ? "flex overflow-x-auto gap-4 snap-x"
            : "grid grid-cols-7 gap-4 min-w-[1000px]"
        }`}
      >
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-gray-900 rounded-lg shadow-md p-3 flex flex-col snap-start min-w-[85%] md:min-w-0 transition-transform"
          >
            <h3 className="text-center text-lg font-semibold text-gray-100 mb-3 border-b border-gray-700 pb-2">
              {day}
            </h3>
            {(animeByDay[day] || []).length === 0 ? (
              <p className="text-gray-600 text-center text-sm">No anime airing</p>
            ) : (
              <div className="space-y-3">
                {animeByDay[day].map((anime) => (
                  <div
                    key={anime.mal_id}
                    className="relative rounded-lg overflow-hidden h-36 cursor-pointer group shadow-lg hover:scale-105 transition-transform"
                    onClick={() => setSelectedAnime(anime)}
                  >
                    <img
                      src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                      alt={anime.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
                    <div className="relative z-10 p-2 flex flex-col justify-end h-full text-white">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{anime.broadcast?.time || "??:??"}</span>
                        <span>{getDurationInMin(anime.duration)} min</span>
                      </div>
                      <span className="text-sm font-bold truncate">{anime.title}</span>
                      {anime.episodes && (
                        <span className="text-xs text-gray-300">Upcoming Ep: {anime.episodes}</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(anime.mal_id);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md bg-black/30 text-yellow-400 text-lg"
                      style={{ zIndex: 20 }}
                    >
                      {starred.includes(anime.mal_id) ? "★" : "☆"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Anime Details Panel */}
      {selectedAnime && (
        <AnimeDetailsPanel anime={selectedAnime} onClose={() => setSelectedAnime(null)} />
      )}
    </div>
  );
};

export default CalendarView;

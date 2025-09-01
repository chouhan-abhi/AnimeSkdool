import React, { useMemo, useEffect, useState } from "react";
import AnimeDetailsPanel from "./AnimeDetailsPanel";
import MinimalDayView from "../helperComponent/MinimalDayView";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- Helpers ---
const getDurationInMin = (durationStr = "24 min") => {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 24;
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const LOCAL_STORAGE_KEY = "animeScheduleCache";
const STARRED_KEY = "starredAnime";
const FILTER_KEY = "animeFilters";
const APP_SETTINGS_KEY = "appSettings"; // ✅ new key

// --- API fetch ---
const fetchAnimeSchedule = async (page) => {
  const response = await fetch(
    `https://api.jikan.moe/v4/seasons/now?filter=tv&page=${page}`
  );
  const json = await response.json();
  return json?.data || [];
};

// --- Time conversion (JST → Local) ---
const convertJSTtoLocal = (timeStr = "00:00") => {
  if (!timeStr) return "??:??";
  try {
    const [h, m] = timeStr.split(":").map(Number);
    const utcDate = new Date(Date.UTC(1970, 0, 1, h - 9, m));
    return utcDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timeStr;
  }
};

const CalendarView = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);

    const appSettings =
      JSON.parse(localStorage.getItem(APP_SETTINGS_KEY)) || {};
  // ✅ Load initial view
  const [calendarView, setCalendarView] = useState(appSettings.calendarView || "week");
  console.log(appSettings);

  // ✅ Sync with localStorage on every mount + when storage updates
  useEffect(() => {
    const syncCalendarView = () => {
      try {
        const appSettings =
          JSON.parse(localStorage.getItem(APP_SETTINGS_KEY)) || {};
        if (appSettings.calendarView && appSettings.calendarView !== calendarView) {
          setCalendarView(appSettings.calendarView);
        }
      } catch {}
    };

    // run once on mount
    syncCalendarView();

    // run whenever localStorage changes (same tab or others)
    const interval = setInterval(syncCalendarView, 500); // poll every 500ms
    window.addEventListener("storage", syncCalendarView);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", syncCalendarView);
    };
  }, [calendarView]);

  const [mobileDayIndex, setMobileDayIndex] = useState(
    new Date().getDay() - 1
  );

  // ✅ Filters
  const savedFilters =
    JSON.parse(localStorage.getItem(FILTER_KEY)) || {};
  const [search, setSearch] = useState(savedFilters.search || "");
  const [selectedGenre, setSelectedGenre] = useState(
    savedFilters.selectedGenre || "All"
  );
  const [selectedStatus, setSelectedStatus] = useState(
    savedFilters.selectedStatus || "All"
  );
  const [showStarredOnly, setShowStarredOnly] = useState(
    savedFilters.showStarredOnly || false
  );

  const [genres, setGenres] = useState([]);
  const [starred, setStarred] = useState(
    () => JSON.parse(localStorage.getItem(STARRED_KEY)) || []
  );
  const [selectedAnime, setSelectedAnime] = useState(null);

  // ✅ Load from cache or fetch
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
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(combined)
      );
    } catch (error) {
      console.error("Failed to fetch anime schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractGenres = (list) => {
    const allGenres = new Set();
    list.forEach((anime) =>
      anime.genres?.forEach((g) => allGenres.add(g.name))
    );
    setGenres(["All", ...Array.from(allGenres).sort()]);
  };

  const toggleStar = (animeId) => {
    const updated = starred.includes(animeId)
      ? starred.filter((id) => id !== animeId)
      : [...starred, animeId];
    setStarred(updated);
    localStorage.setItem(STARRED_KEY, JSON.stringify(updated));
  };

  // ✅ Filtering
  const filteredList = useMemo(() => {
    return animeList.filter((anime) => {
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
      const matchesStarred =
        !showStarredOnly || starred.includes(anime.mal_id);
      return (
        matchesSearch &&
        matchesGenre &&
        matchesStatus &&
        matchesStarred
      );
    });
  }, [
    animeList,
    search,
    selectedGenre,
    selectedStatus,
    showStarredOnly,
    starred,
  ]);

  // ✅ Group by weekday
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
        localTime: anime.broadcast?.time
          ? convertJSTtoLocal(anime.broadcast.time)
          : "??:??",
      });
    });
    Object.keys(grouped).forEach((day) =>
      grouped[day].sort((a, b) =>
        a.localTime > b.localTime ? 1 : -1
      )
    );
    return grouped;
  }, [filteredList]);

  if (loading && animeList.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        Loading schedule...
      </div>
    );
  }

  // ✅ Day Switcher
  const handlePrevDay = () =>
    setMobileDayIndex(
      (prev) => (prev - 1 + weekDays.length) % weekDays.length
    );
  const handleNextDay = () =>
    setMobileDayIndex((prev) => (prev + 1) % weekDays.length);

  const currentDay = weekDays[mobileDayIndex % 7];

  return (
    <div className="relative w-full bg-gray-950 p-4 rounded-xl shadow-inner">
      {/* Header Controls */}
      <div className="flex flex-row justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-100">
          Weekly Anime Schedule
        </h2>

        {/* Simple Day Switcher */}
        {calendarView === "day" && (
          <div className="flex items-center w-32 justify-between bg-gray-800 px-1 py-1 rounded-lg">
            <button
              onClick={handlePrevDay}
              className="rounded-full hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5 text-gray-200" />
            </button>
            <span className="text-gray-100 font-medium mx-1 text-center">
              {currentDay}
            </span>
            <button
              onClick={handleNextDay}
              className="rounded-full hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5 text-gray-200" />
            </button>
          </div>
        )}
      </div>

      {/* ✅ Conditional Rendering */}
      {calendarView === "week" ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => (
            <MinimalDayView
              key={day}
              schedule={animeByDay[day] || []}
              day={day}
            />
          ))}
        </div>
      ) : (
        <MinimalDayView
          schedule={animeByDay[currentDay] || []}
          day={currentDay}
        />
      )}

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

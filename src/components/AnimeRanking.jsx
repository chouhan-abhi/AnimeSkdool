import React, { useEffect, useState } from "react";
import AnimeDetailsPanel from "./AnimeDetailsPanel";
import UpcomingAnimeList from "./UpcomingAnimeList";
import { useAnimeRanking } from "../queries/useAnimeRanking";
import PageLoader from "../helperComponent/PageLoader";
import { Menu, X } from "lucide-react";
import { RANKING_FILTER_CONFIG } from "../utils/constants";
import AnimeCard from "../helperComponent/AnimeCard";

const STORAGE_KEYS = {
  type: "animeType",
  filter: "animeFilter",
  rating: "animeRating",
  sfw: "animeSfw",
  page: "animePage",
};

const AnimeRanking = () => {
  // view toggle
  const [viewMode, setViewMode] = useState("upcoming"); // upcoming | ranking

  // filters persisted in localStorage
  const [type, setType] = useState(() => localStorage.getItem(STORAGE_KEYS.type) || "");
  const [filter, setFilter] = useState(() => localStorage.getItem(STORAGE_KEYS.filter) || "bypopularity");
  const [rating, setRating] = useState(() => localStorage.getItem(STORAGE_KEYS.rating) || "");
  const [sfw, setSfw] = useState(() => (localStorage.getItem(STORAGE_KEYS.sfw) === "false" ? false : true));
  const [page, setPage] = useState(() => parseInt(localStorage.getItem(STORAGE_KEYS.page) || "1", 10) || 1);

  // UI state
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // responsive listener
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // persist filters
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.type, type);
    localStorage.setItem(STORAGE_KEYS.filter, filter);
    localStorage.setItem(STORAGE_KEYS.rating, rating);
    localStorage.setItem(STORAGE_KEYS.sfw, String(sfw));
    localStorage.setItem(STORAGE_KEYS.page, String(page));
  }, [type, filter, rating, sfw, page]);

  // data
  const { data: rankingData, isLoading, error } =
    useAnimeRanking(viewMode === "ranking" ? { type, filter, rating, sfw, page } : undefined);

  const animeList = viewMode === "ranking" ? rankingData?.data || [] : [];
  const pagination = viewMode === "ranking" ? rankingData?.pagination || {} : {};

  const nextPage = () => pagination?.has_next_page && setPage((p) => p + 1);
  const prevPage = () => page > 1 && setPage((p) => p - 1);

  return (
    <div className="flex flex-col align-items-center min-h-screen">
      <div className="fixed right-0 z-50 flex justify-center items-center w-14 h-14 cursor-pointer p-1 rounded-full "
        style={{ backdropFilter: "blur(4px)", fontSize: "x-large" }}>
        {isMobile && viewMode === "ranking" && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="ml-auto px-3 py-1 rounded bg-[var(--secondary-color)]"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="flex justify-center gap-2 bg-[var(--bg-color)] rounded-full px-2 py-1 mt-2">
        <span className="rounded-full border border-gray-400">
          {["upcoming", "ranking"].map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setViewMode(mode);
                if (mode === "ranking") setPage(1);
              }}
              className={`px-4 py-1 rounded-full font-medium transition ${viewMode === mode
                ? "bg-[var(--primary-color)] text-[var(--bg-color)]"
                : "text-[var(--text-color)]"
                }`}
            >
              {mode === "upcoming" ? "Upcoming" : "Ranking"}
            </button>
          ))}
        </span>
      </div>
      <div className="flex text-[var(--text-color)] bg-[var(--bg-color)] relative">
        {!isMobile && viewMode === "ranking" && (
          <aside className="bg-[var(--secondary-color)] p-4 w-72 flex-shrink-0">
            <h2 className="text-lg font-semibold mb-3 text-[var(--primary-color)]">Filters</h2>
            {/* --- Filters content reused --- */}
            <Filters
              {...{ type, setType, filter, setFilter, rating, setRating, sfw, setSfw, page, nextPage, prevPage, pagination }}
            />
          </aside>
        )}

        {/* Mobile Sidebar Overlay (ranking only) */}
        {isMobile && viewMode === "ranking" && isSidebarOpen && (
          <>
            <aside className="fixed top-10 left-0 h-full w-full bg-[var(--bg-color)] p-4 z-51 shadow-lg">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-3 right-3 p-2 rounded bg-[var(--bg-color)]"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold mb-3 text-[var(--primary-color)]">Filters</h2>
              <Filters
                {...{ type, setType, filter, setFilter, rating, setRating, sfw, setSfw, page, nextPage, prevPage, pagination }}
                onDone={() => setIsSidebarOpen(false)}
              />
            </aside>
            <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setIsSidebarOpen(false)} />
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4">
          {viewMode === "upcoming" ? (
            <UpcomingAnimeList onSelectAnime={setSelectedAnime} />
          ) : isLoading ? (
            <PageLoader />
          ) : error ? (
            <p className="text-red-500">{error.message || String(error)}</p>
          ) : animeList.length === 0 ? (
            <p className="text-gray-400">No anime found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {animeList.map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
          )}
        </main>

        {/* Details Drawer */}
        {selectedAnime && (
          <AnimeDetailsPanel anime={selectedAnime} onClose={() => setSelectedAnime(null)} />
        )}
      </div>
    </div>
  );
};

// 🔹 Extracted Filters Component for reuse
const Filters = ({
  type,
  setType,
  filter,
  setFilter,
  rating,
  setRating,
  sfw,
  setSfw,
  page,
  nextPage,
  prevPage,
  pagination,
  onDone,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-sm mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            if (onDone) onDone();
          }}
          className="w-full p-2 rounded bg-[var(--bg-color)] border border-[var(--border-color)] text-sm"
        >
          {RANKING_FILTER_CONFIG.type.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Filter</label>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            if (onDone) onDone();
          }}
          className="w-full p-2 rounded bg-[var(--bg-color)] border border-[var(--border-color)] text-sm"
        >
          {RANKING_FILTER_CONFIG.filter.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Rating</label>
        <select
          value={rating}
          onChange={(e) => {
            setRating(e.target.value);
            if (onDone) onDone();
          }}
          className="w-full p-2 rounded bg-[var(--bg-color)] border border-[var(--border-color)] text-sm"
        >
          {RANKING_FILTER_CONFIG.rating.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => {
          setSfw((s) => !s);
          if (onDone) onDone();
        }}
        className={`w-full py-2 mt-2 rounded font-medium ${sfw
          ? "bg-[var(--accent-color)] text-[var(--bg-color)]"
          : "bg-transparent text-[var(--text-color)]"
          }`}
      >
        {sfw ? "SFW: ON" : "SFW: OFF"}
      </button>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => {
            prevPage();
            if (onDone) onDone();
          }}
          disabled={page === 1}
          className="py-1 px-3 rounded bg-[var(--bg-color)] disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          {page} / {pagination?.last_visible_page || 1}
        </span>
        <button
          onClick={() => {
            nextPage();
            if (onDone) onDone();
          }}
          disabled={!pagination?.has_next_page}
          className="py-1 px-3 rounded bg-[var(--bg-color)] disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AnimeRanking;

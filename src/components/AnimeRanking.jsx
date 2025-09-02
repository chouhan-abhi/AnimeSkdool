import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAnimeRanking } from "../queries/useAnimeRanking";
import AnimeDetailsPanel from "./AnimeDetailsPanel";
import AnimeDetailCard from "../helperComponent/AnimeDetailCard";
import PageLoader from "../helperComponent/PageLoader";
import { RANKING_FILTER_CONFIG } from "../utils/constants";
import { Menu, X } from "lucide-react";

const STORAGE_KEYS = {
  type: "animeType",
  filter: "animeFilter",
  rating: "animeRating",
  sfw: "animeSfw",
};

const AnimeRanking = () => {
  // filters
  const [type, setType] = useState(() => localStorage.getItem(STORAGE_KEYS.type) || "");
  const [filter, setFilter] = useState(() => localStorage.getItem(STORAGE_KEYS.filter) || "bypopularity");
  const [rating, setRating] = useState(() => localStorage.getItem(STORAGE_KEYS.rating) || "");
  const [sfw, setSfw] = useState(() => (localStorage.getItem(STORAGE_KEYS.sfw) === "false" ? false : true));
  const [page, setPage] = useState(1);

  // state
  const [animeList, setAnimeList] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(false);

  // infinite scroll observer
  const observerRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.type, type);
    localStorage.setItem(STORAGE_KEYS.filter, filter);
    localStorage.setItem(STORAGE_KEYS.rating, rating);
    localStorage.setItem(STORAGE_KEYS.sfw, String(sfw));
  }, [type, filter, rating, sfw]);

  // fetch hook
  const { data, isLoading, error } = useAnimeRanking({
    type,
    filter,
    rating,
    sfw,
    page,
  });

  const rankingData = data?.data || [];
  const pagination = data?.pagination || {};

  // append new data on page change
  useEffect(() => {
    if (rankingData.length) {
      setAnimeList((prev) => (page === 1 ? rankingData : [...prev, ...rankingData]));
    }
  }, [rankingData, page]);

  // reset on filter change
  useEffect(() => {
    setPage(1);
    setAnimeList([]);
  }, [type, filter, rating, sfw]);

  // observer callback
  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination?.has_next_page) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, pagination?.has_next_page]
  );

  return (
    <div className="flex h-full overflow-hidden relative">
      {/* Sidebar (overlay on mobile, fixed on desktop) */}
      <aside
        className={`bg-[var(--bg-color)] border-r w-64 flex-shrink-0 transform transition-transform duration-300 z-20 
          ${isMobile ? "fixed top-14 left-0 h-screen w-full" : "relative"} 
          ${isMobile ? (showSidebar ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        `}
      >
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <h2 className="text-lg font-semibold text-[var(--text-color)]">Filters</h2>
          {isMobile && (
            <button onClick={() => setShowSidebar(false)}>
              <X size={20} className="text-[var(--text-color)]" />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-4 p-4 overflow-y-auto h-[calc(100%-48px)]">
          {/* Type */}
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-[var(--bg-color)] text-[var(--text-color)]"
            >
              <option value="">All Types</option>
              <option value="tv">TV</option>
              <option value="movie">Movie</option>
              <option value="ova">OVA</option>
              <option value="special">Special</option>
            </select>
          </div>

          {/* Filter */}
          <div>
            <label className="block text-sm mb-1">Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-[var(--bg-color)] text-[var(--text-color)]"
            >
              {RANKING_FILTER_CONFIG.filter.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm mb-1">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-[var(--bg-color)] text-[var(--text-color)]"
            >
              <option value="">All Ratings</option>
              <option value="g">G - All Ages</option>
              <option value="pg">PG - Children</option>
              <option value="pg13">PG13 - Teens 13+</option>
              <option value="r17">R - 17+ (Violence & Profanity)</option>
              <option value="r">R+ - Mild Nudity</option>
              <option value="rx">Rx - Hentai</option>
            </select>
          </div>

          {/* SFW */}
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={sfw} onChange={() => setSfw((prev) => !prev)} />
            <span className="text-sm">SFW Only</span>
          </div>
        </div>
      </aside>

      {/* Sidebar backdrop on mobile */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 z-0">
        {isMobile && (
          <button onClick={() => setShowSidebar(true)} className="fixed top-14 right-2 p-2 mb-4">
            <Menu size={24} className="text-[var(--text-color)]" />
          </button>
        )}

        {isLoading && page === 1 ? (
          <PageLoader />
        ) : error ? (
          <p className="text-red-500">{error.message || String(error)}</p>
        ) : animeList.length === 0 ? (
          <p className="text-gray-400">No anime found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {animeList.map((anime, idx) => {
              if (animeList.length === idx + 1) {
                return (
                  <div ref={lastElementRef} key={anime.mal_id}>
                    <AnimeDetailCard anime={anime} onClick={() => setSelectedAnime(anime)} />
                  </div>
                );
              }
              return (
                <AnimeDetailCard
                  key={anime.mal_id}
                  anime={anime}
                  onClick={() => setSelectedAnime(anime)}
                />
              );
            })}
          </div>
        )}

        {isLoading && page > 1 && (
          <div className="flex justify-center mt-4">
            <PageLoader />
          </div>
        )}
      </main>

      {/* Anime Detail Panel */}
      {selectedAnime && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center ${
            isMobile ? "" : "backdrop-blur-sm"
          }`}
        >
          <div
            className={`bg-[var(--bg-color)] ${
              isMobile ? "w-full h-full" : "w-[600px] h-auto"
            } overflow-y-auto`}
          >
            <AnimeDetailsPanel anime={selectedAnime} onClose={() => setSelectedAnime(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimeRanking;

import React, { useEffect, useState, useMemo } from "react";
import AnimeCard from "../helperComponent/AnimeCard";
import PageLoader from "../helperComponent/PageLoader";
import { SlidersHorizontal } from "lucide-react";
import NoAnimeFound from "../helperComponent/NoAnimeFound";
import storageManager from "../utils/storageManager";

const globalFilters = ["all", "started", "bookmarked", "upcoming"];

const WatchlistPage = () => {
  const [filter, setFilter] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [watchlist, setWatchlist] = useState([]);
  const [starredList, setStarredList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768);
      }, 150);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  useEffect(() => {
    try {
      const savedWatchlist = storageManager.get(storageManager.keys.WATCHLIST_KEY, []);
      setWatchlist(savedWatchlist);

      const starredIds = storageManager.get(storageManager.keys.STARRED_KEY, []);
      const animeCache = storageManager.get(storageManager.keys.ANIME_CACHE_KEY, []);
      const animeCacheMap = new Map(animeCache.map((a) => [a.mal_id, a]));

      const starredAnime = starredIds
        .map((id) => animeCacheMap.get(id))
        .filter(Boolean)
        .map((anime) => ({ ...anime, starred: true }));

      setStarredList(starredAnime);
    } catch (err) {
      console.error("Failed to load lists", err);
      setWatchlist([]);
      setStarredList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredAnime = useMemo(() => {
    if (filter === "all") {
      const allMap = new Map();
      [...watchlist, ...starredList].forEach((anime) => allMap.set(anime.mal_id, anime));
      return Array.from(allMap.values());
    }
    if (filter === "started") return starredList;
    if (filter === "bookmarked") return watchlist.filter((a) => a.isBookmarked);
    if (filter === "upcoming")
      return watchlist.filter((a) => a.status?.toLowerCase() === "not yet aired");
    return watchlist;
  }, [watchlist, starredList, filter]);

  // ✅ Group anime by month/year or fallback to "Unknown"
  const groupedAnime = useMemo(() => {
    const groups = {};
    filteredAnime.forEach((anime) => {
      let dateStr = anime.aired?.from || anime.aired?.prop?.from?.string || null;
      let key = "Unknown";
      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date)) {
          const month = date.toLocaleString("default", { month: "long" });
          const year = date.getFullYear();
          key = `${month} ${year}`;
        }
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(anime);
    });

    // Sort groups by date descending
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      const da = new Date(a);
      const db = new Date(b);
      return db - da;
    });

    return { groups, sortedKeys };
  }, [filteredAnime]);

  return (
    <div className="flex h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans">
      {/* Sidebar */}
      {(isSidebarOpen || !isMobile) && (
        <aside
          className={`bg-[var(--bg-color)] p-4 flex-shrink-0 rounded-r-xl transition-all text-[var(--primary-color)] ${
            isMobile
              ? "fixed top-0 left-0 h-full w-full z-50 shadow-lg"
              : "h-48 w-48"
          }`}
        >
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 text-xl font-bold"
            >
              ✕
            </button>
          )}
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <ul className="flex flex-col gap-2">
            {globalFilters.map((f) => (
              <li key={f}>
                <button
                  onClick={() => {
                    setFilter(f);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded transition text-md ${
                    filter === f
                      ? "bg-[var(--primary-color)] text-white"
                      : "hover:shadow-md"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col h-full">
        <header className="flex items-center justify-between p-4 shadow-md">
          <h1 className="text-2xl font-bold">Watchlist</h1>
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="bg-[var(--primary-color)] p-[6px] rounded-full text-white text-xl shadow-md hover:opacity-90 transition"
            >
              <SlidersHorizontal size={18} />
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-10">
          {loading ? (
            <div className="text-center py-10">
              <PageLoader />
            </div>
          ) : groupedAnime.sortedKeys.length > 0 ? (
            groupedAnime.sortedKeys.map((groupKey) => (
              <section key={groupKey} className="space-y-3">
                <h2 className="text-lg font-semibold text-[var(--primary-color)] border-b pb-2">
                  {groupKey}
                </h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                  {groupedAnime.groups[groupKey].map((anime) => (
                    <AnimeCard key={anime.mal_id} anime={anime} showStatusBadge />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <NoAnimeFound />
          )}
        </main>
      </div>
    </div>
  );
};

export default WatchlistPage;

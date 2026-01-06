import React, { useEffect, useState, useMemo } from "react";
import AnimeCard from "../helperComponent/AnimeCard";
import PageLoader from "../helperComponent/PageLoader";
import { SlidersHorizontal } from "lucide-react";
import NoAnimeFound from "../helperComponent/NoAnimeFound";
import storageManager from "../utils/storageManager";

const FILTERS = ["all", "started", "bookmarked", "upcoming"];

const WatchlistPage = () => {
  const [filter, setFilter] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [watchlist, setWatchlist] = useState([]);
  const [startedList, setStartedList] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- Responsive ---------------- */
  useEffect(() => {
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768);
      }, 150);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, []);

  /* ---------------- Load data ---------------- */
  useEffect(() => {
    try {
      setLoading(true);

      const wl = storageManager.get(
        storageManager.keys.WATCHLIST_KEY,
        []
      );

      const started = storageManager.get(
        storageManager.keys.STARTED_KEY,
        []
      );

      setWatchlist(wl);
      setStartedList(started);
    } catch (e) {
      console.error(e);
      setWatchlist([]);
      setStartedList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- Filter logic ---------------- */
  const filteredAnime = useMemo(() => {
    switch (filter) {
      case "started":
        return startedList;

      case "bookmarked":
        return watchlist.filter((a) => a.isBookmarked);

      case "upcoming":
        return watchlist.filter(
          (a) => a.status?.toLowerCase() === "not yet aired"
        );

      case "all":
      default: {
        const map = new Map();
        [...startedList, ...watchlist].forEach((a) =>
          map.set(a.mal_id, a)
        );
        return Array.from(map.values());
      }
    }
  }, [filter, watchlist, startedList]);

  /* ---------------- Group by month/year ---------------- */
  const groupedAnime = useMemo(() => {
    const groups = {};

    filteredAnime.forEach((anime) => {
      const dateStr =
        anime.startedAt ||
        anime.aired?.from ||
        anime.aired?.prop?.from?.string;

      let key = "Unknown";

      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d)) {
          const month = d.toLocaleString("default", {
            month: "long",
          });
          key = `${month} ${d.getFullYear()}`;
        }
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(anime);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      return new Date(b) - new Date(a);
    });

    return { groups, sortedKeys };
  }, [filteredAnime]);

  /* ================= UI ================= */
  return (
    <div className="flex h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      {/* ---------- Sidebar ---------- */}
      {(isSidebarOpen || !isMobile) && (
        <aside
          className={`bg-[var(--panel-bg)] p-4 flex-shrink-0
          ${isMobile ? "fixed inset-0 z-50" : "w-56"}`}
        >
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 text-xl"
            >
              ✕
            </button>
          )}

          <h2 className="text-lg font-semibold mb-4">Browse</h2>

          <ul className="space-y-2">
            {FILTERS.map((f) => (
              <li key={f}>
                <button
                  onClick={() => {
                    setFilter(f);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={`w-full px-4 py-2 rounded-lg text-left transition
                    ${filter === f
                      ? "bg-[var(--primary-color)] text-white"
                      : "hover:bg-white/5"
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
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ---------- Main ---------- */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-bold">Your Watchlist</h1>
            <p className="text-sm text-gray-400 capitalize">
              {filter} anime
            </p>
          </div>

          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="bg-[var(--primary-color)] p-2 rounded-full"
            >
              <SlidersHorizontal size={18} />
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8">
          {loading ? (
            <PageLoader />
          ) : groupedAnime.sortedKeys.length ? (
            <div className="max-w-7xl">
              {groupedAnime.sortedKeys.map((key) => {
                const items = groupedAnime.groups[key];

                return (
                  <section
                    key={key}
                    className="
                      rounded-2xl p-6
                      bg-white/[0.02]
                      shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_12px_40px_-20px_var(--primary-color)]
                    "
                  >
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-5">
                      <h2 className="text-lg font-semibold text-[var(--primary-color)]">
                        {key}
                      </h2>

                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                        {items.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {items.map((anime) => (
                        <AnimeCard
                          key={anime.mal_id}
                          anime={anime}
                          compact
                          showStatusBadge
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

            </div>
          ) : (
            <NoAnimeFound />
          )}
        </main>
      </div>
    </div>
  );
};

export default WatchlistPage;

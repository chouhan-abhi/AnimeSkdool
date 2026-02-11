import React, { useEffect, useState, useMemo } from "react";
import AnimeCard from "../helperComponent/AnimeCard";
import PageLoader from "../helperComponent/PageLoader";
import NoAnimeFound from "../helperComponent/NoAnimeFound";
import storageManager from "../utils/storageManager";
import GlassCard from "./ui/GlassCard";
import SectionHeader from "./ui/SectionHeader";
import Pill from "./ui/Pill";

const FILTERS = ["all", "started", "bookmarked", "upcoming"];

const WatchlistPage = () => {
  const [filter, setFilter] = useState("all");
  const [watchlist, setWatchlist] = useState([]);
  const [startedList, setStartedList] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="pt-6 pb-4">
        <SectionHeader title="Your Watchlist" subtitle="Manage all your saved anime in one place." />
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                filter === f
                  ? "bg-[var(--primary-color)] text-white shadow-[0_0_14px_var(--glow-color)]"
                  : "bg-white/5 text-white/70 hover:text-white"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <Pill className="ml-auto bg-white/10 text-white/70">
            {filteredAnime.length} items
          </Pill>
        </div>
      </GlassCard>

      <main className="mt-6 pb-20">
        {loading ? (
          <PageLoader />
        ) : groupedAnime.sortedKeys.length ? (
          <div className="space-y-8">
            {groupedAnime.sortedKeys.map((key) => {
              const items = groupedAnime.groups[key];

              return (
                <GlassCard key={key} className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-lg font-semibold text-[var(--primary-color)]">
                      {key}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                      {items.length}
                    </span>
                  </div>

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
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <NoAnimeFound />
        )}
      </main>
    </div>
  );
};

export default WatchlistPage;

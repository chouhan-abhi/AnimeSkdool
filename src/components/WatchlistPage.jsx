import React, { useEffect, useState, useMemo, useCallback, useRef, lazy, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock3, Trash2 } from "lucide-react";
import PageLoader, { DetailsPanelLoader } from "../helperComponent/PageLoader";
import NoAnimeFound from "../helperComponent/NoAnimeFound";
import storageManager from "../utils/storageManager";
import { useToast } from "../utils/toast";
import GlassCard from "./ui/GlassCard";
import SectionHeader from "./ui/SectionHeader";
import Pill from "./ui/Pill";

const AnimeDetailsPanel = lazy(() => import("./AnimeDetailsPanel"));

const FILTERS = [
  { key: "all", label: "All" },
  { key: "saved", label: "In Watchlist" },
  { key: "started", label: "Started" },
  { key: "upcoming", label: "Upcoming" },
];

const WatchlistPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [filter, setFilter] = useState("all");
  const [watchlist, setWatchlist] = useState([]);
  const [startedList, setStartedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const sectionRefs = useRef({});

  /* ---------------- Load data ---------------- */
  useEffect(() => {
    try {
      setLoading(true);

      const wl = storageManager.get(storageManager.keys.WATCHLIST_KEY, []);
      const started = storageManager.getStartedList();

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
      case "saved":
        return watchlist;
      case "started":
        return startedList;
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

  const watchlistIdSet = useMemo(
    () => new Set(watchlist.map((a) => String(a.mal_id))),
    [watchlist]
  );
  const startedIdSet = useMemo(
    () => new Set(startedList.map((a) => String(a.mal_id))),
    [startedList]
  );

  const stats = useMemo(() => {
    const upcoming = watchlist.filter(
      (a) => a.status?.toLowerCase() === "not yet aired"
    ).length;
    return {
      total: watchlist.length,
      started: startedList.length,
      upcoming,
    };
  }, [watchlist, startedList]);

  const handleRemoveFromCollection = useCallback(
    (anime) => {
      if (!anime?.mal_id) return;
      const targetId = String(anime.mal_id);
      let removedFromWatchlist = false;
      let removedFromStarted = false;

      if (watchlistIdSet.has(targetId)) {
        storageManager.removeFromWatchlist(anime.mal_id);
        setWatchlist((prev) => prev.filter((item) => String(item.mal_id) !== targetId));
        removedFromWatchlist = true;
      }

      if (startedIdSet.has(targetId)) {
        storageManager.removeFromStarted(anime.mal_id);
        setStartedList((prev) => prev.filter((item) => String(item.mal_id) !== targetId));
        removedFromStarted = true;
      }

      if (removedFromWatchlist) {
        queryClient.invalidateQueries({ queryKey: ["watchlistAnime"] });
      }

      if (removedFromWatchlist || removedFromStarted) {
        showToast?.(`${anime.title || "Anime"} removed`, "info");
      }
    },
    [queryClient, showToast, watchlistIdSet, startedIdSet]
  );

  const getImage = (anime) =>
    anime?.images?.webp?.large_image_url ||
    anime?.images?.jpg?.large_image_url ||
    anime?.images?.webp?.image_url ||
    anime?.images?.jpg?.image_url ||
    anime?.images?.webp?.small_image_url ||
    anime?.images?.jpg?.small_image_url ||
    "";

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

  useEffect(() => {
    if (groupedAnime.sortedKeys.length > 0 && !activeSection) {
      setActiveSection(groupedAnime.sortedKeys[0]);
    }
    if (
      activeSection &&
      groupedAnime.sortedKeys.length > 0 &&
      !groupedAnime.sortedKeys.includes(activeSection)
    ) {
      setActiveSection(groupedAnime.sortedKeys[0]);
    }
  }, [groupedAnime.sortedKeys, activeSection]);

  const scrollToSection = useCallback((key) => {
    const target = sectionRefs.current[key];
    if (!target) return;
    setActiveSection(key);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 pb-20">
      <div className="pt-6 pb-4">
        <SectionHeader title="Your Watchlist" subtitle="Manage all your saved anime in one place." />
      </div>

      <GlassCard className="p-4 sm:p-5 bg-[radial-gradient(900px_500px_at_0%_0%,rgba(255,179,71,0.16),transparent_40%),radial-gradient(1000px_500px_at_100%_0%,rgba(59,130,246,0.10),transparent_45%),var(--surface-1)]">
        <div className="flex flex-wrap items-center gap-3">
          <Pill className="bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/35">
            Collection
          </Pill>
          <span className="text-xs text-[var(--text-muted)]">
            Keep your picks organized and remove anytime
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-[var(--border-color)] bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Saved</p>
            <p className="mt-1 text-xl font-bold text-[var(--text-color)]">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-[var(--border-color)] bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Started</p>
            <p className="mt-1 text-xl font-bold text-[var(--text-color)]">{stats.started}</p>
          </div>
          <div className="rounded-xl border border-[var(--border-color)] bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Upcoming</p>
            <p className="mt-1 text-xl font-bold text-[var(--text-color)]">{stats.upcoming}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                filter === f.key
                  ? "bg-[var(--primary-color)] text-white shadow-[0_0_14px_var(--glow-color)]"
                  : "bg-white/5 text-[var(--text-color)]/70 hover:text-[var(--text-color)]"
              }`}
            >
              {f.label}
            </button>
          ))}
          <Pill className="ml-auto bg-white/10 text-[var(--text-color)]/75">
            {filteredAnime.length} items
          </Pill>
        </div>
      </GlassCard>

      <main className="mt-6">
        {!loading && groupedAnime.sortedKeys.length > 0 && (
          <div className="sticky top-[calc(var(--nav-height)+8px)] z-20 mb-4">
            <GlassCard className="p-2 bg-[var(--panel-bg)]/90 backdrop-blur">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <Pill className="bg-white/10 text-[var(--text-color)]/70 flex-shrink-0">
                  Jump to
                </Pill>
                {groupedAnime.sortedKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => scrollToSection(key)}
                    className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      activeSection === key
                        ? "bg-[var(--primary-color)] text-white shadow-[0_0_14px_var(--glow-color)]"
                        : "bg-white/5 text-[var(--text-color)]/70 hover:text-[var(--text-color)]"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {loading ? (
          <PageLoader />
        ) : groupedAnime.sortedKeys.length ? (
          <div className="space-y-8">
            {groupedAnime.sortedKeys.map((key) => {
              const items = groupedAnime.groups[key];

              return (
                <div
                  key={key}
                  className="scroll-mt-40"
                  ref={(el) => {
                    sectionRefs.current[key] = el;
                  }}
                >
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <h2 className="text-lg font-semibold text-[var(--primary-color)]">
                        {key}
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                        {items.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {items.map((anime) => (
                        <div
                          key={anime.mal_id}
                          onClick={() => setSelectedAnime(anime)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedAnime(anime);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          className="group relative aspect-[2/3] overflow-hidden rounded-2xl border border-[var(--border-color)] bg-white/5 text-left shadow-[0_18px_60px_-40px_var(--shadow-color)] transition hover:scale-[1.015] hover:border-[var(--primary-color)]/40"
                        >
                          <img
                            src={getImage(anime)}
                            alt={anime.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                          <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">
                              <Clock3 size={10} />
                              {anime.duration?.match(/\d+/)?.[0] || "24"}m
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromCollection(anime);
                              }}
                              className="z-20 inline-flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-1 text-[10px] font-semibold text-white hover:bg-red-500"
                              aria-label={`Delete ${anime.title}`}
                              title="Delete"
                            >
                              <Trash2 size={10} />
                              Delete
                            </button>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 p-3">
                            <p className="text-sm font-semibold text-white line-clamp-2">
                              {anime.title_english || anime.title}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-white/75">
                              <CalendarDays size={10} />
                              <span className="truncate">
                                {anime.status || "Status unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        ) : (
          <NoAnimeFound />
        )}
      </main>

      {selectedAnime && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/90 z-[9999] flex">
              <div className="hidden md:block md:flex-1 bg-gray-900" />
              <div className="flex-1 p-6 text-white">
                <DetailsPanelLoader />
              </div>
            </div>
          }
        >
          <AnimeDetailsPanel
            anime={selectedAnime}
            onClose={() => setSelectedAnime(null)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default WatchlistPage;

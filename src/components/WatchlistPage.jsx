import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Trash2,
  Play,
  Plus,
  Film,
  CheckCircle2,
  Clock,
  Check,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import PageLoader from "../helperComponent/PageLoader";
import storageManager from "../utils/storageManager";
import { useToast } from "../utils/toast";
import SectionHeader from "./ui/SectionHeader";

const FILTERS = [
  { key: "all", label: "All Shows" },
  { key: "watching", label: "Currently Watching" },
  { key: "plan_to_watch", label: "Plan to Watch" },
  { key: "completed", label: "Completed" },
];

const WatchlistPage = ({ onSelectAnime }) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [filter, setFilter] = useState("all");
  const [watchlist, setWatchlist] = useState([]);
  const [startedList, setStartedList] = useState([]);
  const [progressMap, setProgressMap] = useState(() => storageManager.getProgressMap());
  const [loading, setLoading] = useState(true);

  /* ---------------- Load data ---------------- */
  useEffect(() => {
    try {
      setLoading(true);
      const wl = storageManager.get(storageManager.keys.WATCHLIST_KEY, []);
      const started = storageManager.getStartedList();
      const prog = storageManager.getProgressMap();
      setWatchlist(wl);
      setStartedList(started);
      setProgressMap(prog);
    } catch {
      setWatchlist([]);
      setStartedList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync combined list
  const combinedList = useMemo(() => {
    const map = new Map();
    [...startedList, ...watchlist].forEach((a) => map.set(a.mal_id, a));
    return Array.from(map.values());
  }, [watchlist, startedList]);

  /* ---------------- Filter logic with Progress ---------------- */
  const filteredAnime = useMemo(() => {
    return combinedList.filter((anime) => {
      const prog = progressMap[anime.mal_id] || { episode: 0, status: "plan_to_watch" };
      if (filter === "watching") {
        return prog.status === "watching" || (prog.episode > 0 && prog.status !== "completed");
      }
      if (filter === "completed") {
        return prog.status === "completed";
      }
      if (filter === "plan_to_watch") {
        return prog.status === "plan_to_watch" && prog.episode === 0;
      }
      return true;
    });
  }, [filter, combinedList, progressMap]);

  /* ---------------- Metrics ---------------- */
  const stats = useMemo(() => {
    let totalWatchedEps = 0;
    let completedCount = 0;
    let watchingCount = 0;

    combinedList.forEach((anime) => {
      const prog = progressMap[anime.mal_id] || { episode: 0, status: "plan_to_watch" };
      totalWatchedEps += prog.episode || 0;
      if (prog.status === "completed") completedCount++;
      else if (prog.episode > 0 || prog.status === "watching") watchingCount++;
    });

    return {
      total: combinedList.length,
      watching: watchingCount,
      completed: completedCount,
      totalWatchedEps,
    };
  }, [combinedList, progressMap]);

  /* ---------------- Quick Progress Increment ---------------- */
  const handleIncrement = useCallback(
    (e, anime) => {
      e.stopPropagation();
      const current = progressMap[anime.mal_id] || { episode: 0, status: "watching" };
      const nextEp = current.episode + 1;
      const total = anime.episodes || null;
      const isCompleted = total ? nextEp >= total : false;

      const newProg = {
        episode: total ? Math.min(nextEp, total) : nextEp,
        status: isCompleted ? "completed" : "watching",
      };

      storageManager.setAnimeProgress(anime.mal_id, newProg);
      setProgressMap((prev) => ({ ...prev, [anime.mal_id]: newProg }));

      if (isCompleted) {
        showToast?.(`🎉 Completed ${anime.title}!`, "success");
      } else {
        showToast?.(`Updated to Episode ${newProg.episode} of ${anime.title}`, "success");
      }
    },
    [progressMap, showToast]
  );

  /* ---------------- Direct Stream Launcher ---------------- */
  const handleStreamClick = useCallback((e, anime) => {
    e.stopPropagation();
    const cleanTitle = (anime.title_english || anime.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const prog = storageManager.getAnimeProgress(anime.mal_id);
    const nextEp = (prog.episode || 0) + 1;
    window.open(`https://9anime.org.lv/${cleanTitle}-episode-${nextEp}/`, "_blank");
  }, []);

  const handleRemove = useCallback(
    (e, anime) => {
      e.stopPropagation();
      storageManager.removeFromWatchlist(anime.mal_id);
      storageManager.removeFromStarted(anime.mal_id);
      setWatchlist((prev) => prev.filter((a) => a.mal_id !== anime.mal_id));
      setStartedList((prev) => prev.filter((a) => a.mal_id !== anime.mal_id));
      queryClient.invalidateQueries({ queryKey: ["watchlistAnime"] });
      showToast?.("Removed from library", "info");
    },
    [queryClient, showToast]
  );

  const getImage = (anime) =>
    anime?.images?.webp?.large_image_url ||
    anime?.images?.jpg?.large_image_url ||
    anime?.images?.webp?.image_url ||
    anime?.images?.jpg?.image_url ||
    "";

  return (
    <div className="min-h-screen px-6 sm:px-10 md:px-14 lg:px-18 max-w-[1800px] mx-auto pb-24 text-white">
      {/* Header */}
      <div className="pt-8 pb-6">
        <SectionHeader
          title="Up Next & Episode Tracker"
          subtitle="Manage your anime library, track episode progress, and launch streams instantly"
          badge="Library & Tracker"
        />
      </div>

      {/* Apple TV Stats Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl">
          <p className="text-xs uppercase font-bold tracking-wider text-white/50">Total in Library</p>
          <p className="mt-2 text-3xl font-black text-white tracking-tight">{stats.total}</p>
          <p className="text-xs text-white/40 mt-1">Saved shows & series</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl">
          <p className="text-xs uppercase font-bold tracking-wider text-[var(--primary-color)]">Watching</p>
          <p className="mt-2 text-3xl font-black text-white tracking-tight">{stats.watching}</p>
          <p className="text-xs text-white/40 mt-1">Shows currently in progress</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl">
          <p className="text-xs uppercase font-bold tracking-wider text-green-400">Completed</p>
          <p className="mt-2 text-3xl font-black text-white tracking-tight">{stats.completed}</p>
          <p className="text-xs text-white/40 mt-1">Finished full anime series</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl">
          <p className="text-xs uppercase font-bold tracking-wider text-yellow-400">Episodes Watched</p>
          <p className="mt-2 text-3xl font-black text-white tracking-tight">{stats.totalWatchedEps}</p>
          <p className="text-xs text-white/40 mt-1">Total logged anime episodes</p>
        </div>
      </div>

      {/* Segmented Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 rounded-full bg-white/[0.06] backdrop-blur-2xl border border-white/10 max-w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
              filter === f.key
                ? "bg-white text-black shadow-md scale-[1.02]"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Library Grid */}
      <main>
        {loading ? (
          <PageLoader />
        ) : filteredAnime.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAnime.map((anime) => {
              const prog = progressMap[anime.mal_id] || { episode: 0, status: "plan_to_watch" };
              const currentEp = prog.episode || 0;
              const totalEps = anime.episodes || null;
              const percent = totalEps ? Math.min(100, Math.round((currentEp / totalEps) * 100)) : 0;
              const isCompleted = prog.status === "completed" || (totalEps && currentEp >= totalEps);

              return (
                <div
                  key={anime.mal_id}
                  onClick={() => onSelectAnime?.(anime)}
                  className="group relative rounded-3xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/25 backdrop-blur-2xl p-4 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_-5px_var(--glow-color)] hover:scale-[1.02] cursor-pointer select-none flex flex-col justify-between"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSelectAnime?.(anime);
                  }}
                >
                  <div className="specular-highlight opacity-30 group-hover:opacity-100 transition-opacity" />

                  <div>
                    {/* Top Row: Thumbnail + Info */}
                    <div className="flex gap-4">
                      <div className="relative w-24 sm:w-28 aspect-[2/3] rounded-2xl overflow-hidden bg-black/50 flex-shrink-0 border border-white/10">
                        <img
                          src={getImage(anime)}
                          alt={anime.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="rounded-full bg-white text-black p-2 shadow-lg">
                            <Play size={14} className="fill-black translate-x-0.5" />
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isCompleted
                                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                  : currentEp > 0
                                  ? "bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/30"
                                  : "bg-white/10 text-white/70 border border-white/10"
                              }`}
                            >
                              {isCompleted ? "Completed" : currentEp > 0 ? "Watching" : "Plan to Watch"}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => handleRemove(e, anime)}
                              className="p-1 rounded-full text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
                              title="Remove from library"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <h3 className="text-sm font-bold text-white truncate leading-tight group-hover:text-[var(--primary-color)] transition-colors">
                            {anime.title_english || anime.title}
                          </h3>
                          <p className="text-[11px] text-white/50 truncate mt-0.5">
                            {anime.genres?.slice(0, 2).map((g) => g.name).join(" · ") || "Anime"}
                          </p>
                        </div>

                        {/* Stream Launcher */}
                        <button
                          type="button"
                          onClick={(e) => handleStreamClick(e, anime)}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-xs font-semibold transition-all max-w-fit shadow-sm"
                        >
                          <Play size={11} className="fill-current" />
                          <span>Stream Ep {currentEp + 1}</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Counter */}
                    <div className="mt-4 pt-3 border-t border-white/[0.08]">
                      <div className="flex items-center justify-between text-xs font-semibold text-white/80 mb-1.5">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-white/40" />
                          <span>Episode {currentEp}</span>
                          <span className="text-white/40 font-normal">
                            {totalEps ? `of ${totalEps}` : "watched"}
                          </span>
                        </span>
                        {totalEps && (
                          <span className="text-[11px] text-white/50">{percent}%</span>
                        )}
                      </div>

                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? "bg-green-400" : "bg-[var(--primary-color)]"
                          }`}
                          style={{ width: `${totalEps ? percent : currentEp > 0 ? 50 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action: +1 Episode Button */}
                  <div className="mt-4 pt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleIncrement(e, anime)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-white/[0.08] hover:bg-white hover:text-black border border-white/15 text-xs font-bold text-white transition-all active:scale-95 shadow-sm"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>+1 Watched Episode</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 rounded-3xl bg-white/[0.03] border border-white/10 text-center max-w-lg mx-auto">
            <Film size={48} className="text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No Shows Found</h3>
            <p className="text-xs text-white/50 mb-6">
              There are no anime items matching the "{filter.replace(/_/g, " ")}" filter.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WatchlistPage;

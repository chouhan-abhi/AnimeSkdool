import React, { useMemo, useState } from "react";
import { Calendar, Clock, ArrowRight, Star, Play, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { jikanFetch } from "../../utils/jikanClient";
import GlassCard from "../ui/GlassCard";
import Pill from "../ui/Pill";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const dayFilters = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const getDurationMinutes = (duration) => {
  if (!duration) return null;
  const match = String(duration).match(/(\d+)\s*min/i);
  return match ? Number.parseInt(match[1], 10) : null;
};

const fetchScheduleByDay = async ({ day, signal }) => {
  const params = new URLSearchParams();
  params.set("filter", day);
  params.set("sfw", "true");
  const json = await jikanFetch(`/schedules?${params}`, { signal });
  return json?.data || [];
};

const DailyScheduleStrip = ({ onNavigate, onSelectAnime }) => {
  const [mode, setMode] = useState("today");

  const targetIndex = useMemo(() => {
    const todayIndex = new Date().getDay();
    return mode === "today" ? todayIndex : (todayIndex + 1) % 7;
  }, [mode]);

  const targetDay = dayNames[targetIndex];
  const targetFilter = dayFilters[targetIndex];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dailySchedule", targetFilter],
    queryFn: ({ signal }) => fetchScheduleByDay({ day: targetFilter, signal }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const items = useMemo(() => {
    const list = data || [];
    return list
      .filter((anime) => {
        const mins = getDurationMinutes(anime.duration);
        return mins != null && mins > 16;
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [data]);

  const visible = items.slice(0, 8);

  return (
    <GlassCard className="relative overflow-hidden border-white/[0.1] bg-gradient-to-r from-[#121422]/90 via-[#0e101c]/80 to-[#14101e]/90 p-6 sm:p-7">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[var(--primary-color)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-purple-600/15 blur-3xl" />

      {/* Header & Segmented Controls */}
      <div className="relative flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15 text-[11px] font-bold tracking-wider uppercase backdrop-blur-md">
              Airing Radar
            </span>
            <span className="text-xs text-[var(--text-dim)] font-medium">· TV Broadcast Guide</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Premiering {mode === "today" ? "Today" : "Tomorrow"} ({targetDay})
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Apple TV Segmented Switcher */}
          <div className="flex items-center p-1 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/10">
            <button
              type="button"
              onClick={() => setMode("today")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                mode === "today"
                  ? "bg-white text-black shadow-md scale-[1.02]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setMode("tomorrow")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                mode === "tomorrow"
                  ? "bg-white text-black shadow-md scale-[1.02]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Tomorrow
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigate?.("calendar")}
            className="flex items-center gap-1 text-xs font-semibold text-white/80 hover:text-white px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 transition-all"
          >
            <span>Full Schedule</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Cards Strip */}
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[200px] flex-1 rounded-xl bg-white/[0.05] h-28 animate-shimmer" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-white/60 py-6 text-center">Could not load broadcast radar.</p>
      ) : visible.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin snap-row">
          {visible.map((anime) => {
            const time = anime.broadcast?.time || "TBD";
            const img = anime.images?.webp?.image_url || anime.images?.jpg?.image_url;

            return (
              <div
                key={anime.mal_id}
                onClick={() => onSelectAnime?.(anime)}
                className="min-w-[240px] sm:min-w-[270px] flex-shrink-0 flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] hover:border-white/20 transition-all duration-200 cursor-pointer group shadow-sm hover:scale-[1.02]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelectAnime?.(anime);
                }}
              >
                {/* Thumbnail */}
                <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/10">
                  {img && (
                    <img
                      src={img}
                      alt={anime.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={16} className="text-white fill-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--primary-color)] mb-1">
                    <Clock size={11} />
                    <span>{time} JST</span>
                    {anime.score && (
                      <span className="ml-auto flex items-center gap-0.5 text-yellow-400">
                        <Star size={9} fill="currentColor" />
                        {anime.score}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white truncate leading-snug group-hover:text-[var(--primary-color)] transition-colors">
                    {anime.title}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                    {anime.genres?.[0]?.name || "Series"} · {anime.episodes ? `${anime.episodes} eps` : "Airing"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-white/60 py-6 text-center">No major broadcasts scheduled.</p>
      )}
    </GlassCard>
  );
};

export default DailyScheduleStrip;

import React, { useMemo, useState } from "react";
import { Calendar, Clock, Star, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import GlassCard from "../ui/GlassCard";

const dayNames = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const dayFilters = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
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
  const res = await fetch(`https://api.jikan.moe/v4/schedules?${params}`, { signal });
  if (!res.ok) throw new Error("Failed to fetch schedule");
  const json = await res.json();
  return json?.data || [];
};

const ScheduleCardSkeleton = () => (
  <div className="w-[280px] flex-shrink-0 rounded-xl border border-[var(--border-color)] bg-[var(--surface-1)]/40 p-3.5 animate-shimmer">
    <div className="flex items-center gap-3">
      <div className="h-18 w-14 rounded-lg bg-white/8" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-20 rounded bg-white/8" />
        <div className="h-4 w-32 rounded bg-white/8" />
        <div className="h-3 w-24 rounded bg-white/8" />
      </div>
    </div>
  </div>
);

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
    <GlassCard className="p-5" hover>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-[var(--primary-color)]/15 text-[var(--primary-color)]">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-color)]">Daily Release Schedule</h3>
            <p className="text-xs text-[var(--text-muted)]">
              {targetDay}&apos;s top picks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {["today", "tomorrow"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                mode === m
                  ? "bg-[var(--primary-color)] text-white shadow-[0_2px_12px_-2px_var(--glow-color)]"
                  : "bg-[var(--surface-1)]/80 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)]"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onNavigate?.("calendar")}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--primary-color)] hover:opacity-80 transition-opacity ml-1"
          >
            Full Calendar
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-row">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <ScheduleCardSkeleton key={i} />)
        }

        {!isLoading && isError && (
          <div className="flex items-center justify-center py-8 w-full text-sm text-[var(--text-muted)]">
            Could not load schedule. Try again later.
          </div>
        )}

        {!isLoading && !isError && visible.length === 0 && (
          <div className="flex items-center justify-center py-8 w-full text-sm text-[var(--text-muted)]">
            No releases found for {targetDay}.
          </div>
        )}

        {!isLoading &&
          !isError &&
          visible.map((anime) => (
            <button
              key={anime.mal_id}
              type="button"
              onClick={() => onSelectAnime?.(anime)}
              className="w-[280px] flex-shrink-0 rounded-xl border border-[var(--border-color)] bg-[var(--surface-1)]/30 p-3.5 text-left transition-all duration-200 hover:bg-[var(--surface-1)]/60 hover:border-[var(--primary-color)]/20 hover:shadow-[0_8px_24px_-8px_var(--glow-color)] group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={
                      anime.images?.webp?.image_url ||
                      anime.images?.jpg?.image_url
                    }
                    alt={anime.title}
                    className="h-[72px] w-[52px] rounded-lg object-cover ring-1 ring-[var(--border-color)] group-hover:ring-[var(--primary-color)]/30 transition-all"
                    loading="lazy"
                  />
                  {anime.score && (
                    <span className="absolute -bottom-1 -right-1 flex items-center gap-0.5 bg-black/70 text-yellow-400 text-[9px] font-bold px-1 py-0.5 rounded glass">
                      <Star size={8} fill="currentColor" />
                      {anime.score}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-block text-[9px] uppercase font-bold tracking-wider text-[var(--primary-color)] bg-[var(--primary-color)]/10 px-1.5 py-0.5 rounded mb-1">
                    {anime.type || "TV"}
                  </span>
                  <p className="text-sm font-semibold text-[var(--text-color)] truncate group-hover:text-[var(--primary-color)] transition-colors">
                    {anime.title}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {anime.broadcast?.time || "TBA"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {anime.broadcast?.day || targetDay}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
      </div>
    </GlassCard>
  );
};

export default DailyScheduleStrip;

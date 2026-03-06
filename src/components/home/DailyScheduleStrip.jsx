import React, { useMemo, useState } from "react";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
  const res = await fetch(`https://api.jikan.moe/v4/schedules?${params}`, { signal });
  if (!res.ok) throw new Error("Failed to fetch schedule");
  const json = await res.json();
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
    <GlassCard className="relative overflow-hidden border-[var(--primary-color)]/40 bg-[radial-gradient(900px_500px_at_0%_0%,rgba(255,179,71,0.18),transparent_40%),radial-gradient(1000px_500px_at_100%_0%,rgba(59,130,246,0.12),transparent_50%),var(--surface-1)] p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[var(--primary-color)]/15 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <Pill className="mb-2 bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/30">
            Daily Airing Radar
          </Pill>
          <h3 className="text-lg sm:text-xl font-bold text-[var(--text-color)] tracking-tight">
            Daily Release Schedule
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Spotlight picks for {targetDay}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-[var(--border-color)] bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setMode("today")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                mode === "today"
                  ? "bg-[var(--primary-color)] text-white shadow-[0_0_16px_var(--glow-color)]"
                  : "text-[var(--text-color)]/70 hover:text-[var(--text-color)]"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setMode("tomorrow")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                mode === "tomorrow"
                  ? "bg-[var(--primary-color)] text-white shadow-[0_0_16px_var(--glow-color)]"
                  : "text-[var(--text-color)]/70 hover:text-[var(--text-color)]"
              }`}
            >
              Tomorrow
            </button>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.("calendar")}
            className="rounded-full border border-[var(--primary-color)]/35 bg-[var(--primary-color)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary-color)] hover:bg-[var(--primary-color)]/20 inline-flex items-center gap-1"
          >
            Full Calendar
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      <div className="relative mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {isLoading && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-72 flex-shrink-0 rounded-2xl border border-[var(--border-color)] bg-white/5 p-4 animate-pulse"
              >
                <div className="h-20 w-16 rounded bg-white/10" />
                <div className="mt-3 h-3 w-36 rounded bg-white/10" />
                <div className="mt-2 h-2 w-24 rounded bg-white/10" />
              </div>
            ))}
          </>
        )}

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
              className="group relative w-72 flex-shrink-0 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[linear-gradient(140deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4 text-left shadow-[0_18px_60px_-40px_var(--shadow-color)] transition hover:scale-[1.015] hover:border-[var(--primary-color)]/50 hover:shadow-[0_24px_72px_-45px_var(--glow-color)]"
            >
              <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[var(--primary-color)] to-cyan-300/80 opacity-90" />
              <div className="flex items-center gap-4">
                <img
                  src={
                    anime.images?.webp?.image_url ||
                    anime.images?.jpg?.image_url
                  }
                  alt={anime.title}
                  className="h-24 w-16 rounded-lg object-cover ring-1 ring-white/20"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Pill className="bg-white/20 text-[var(--text-color)]">Airing</Pill>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {anime.type || "TV"}
                    </span>
                    {anime.score ? (
                      <span className="rounded-full bg-amber-300/15 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                        {Number(anime.score).toFixed(1)}★
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-base font-semibold text-[var(--text-color)] truncate group-hover:text-white">
                    {anime.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <Clock size={12} />
                    <span className="rounded-full bg-black/30 px-2 py-0.5 text-[11px] text-white/90">
                      {anime.broadcast?.time || "TBA"}
                    </span>
                    <Calendar size={12} />
                    <span>{anime.broadcast?.day || targetDay}</span>
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

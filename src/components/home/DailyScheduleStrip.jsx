import React, { useMemo, useState } from "react";
import { Calendar, Clock } from "lucide-react";
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
  if (!match) return null;
  return Number.parseInt(match[1], 10);
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

  const targetDay = useMemo(() => dayNames[targetIndex], [targetIndex]);
  const targetFilter = useMemo(() => dayFilters[targetIndex], [targetIndex]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dailySchedule", targetFilter],
    queryFn: ({ signal }) => fetchScheduleByDay({ day: targetFilter, signal }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const items = useMemo(() => {
    const list = data || [];
    const filtered = list.filter((anime) => {
      const mins = getDurationMinutes(anime.duration);
      return mins != null && mins > 16;
    });
    return filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [data]);

  const visible = items.slice(0, 6);

  return (
    <GlassCard className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--text-color)]">Daily Release Schedule</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {targetDay} picks from the airing calendar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("today")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              mode === "today"
                ? "bg-[var(--primary-color)] text-white shadow-[0_0_14px_var(--glow-color)]"
                : "bg-white/5 text-[var(--text-color)]/70 hover:text-[var(--text-color)]"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMode("tomorrow")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              mode === "tomorrow"
                ? "bg-[var(--primary-color)] text-white shadow-[0_0_14px_var(--glow-color)]"
                : "bg-white/5 text-[var(--text-color)]/70 hover:text-[var(--text-color)]"
            }`}
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.("calendar")}
            className="text-xs font-semibold text-[var(--primary-color)] hover:opacity-90"
          >
            View Full Calendar
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
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
          <div className="text-sm text-[var(--text-muted)]">
            Could not load schedule.
          </div>
        )}

        {!isLoading && !isError && visible.length === 0 && (
          <div className="text-sm text-[var(--text-muted)]">
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
              className="w-72 flex-shrink-0 rounded-2xl border border-[var(--border-color)] bg-[linear-gradient(135deg,rgba(168,85,247,0.2),rgba(255,255,255,0.04))] p-4 text-left shadow-[0_18px_60px_-40px_var(--shadow-color)] transition hover:scale-[1.01] hover:shadow-[0_24px_70px_-45px_var(--glow-color)]"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    anime.images?.webp?.image_url ||
                    anime.images?.jpg?.image_url
                  }
                  alt={anime.title}
                  className="h-20 w-16 rounded-lg object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Pill className="bg-white/20 text-[var(--text-color)]">Airing</Pill>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {anime.type || "TV"}
                    </span>
                  </div>
                  <p className="mt-1 text-base font-semibold text-[var(--text-color)] truncate">
                    {anime.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <Clock size={12} />
                    <span>{anime.broadcast?.time || "TBA"}</span>
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

import React, { useMemo, useEffect, useState, memo } from "react";
import { format, isAfter, isBefore } from "date-fns";
import { Star, Clock, Calendar as CalendarIcon } from "lucide-react";
import { DaySkeleton as DayCalendarLoader } from "../../helperComponent/CalendarLoader";
import NoAnimeFound from "../../helperComponent/NoAnimeFound";

// ---- Timezone helpers ----
const JST_OFFSET = 9 * 60; // JST = UTC+9

function convertJSTtoLocal(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  const utcMs = date.getTime() - JST_OFFSET * 60 * 1000;
  return new Date(utcMs);
}

function formatTime(date) {
  if (!date) return "??:??";
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getAnimeTitles(anime) {
  const primary =
    anime.title_english?.trim() ||
    anime.title?.trim() ||
    anime.title_japanese?.trim() ||
    "Unknown title";
  const aliases = [anime.title, anime.title_english, anime.title_japanese]
    .map((v) => (v || "").trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i);
  const secondary = aliases.find((t) => t !== primary) || null;
  return { primary, secondary };
}

// ---- AnimeCard ----
const AnimeCard = ({ anime, isOngoing, onSelect, onToggleStar, index }) => {
  const image =
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    anime.images?.webp?.image_url ||
    anime.images?.jpg?.image_url ||
    "";
  const { primary, secondary } = useMemo(() => getAnimeTitles(anime), [anime]);

  const localTime = useMemo(() => {
    const dateStr = anime.localDate || anime.aired?.from;
    if (!dateStr) return "??:??";
    const local = convertJSTtoLocal(dateStr);
    return formatTime(local);
  }, [anime.localDate, anime.aired]);

  return (
    <li
      className={`relative overflow-hidden rounded-xl shadow-sm transition-all duration-200 group
        ${isOngoing ? "ring-2 ring-red-500 scale-[1.01]" : "hover:scale-[1.01]"}
        opacity-0 animate-slideIn
      `}
      style={{
        animationDelay: `${index * 120}ms`,
        animationFillMode: "forwards",
      }}
    >
      <button
        type="button"
        onClick={() => onSelect?.(anime)}
        className="w-full h-full text-left relative"
        aria-label={`View details for ${anime.title}`}
      >
        <div className="relative h-56">
          <img
            src={image}
            alt={primary}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/35" />
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-medium text-white">
              <Clock size={10} />
              {localTime}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar?.();
              }}
              className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-yellow-300 hover:bg-black/80 transition"
            >
              <Star
                size={12}
                fill={anime.starred ? "currentColor" : "none"}
                strokeWidth={1.8}
              />
              {anime.starred ? "Starred" : "Star"}
            </button>
          </div>

          {isOngoing && (
            <span className="absolute top-10 left-2 text-[9px] px-1.5 py-[1px] bg-red-500 text-white rounded-md shadow">
              Live
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 p-2.5">
            <p className="text-[14px] font-semibold leading-tight line-clamp-2 text-white">
              {primary}
            </p>
            {secondary && (
              <p className="text-[10px] text-white/70 mt-0.5 truncate">
                {secondary}
              </p>
            )}
          </div>
        </div>
      </button>
    </li>
  );
};

// ---- MinimalDayView ----
const MinimalDayView = ({ schedule = [], day, onSelectAnime, isLoading }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const isToday = useMemo(() => format(now, "EEE") === day, [day, now]);

  const nowOrNext = useMemo(() => {
    if (!schedule?.length) return null;
    const sorted = [...schedule].sort(
      (a, b) =>
        new Date(a.localDate || a.aired?.from) -
        new Date(b.localDate || b.aired?.from)
    );

    for (const anime of sorted) {
      const start = convertJSTtoLocal(anime.localDate || anime.aired?.from);
      if (!start) continue;
      const durationMins = Number.parseInt(anime.duration?.match(/\d+/)?.[0] || "24", 10);
      const end = new Date(start.getTime() + durationMins * 60000);
      if (isBefore(start, now) && isAfter(end, now))
        return { ...anime, status: "Ongoing" };
      if (isAfter(start, now)) return { ...anime, status: "Next" };
    }
    return null;
  }, [schedule, now]);

  const currentTimePosition = useMemo(() => {
    if (!isToday || !schedule.length) return 0;
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return Math.min(Math.max(((now - start) / (end - start)) * 100, 0), 100);
  }, [now, schedule, isToday]);

  return (
    <div className="h-[82vh] bg-[var(--surface-1)]/70 border border-[var(--border-color)] rounded-2xl shadow-[0_18px_60px_-40px_var(--shadow-color)] p-3 relative flex flex-col overflow-hidden">
      {/* Inline animation keyframes */}
      <style>
        {`
          @keyframes slideIn {
            0% { opacity: 0; transform: translateY(10px) scale(0.98); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-slideIn {
            animation: slideIn 0.4s ease-out forwards;
          }
        `}
      </style>

      <h3 className="text-base font-semibold text-white mb-3 border-b border-[var(--border-color)] pb-1 text-center">
        {day}
      </h3>

      {isToday && schedule.length > 0 && (
        <div
          className="absolute left-0 right-0 flex items-center h-0 z-20"
          style={{ top: `${currentTimePosition}%` }}
        >
          <div className="flex-1 h-[1px] bg-red-500" />
          <span className="bg-red-500 text-[10px] px-2 py-[1px] rounded font-mono ml-2 text-white shadow">
            {format(now, "HH:mm")}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[var(--text-color)]/20 scrollbar-track-[var(--bg-color)]">
        {isLoading ? (
          <DayCalendarLoader />
        ) : schedule.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full p-4 text-center">
            <div className="text-[var(--text-color)]/50 mb-2">
              <CalendarIcon size={48} className="opacity-50" />
            </div>
            <NoAnimeFound message="No anime scheduled for this day" />
            <p className="text-xs text-[var(--text-color)]/60 mt-2">
              Try adjusting your filters or check other days
            </p>
          </div>
        ) : (
          <ul className="space-y-2 relative z-10 p-6 pb-24">
            {schedule.map((anime, i) => (
              <AnimeCard
                key={anime.mal_id}
                anime={anime}
                index={i}
                isOngoing={
                  nowOrNext?.mal_id === anime.mal_id &&
                  nowOrNext.status === "Ongoing"
                }
                onSelect={onSelectAnime}
                onToggleStar={anime.onToggleStar}
              />
            ))}
          </ul>
        )}
      </div>

      {nowOrNext && (
        <button
          type="button"
          onClick={() => onSelectAnime?.(nowOrNext)}
          className="fixed bottom-4 left-4 right-4 bg-[var(--primary-color)] text-white rounded-full shadow-[0_0_24px_var(--glow-color)] p-2.5 flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
          aria-label={`View ${nowOrNext.status} anime: ${nowOrNext.title}`}
        >
          <img
            src={
              nowOrNext.images?.webp?.image_url ||
              nowOrNext.images?.jpg?.image_url
            }
            alt={nowOrNext.title}
            className="w-8 h-12 object-cover rounded"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide">
              {nowOrNext.status}
            </p>
            <p className="text-sm font-semibold truncate">{nowOrNext.title}</p>
            <p className="text-[10px]">
              {formatTime(
                convertJSTtoLocal(
                  nowOrNext.localDate || nowOrNext.aired?.from
                )
              )}{" "}
              ({nowOrNext.duration?.match(/\d+/)?.[0] || "24"} min)
            </p>
          </div>
          <Star size={15} className="text-white" />
        </button>
      )}
    </div>
  );
};

export default memo(MinimalDayView);

import React, { useMemo, useEffect, useState } from "react";
import { parseISO, isAfter, isBefore, format } from "date-fns";
import { Star, Clock } from "lucide-react";
import DayCalendarLoader from "../../helperComponent/CalendarLoader";
import NoAnimeFound from "../../helperComponent/NoAnimeFound";

// ---- Timezone helpers ----
const JST_OFFSET = 9 * 60; // JST = UTC+9

function convertJSTtoLocal(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date)) return null;

  // Convert from JST -> UTC
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

// ---- Anime card ----
const AnimeCard = ({ anime, isOngoing, onSelect, onToggleStar }) => {
  const image =
    anime.images?.webp?.image_url || anime.images?.jpg?.image_url || "";

  const localTime = useMemo(() => {
    const dateStr = anime.localDate || anime.aired?.from;
    if (!dateStr) return "??:??";
    const local = convertJSTtoLocal(dateStr);
    return formatTime(local);
  }, [anime.localDate, anime.aired]);

  return (
    <li
      onClick={() => onSelect?.(anime)}
      className={`relative overflow-hidden rounded-lg shadow-sm cursor-pointer transition-all duration-200 group ${
        isOngoing ? "ring-2 ring-red-500 scale-[1.01]" : "hover:scale-[1.01]"
      }`}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-center bg-cover blur-sm opacity-30"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Foreground */}
      <div className="relative flex items-center gap-2 p-2 bg-black/20 backdrop-blur-sm">
        <div className="relative flex-shrink-0">
          <img
            src={image}
            alt={anime.title}
            className="w-14 h-20 object-cover rounded-md"
          />

          {/* Star button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar?.();
            }}
            className="absolute top-1 right-1 bg-black/60 rounded-full p-[2px] text-yellow-400 hover:scale-110 transition-transform"
          >
            <Star
              size={13}
              fill={anime.starred ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
          </button>

          {/* Live badge */}
          {isOngoing && (
            <span className="absolute bottom-1 left-1 text-[9px] px-1.5 py-[1px] bg-red-500 text-white rounded-md shadow">
              Live
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-gray-100">
          <div className="flex justify-between text-[10px] text-gray-300 mb-[1px]">
            <div className="flex items-center gap-1">
              <Clock size={10} className="text-gray-400" />
              <span>{localTime}</span>
            </div>
            <span>{anime.duration?.match(/\d+/)?.[0] || "24"}m</span>
          </div>
          <p className="text-[13px] font-semibold leading-tight truncate">
            {anime.title}
          </p>
          {anime.episodes && (
            <p className="text-[10px] text-gray-400 mt-[1px]">
              Ep {anime.episodes}
            </p>
          )}
          {anime.aired?.string && (
            <p className="text-[10px] text-gray-400 truncate mt-[1px]">
              {anime.aired.string}
            </p>
          )}
        </div>
      </div>
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

      const durationMins = parseInt(anime.duration?.match(/\d+/)?.[0] || "24");
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
    <div className="min-h-[400px] bg-gray-900 rounded-xl shadow-lg p-3 relative overflow-hidden">
      {/* Header */}
      <h3 className="text-base font-semibold text-gray-100 mb-3 border-b border-gray-700 pb-1 text-center">
        {day}
      </h3>

      {/* Red line */}
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

      {/* States */}
      {isLoading ? (
        <DayCalendarLoader />
      ) : schedule.length === 0 ? (
        <div className="flex justify-center items-center h-[350px]">
          <NoAnimeFound message="No anime scheduled for this day" />
        </div>
      ) : (
        <ul className="space-y-2 mb-20 relative z-10">
          {schedule.map((anime) => (
            <AnimeCard
              key={anime.mal_id}
              anime={anime}
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

      {/* Sticky footer */}
      {nowOrNext && (
        <div
          onClick={() => onSelectAnime?.(nowOrNext)}
          className="fixed bottom-4 left-4 right-4 bg-red-500 text-white rounded-md shadow-lg p-2.5 flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
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
            <p className="text-sm font-semibold truncate">
              {nowOrNext.title}
            </p>
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
        </div>
      )}
    </div>
  );
};

export default MinimalDayView;

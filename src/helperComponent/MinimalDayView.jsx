import React, { useMemo, useEffect, useState } from "react";
import { parseISO, isAfter, isBefore, format } from "date-fns";

const MinimalDayView = ({ schedule = [], day, onSelectAnime }) => {
  const [now, setNow] = useState(new Date());

  // Update current time every 30 seconds for smoother red line
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const isToday = useMemo(() => {
    const todayStr = format(now, "EEE"); // Mon, Tue, etc.
    return todayStr === day;
  }, [day, now]);

  // Figure out current or next airing anime
  const nowOrNext = useMemo(() => {
    if (!schedule || schedule.length === 0) return null;

    const sorted = [...schedule].sort(
      (a, b) => new Date(a.localDate).getTime() - new Date(b.localDate).getTime()
    );

    for (let anime of sorted) {
      let start;
      try {
        start = parseISO(anime.localDate);
      } catch {
        start = new Date(anime.localDate);
      }
      if (isNaN(start)) continue;

      const durationMins = parseInt(anime.duration?.match(/\d+/)?.[0] || "24");
      const end = new Date(start.getTime() + durationMins * 60000);

      if (isBefore(start, now) && isAfter(end, now)) {
        return { ...anime, status: "Ongoing" };
      }
      if (isAfter(start, now)) {
        return { ...anime, status: "Next" };
      }
    }
    return null;
  }, [schedule, now]);

  // Calculate red line position (percent of day)
  const currentTimePosition = useMemo(() => {
    if (!isToday || schedule.length === 0) return 0;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const totalDayMs = endOfDay - startOfDay;
    const elapsedMs = now - startOfDay;

    return Math.min(Math.max((elapsedMs / totalDayMs) * 100, 0), 100);
  }, [now, schedule, isToday]);

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-2 relative">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-100 mb-3 border-b border-gray-700 pb-2 text-center">
        {day}
      </h3>

      {/* Red line for current time */}
      {isToday && schedule.length > 0 && (
        <div
          className="absolute left-0 right-0 flex items-center h-0 z-10"
          style={{ top: `${currentTimePosition}%` }}
        >
          <span className="text-red-400 text-xs mr-2 font-mono">
            {format(now, "HH:mm")}
          </span>
          <div className="flex-1 h-[2px] bg-red-500" />
        </div>
      )}

      {/* No anime fallback */}
      {schedule.length === 0 ? (
        <p className="text-gray-600 text-center text-sm">No anime airing</p>
      ) : (
        <ul className="space-y-3 mb-20 relative z-20">
          {schedule.map((anime) => (
            <li
              key={anime.mal_id}
              className="flex items-center gap-2 bg-gray-800 rounded-lg p-1 hover:bg-gray-700 transition cursor-pointer"
              onClick={() => onSelectAnime && onSelectAnime(anime)}
            >
              <img
                src={anime.images.webp?.image_url || anime.images.jpg?.image_url}
                alt={anime.title}
                className="w-12 h-16 object-cover rounded-md flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-space gap-2 text-xs text-gray-400">
                  <span>{anime.localTime}</span>
                  <span>{anime.duration?.match(/\d+/)?.[0] || "24"} min</span>
                </div>
                <p className="text-sm font-semibold text-gray-100 truncate">
                  {anime.title}
                </p>
                {anime.episodes && (
                  <p className="text-xs text-gray-400">
                    Upcoming Ep: {anime.episodes}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 text-yellow-400 text-2xl">
                {anime.starred ? "★" : "☆"}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Sticky footer card */}
      {nowOrNext && (
        <div
          className="fixed bottom-4 left-4 right-4 bg-[var(--primary-color)] text-white rounded-lg shadow-xl p-3 flex items-center gap-3 animate-bounceIn cursor-pointer"
          onClick={() => onSelectAnime && onSelectAnime(nowOrNext)}
        >
          <img
            src={nowOrNext.images.webp?.image_url || nowOrNext.images.jpg?.image_url}
            alt={nowOrNext.title}
            className="w-10 h-14 object-cover rounded-md flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide">
              {nowOrNext.status}
            </p>
            <p className="font-semibold truncate">{nowOrNext.title}</p>
            <p className="text-xs">
              {nowOrNext.localTime} ({nowOrNext.duration?.match(/\d+/)?.[0] || "24"} min)
            </p>
          </div>
          <span className="text-lg">⭐</span>
        </div>
      )}
    </div>
  );
};

export default MinimalDayView;

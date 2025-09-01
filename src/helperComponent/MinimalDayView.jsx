// src/components/helperComponent/MinimalDayView.jsx
import React, { useMemo } from "react";
import { parseISO, isAfter, isBefore } from "date-fns";

const MinimalDayView = ({ schedule = [], day }) => {
  const now = new Date();

  // Figure out current or next airing anime
const nowOrNext = useMemo(() => {
  if (!schedule || schedule.length === 0) return null;

  // sort safely
  const sorted = [...schedule].sort(
    (a, b) => new Date(a.localDate).getTime() - new Date(b.localDate).getTime()
  );

  for (let anime of sorted) {
    let start;
    try {
      start = parseISO(anime.localDate); // ✅ only works if localDate is ISO
    } catch {
      start = new Date(anime.localDate); // fallback
    }

    if (isNaN(start)) continue; // skip invalid dates

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

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 relative">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-100 mb-3 border-b border-gray-700 pb-2 text-center">
        {day}
      </h3>

      {/* No anime fallback */}
      {schedule.length === 0 ? (
        <p className="text-gray-600 text-center text-sm">No anime airing</p>
      ) : (
        <ul className="space-y-3 mb-20"> {/* leave space for footer card */}
          {schedule.map((anime) => (
            <li
              key={anime.mal_id}
              className="flex items-center gap-3 bg-gray-800 rounded-lg p-2 hover:bg-gray-700 transition cursor-pointer"
            >
              {/* Thumbnail */}
              <img
                src={anime.images.webp?.image_url || anime.images.jpg?.image_url}
                alt={anime.title}
                className="w-12 h-16 object-cover rounded-md flex-shrink-0"
              />

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs text-gray-400">
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

              {/* Star toggle placeholder */}
              <div className="flex-shrink-0 text-yellow-400 text-lg">
                {anime.starred ? "★" : "☆"}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Sticky footer card */}
      {nowOrNext && (
        <div className="fixed bottom-4 left-4 right-4 bg-[var(--primary-color)] text-white rounded-lg shadow-xl p-3 flex items-center gap-3 animate-bounceIn">
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

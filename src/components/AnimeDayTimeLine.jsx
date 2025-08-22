import React, { useMemo, useState } from 'react';

// Utility functions
const getTimeInHours = (timeStr = "00:00") => {
  const [h, m] = timeStr.split(':');
  return parseInt(h) + parseInt(m) / 60;
};

const getDurationInMin = (durationStr = "24 min") => {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 24;
};

// Segments: 0–6, 6–12, 12–18, 18–24
const segments = [
  { label: 'Midnight - 6 AM', start: 0, end: 6 },
  { label: '6 AM - Noon', start: 6, end: 12 },
  { label: 'Noon - 6 PM', start: 12, end: 18 },
  { label: '6 PM - Midnight', start: 18, end: 24 }
];

const AnimeDayTimeline = ({ animeList }) => {
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const defaultSegmentIndex = Math.floor(currentHour / 6);

  const [activeSegment, setActiveSegment] = useState(defaultSegmentIndex);

  const visibleSegment = segments[activeSegment];

  const filteredAnime = useMemo(() => {
    return animeList
      .map((anime, i) => {
        const timeStr = anime.broadcast?.time;
        const durationStr = anime.duration;
        if (!timeStr) return null;

        const start = getTimeInHours(timeStr);
        const duration = getDurationInMin(durationStr || '24 min');
        const end = start + duration / 60;
        return {
          start,
          end,
          duration,
          title: anime.title,
          backgroundURL: anime.images.webp.small_image_url || anime.images.jpg.small_image_url || '',
        };
      })
      .filter(a => a && a.start < visibleSegment.end && a.end > visibleSegment.start)
      .sort((a, b) => a.start - b.start);
  }, [animeList, visibleSegment]);

  // Handle overlaps by stacking
  const rows = [[]];
  for (const item of filteredAnime) {
    let placed = false;
    for (const row of rows) {
      if (!row.some(e => !(e.end <= item.start || e.start >= item.end))) {
        row.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) rows.push([item]);
  }

  // Calculate current time marker position if in segment
  const currentTimeInHours = currentHour + currentMinute / 60;
  const isCurrentInSegment =
    currentTimeInHours >= visibleSegment.start && currentTimeInHours < visibleSegment.end;
  const markerLeft = isCurrentInSegment
    ? ((currentTimeInHours - visibleSegment.start) / 6) * 100
    : null;

  return (
    <div className="my-8 p-6 bg-gray-900 rounded-xl text-gray-200 shadow-lg overflow-x-auto">
      <div className="flex justify-between items-center mb-4 gap-2">
        <button
          onClick={() => setActiveSegment((prev) => Math.max(prev - 1, 0))}
          disabled={activeSegment === 0}
          className={`px-3 py-1 text-xl rounded bg-gray-800 border border-gray-700 transition hover:bg-gray-700 disabled:opacity-40`}
        >
          ◀
        </button>
        <span className="text-base font-semibold tracking-wide text-center">
          {visibleSegment.label}
        </span>
        <button
          onClick={() => setActiveSegment((prev) => Math.min(prev + 1, segments.length - 1))}
          disabled={activeSegment === segments.length - 1}
          className={`px-3 py-1 text-xl rounded bg-gray-800 border border-gray-700 transition hover:bg-gray-700 disabled:opacity-40`}
        >
          ▶
        </button>
      </div>

      <div className="flex justify-between text-xs mb-2 font-mono">
        {Array.from({ length: visibleSegment.end - visibleSegment.start + 1 }, (_, i) => {
          const h = visibleSegment.start + i;
          return (
            <span key={h} className="flex-1 text-center text-gray-500">
              {h}:00
            </span>
          );
        })}
      </div>

      <div className="relative w-full h-[2px] bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 mb-2">
        {isCurrentInSegment && (
          <div
            className="absolute top-[-6px] h-[18px] w-[2px] bg-red-500 z-50 transition-all duration-200"
            style={{ left: `${markerLeft}%` }}
            title={`Now: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-[-18px] text-xs text-red-500 font-bold drop-shadow">
              {currentHour}:{currentMinute.toString().padStart(2, '0')}
            </div>
          </div>
        )}
      </div>

      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="relative h-16 bg-gray-800 rounded mb-2 overflow-visible">
          {row.map((item, index) => {
            const visibleStart = visibleSegment.start;
            const visibleEnd = visibleSegment.end;

            const effectiveStart = Math.max(item.start, visibleStart);
            const effectiveEnd = Math.min(item.end, visibleEnd);

            const left = ((effectiveStart - visibleStart) / 6) * 100;
            const width = ((effectiveEnd - effectiveStart) / 6) * 100;

            return (
              <div
                key={index}
                title={`${item.title} — ${item.duration} min`}
                className={`absolute h-full rounded shadow-md flex items-center px-2 text-xs font-semibold whitespace-nowrap overflow-hidden text-white transition-all duration-200`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  minWidth: '2.5rem',
                  border: '2px solid rgba(255,255,255,0.08)',
                  zIndex: 10 + rowIndex,
                  backgroundImage: item.backgroundURL
                    ? `linear-gradient(to right, rgba(30,30,30,0.7), rgba(30,30,30,0.5)), url(${item.backgroundURL})`
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <span className="overflow-hidden text-ellipsis drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                  {item.title.length > 16 ? item.title.slice(0, 14) + '…' : item.title}
                </span>
              </div>
            );
          })}
        </div>
      ))}

      <div className="flex justify-end text-[0.7rem] mt-2 text-gray-400 font-mono">
        <span>
          {filteredAnime.length === 0
            ? "No anime airing in this segment"
            : `${filteredAnime.length} anime airing`}
        </span>
      </div>
    </div>
  );
};

export default AnimeDayTimeline;

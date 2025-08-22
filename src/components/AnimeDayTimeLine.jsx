import React, { useState, useEffect } from "react";

const getTimeInHours = (timeStr = "00:00") => {
  const [h, m] = timeStr.split(":");
  return parseInt(h) + parseInt(m) / 60;
};

const AnimeDayTimeline = ({ animeList, onSelectAnime }) => {
  const [showNextTag, setShowNextTag] = useState(true);
  const [nextAnime, setNextAnime] = useState(null);

  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const currentTimeInHours = currentHour + currentMinute / 60;

  // ✅ Auto-calculate next airing anime for today
  useEffect(() => {
    const calculateNext = () => {
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

      const todayAnime = animeList
        .filter(
          (a) =>
            a.broadcast?.day &&
            a.broadcast.day.toLowerCase().startsWith(today) &&
            a.broadcast?.time
        )
        .map((a) => ({
          ...a,
          start: getTimeInHours(a.broadcast.time),
        }))
        .filter((a) => a.start > currentTimeInHours) // after now
        .sort((a, b) => a.start - b.start);

      setNextAnime(todayAnime[0] || null);
    };

    calculateNext();
    const interval = setInterval(calculateNext, 60 * 1000); // update every 60 sec
    return () => clearInterval(interval);
  }, [animeList, currentTimeInHours]);

  if (!nextAnime || !showNextTag) return null;

  return (
    <div
      onClick={() => onSelectAnime && onSelectAnime(nextAnime)}
      className="
        fixed bottom-3 md:bottom-6 
        left-2 right-2 md:left-auto md:right-6 
        bg-indigo-700 text-white rounded-lg shadow-xl flex items-center gap-3 p-3 
        animate-fadeIn z-[10000]
        max-w-full md:max-w-sm cursor-pointer
      "
      style={{ backdropFilter: "blur(8px)" }}
    >
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowNextTag(false);
        }}
        className="absolute top-1 right-2 text-white text-lg font-bold px-2 rounded hover:bg-white/20 transition"
      >
        ×
      </button>

      {/* Image */}
      <img
        src={nextAnime.images.webp.image_url || nextAnime.images.jpg.image_url}
        alt={nextAnime.title}
        className="w-12 h-12 rounded object-cover border border-indigo-500 flex-shrink-0"
      />

      {/* Details */}
      <div className="flex flex-col overflow-hidden">
        <span className="text-xs uppercase font-semibold text-gray-200">Airing Next</span>
        <span className="text-sm font-bold truncate">{nextAnime.title}</span>
        <span className="text-xs text-gray-200">at {nextAnime.broadcast?.time} JST</span>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.4s ease-in-out;
          }
        `}
      </style>
    </div>
  );
};

export default AnimeDayTimeline;

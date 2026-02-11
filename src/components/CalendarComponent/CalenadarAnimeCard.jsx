import React from "react";
import { Star, Clock } from "lucide-react";

const AnimeCard = ({ anime, isOngoing, onSelect, onToggleStar }) => {
  const image =
    anime.images.webp?.small_image_url || anime.images.jpg?.small_image_url || "";

  return (
    <li
      onClick={() => onSelect?.(anime)}
      className={`relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-white/5 shadow-[0_18px_60px_-40px_var(--shadow-color)] cursor-pointer transition-all duration-200 group ${
        isOngoing ? "ring-2 ring-red-500 scale-[1.02]" : "hover:scale-[1.01]"
      }`}
    >

      {/* Foreground content */}
      <div className="relative flex items-center gap-2 p-1 bg-black/70">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0">
          <img
            src={image}
            alt={anime.title}
            className="w-24 h-32 object-cover rounded-md"
          />
          {/* Overlay Star Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar?.();
            }}
            className="absolute top-1 right-1 bg-black/60 rounded-full p-[3px] text-yellow-400 hover:scale-110 transition-transform"
          >
            <Star
              size={15}
              fill={anime.starred ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
          </button>
          {/* Live Badge */}
          {isOngoing && (
            <span className="absolute bottom-1 left-1 text-[10px] px-2 py-[1px] bg-red-500 text-white rounded-md shadow">
              Live
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-gray-100">
          <div className="flex justify-between text-[11px] text-gray-300 mb-[2px]">
            <div className="flex items-center gap-1">
              <Clock size={11} className="text-gray-400" />
              <span>{anime.localTime || "??:??"}</span>
            </div>
            <span>{anime.duration?.match(/\d+/)?.[0] || "24"}m</span>
          </div>

          <p className="text-sm font-semibold leading-tight truncate">
            {anime.title}
          </p>

          {anime.episodes && (
            <p className="text-xs text-gray-400 mt-[1px]">
              Ep {anime.episodes}
            </p>
          )}

          {anime.aired && (
            <p className="text-[11px] text-gray-400 mt-[2px] truncate">
              {anime.aired.string}
            </p>
          )}
        </div>
      </div>
    </li>
  );
};

export default AnimeCard;

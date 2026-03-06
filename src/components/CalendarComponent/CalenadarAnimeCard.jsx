import React from "react";
import { Star, Clock } from "lucide-react";

const getAnimeTitles = (anime) => {
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
};

const AnimeCard = ({ anime, isOngoing, onSelect, onToggleStar }) => {
  const { primary, secondary } = getAnimeTitles(anime);
  const image =
    anime.images.webp?.small_image_url ||
    anime.images.jpg?.small_image_url ||
    anime.images.webp?.image_url ||
    anime.images.jpg?.image_url ||
    "";

  return (
    <li
      onClick={() => onSelect?.(anime)}
      className={`relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-white/5 shadow-[0_18px_60px_-40px_var(--shadow-color)] cursor-pointer transition-all duration-200 group ${isOngoing ? "ring-2 ring-red-500 scale-[1.02]" : "hover:scale-[1.01]"
        }`}
    >
      <div className="relative w-40 h-48">
        <img
          src={image}
          alt={primary}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/35" />

        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-medium text-white">
            <Clock size={10} />
            {anime.localTime || "??:??"}
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

        <div className="absolute inset-x-0 bottom-0 p-2.5 text-gray-100">
          <p className="text-sm font-semibold leading-tight line-clamp-2">
            {primary}
          </p>
          {secondary && (
            <p className="text-[10px] text-white/70 mt-0.5 truncate">
              {secondary}
            </p>
          )}
        </div>
      </div>
    </li>
  );
};

export default AnimeCard;

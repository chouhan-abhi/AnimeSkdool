import React, { useMemo, memo } from "react";
import { Star, Clock, Play } from "lucide-react";
import NoAnimeFound from "../../helperComponent/NoAnimeFound";

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

const AnimeCard = memo(({ anime, isOngoing, onSelect, onToggleStar }) => {
  const image =
    anime.images?.webp?.image_url ||
    anime.images?.jpg?.image_url ||
    "";
  const { primary, secondary } = useMemo(() => getAnimeTitles(anime), [anime]);

  const localTime = useMemo(() => {
    const dateStr = anime.localDate || anime.aired?.from;
    if (!dateStr) return anime.broadcast?.time || "TBD";
    const local = convertJSTtoLocal(dateStr);
    return formatTime(local);
  }, [anime.localDate, anime.aired, anime.broadcast]);

  return (
    <div
      onClick={() => onSelect?.(anime)}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#08080c] hover:bg-[#0c0c12] p-3 flex gap-3.5 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_16px_36px_rgba(0,0,0,0.9)] cursor-pointer group select-none ${
        isOngoing ? "ring-1 ring-red-500/80" : ""
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect?.(anime);
      }}
    >
      <div className="specular-highlight opacity-30 group-hover:opacity-100" />

      {/* Thumbnail */}
      <div className="relative w-16 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/10">
        {image && (
          <img
            src={image}
            alt={primary}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play size={14} className="fill-white text-white" />
        </div>
      </div>

      {/* Info Body */}
      <div className="min-w-0 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 text-white/80 px-2 py-0.5 text-[10px] font-bold tracking-wider">
              <Clock size={10} />
              {localTime}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar?.();
              }}
              className={`p-1 rounded-full transition-all ${
                anime.starred
                  ? "text-yellow-400 bg-yellow-400/20"
                  : "text-white/40 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Star"
            >
              <Star size={13} fill={anime.starred ? "currentColor" : "none"} />
            </button>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-[var(--primary-color)] transition-colors">
            {primary}
          </h4>

          {secondary && (
            <p className="text-[11px] text-white/50 truncate mt-0.5">
              {secondary}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-white/60 mt-2">
          <span>{anime.genres?.[0]?.name || "Anime"}</span>
          {anime.score && (
            <span className="flex items-center gap-0.5 text-yellow-400 font-semibold">
              ★ {anime.score}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

AnimeCard.displayName = "AnimeCard";

const MinimalDayView = ({ schedule = [], day, onSelectAnime }) => {
  if (schedule.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <p className="text-xs text-white/40">No anime scheduled for {day}.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
      {schedule.map((anime, index) => (
        <AnimeCard
          key={anime.mal_id}
          anime={anime}
          index={index}
          onSelect={onSelectAnime}
          onToggleStar={anime.onToggleStar}
        />
      ))}
    </div>
  );
};

export default memo(MinimalDayView);

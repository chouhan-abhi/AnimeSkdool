import React, { useState, useCallback, lazy, Suspense } from "react";
import { Star, Play } from "lucide-react";

const AnimeDetailsPanel = lazy(() => import("../components/AnimeDetailsPanel"));

const AnimeCard = ({ anime }) => {
  const [expanded, setExpanded] = useState(false);

  const handleClose = useCallback(() => {
    setExpanded(false);
  }, []);

  if (!anime) return null;

  const {
    title,
    images,
    type,
    episodes,
    duration,
    score,
    rank,
    status,
    year,
    season,
    rating,
    studios,
    genres,
    producers,
    popularity,
    members,
  } = anime;

  const imgUrl = images?.webp?.image_url || images?.jpg?.image_url;

  return (
    <>
      <div
        className="relative h-[300px] w-full rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--surface-1)] cursor-pointer group"
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setExpanded(true);
        }}
      >
        {imgUrl && (
          <img
            src={imgUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {(score || rank) && (
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {score && (
              <span className="flex items-center gap-1 bg-black/60 glass text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-lg">
                <Star size={11} fill="currentColor" />
                {score}
              </span>
            )}
            {rank && (
              <span className="bg-black/60 glass text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                #{rank}
              </span>
            )}
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="rounded-full bg-[var(--primary-color)]/70 p-3 shadow-lg">
            <Play size={24} className="text-white" fill="white" />
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white truncate">{title}</h3>
          <p className="text-xs text-white/70 truncate mt-0.5">
            {[type, duration, episodes && `${episodes} eps`].filter(Boolean).join(" · ")}
          </p>
          <p className="text-[11px] text-white/50 truncate mt-0.5">
            {[status, year && `${season} ${year}`, rating].filter(Boolean).join(" · ")}
          </p>

          {studios?.length > 0 && (
            <p className="text-[11px] text-white/50 truncate mt-1">
              {studios.map((s) => s.name).join(", ")}
            </p>
          )}

          {genres?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {genres.slice(0, 3).map((g) => (
                <span key={g.mal_id} className="text-[9px] uppercase font-semibold px-1.5 py-px rounded bg-white/10 text-white/80">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {popularity && members && (
            <p className="text-[10px] text-white/40 mt-1">
              #{popularity} · {members.toLocaleString()} members
            </p>
          )}
        </div>
      </div>

      {expanded && (
        <Suspense
          fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--primary-color)] border-t-transparent animate-spin" />
            </div>
          }
        >
          <AnimeDetailsPanel anime={anime} onClose={handleClose} />
        </Suspense>
      )}
    </>
  );
};

export default AnimeCard;

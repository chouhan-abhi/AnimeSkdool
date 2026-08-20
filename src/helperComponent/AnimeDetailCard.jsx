import React, { useState, useCallback, lazy, Suspense } from "react";
import { Star, Play } from "lucide-react";

const AnimeDetailsPanel = lazy(() => import("../components/AnimeDetailsPanel"));

const AnimeDetailCard = ({ anime }) => {
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
    score,
    status,
    year,
    season,
    studios,
    genres,
  } = anime;

  const webp = images?.webp || {};
  const jpg = images?.jpg || {};
  const imgUrl = webp.image_url || jpg.image_url || webp.small_image_url || jpg.small_image_url;

  return (
    <>
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-[#14141d]/90 flex cursor-pointer h-[190px] transition-all duration-300 hover:border-white/25 hover:shadow-[0_20px_45px_rgba(0,0,0,0.85),0_0_25px_-5px_var(--glow-color)] hover:scale-[1.02] group select-none"
        onClick={() => setExpanded(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setExpanded(true);
        }}
      >
        <div className="specular-highlight opacity-30 group-hover:opacity-100 transition-opacity" />

        {/* Poster Image */}
        <div className="relative w-[130px] sm:w-[145px] h-full flex-shrink-0 overflow-hidden bg-black/50">
          {imgUrl && (
            <img
              src={imgUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                if (e.target) e.target.style.display = "none";
              }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-[#14141d]/90" />

          {score && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-md text-yellow-400 px-2 py-0.5 rounded-full border border-white/10 text-[11px] font-bold">
              <Star size={10} fill="currentColor" />
              <span>{score}</span>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
            <span className="rounded-full bg-white text-black p-2.5 shadow-lg">
              <Play size={16} className="fill-black translate-x-0.5" />
            </span>
          </div>
        </div>

        {/* Content Info */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/80 border border-white/15">
                {type || "TV"}
              </span>
              {status && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-green-400">
                  {status === "Currently Airing" ? "Airing Now" : status}
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-[var(--primary-color)] transition-colors">
              {title}
            </h3>

            <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
              {[episodes ? `${episodes} episodes` : null, season && year ? `${season} ${year}` : year]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          <div className="space-y-2">
            {studios?.length > 0 && (
              <p className="text-[11px] text-[var(--text-muted)] truncate">
                <span className="text-white/40">Studio:</span> {studios.map((s) => s.name).join(", ")}
              </p>
            )}

            {genres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {genres.slice(0, 3).map((g) => (
                  <span
                    key={g.mal_id}
                    className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] text-white/80 font-medium"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <Suspense
          fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[9999]">
              <div className="w-10 h-10 rounded-full border-2 border-white border-t-transparent animate-spin" />
            </div>
          }
        >
          <AnimeDetailsPanel anime={anime} onClose={handleClose} />
        </Suspense>
      )}
    </>
  );
};

export default AnimeDetailCard;

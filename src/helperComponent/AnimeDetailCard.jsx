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
  const webpSrcSet = [webp.small_image_url, webp.image_url, webp.large_image_url]
    .filter(Boolean)
    .map((url, i) => `${url} ${[120, 240, 360][i]}w`)
    .join(", ");
  const jpgSrcSet = [jpg.small_image_url, jpg.image_url, jpg.large_image_url]
    .filter(Boolean)
    .map((url, i) => `${url} ${[120, 240, 360][i]}w`)
    .join(", ");
  const imgUrl = webp.image_url || jpg.image_url || webp.small_image_url || jpg.small_image_url;

  return (
    <>
      <div
        className="relative w-full rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--surface-1)]/40 flex cursor-pointer h-[200px] transition-all duration-300 hover:border-[var(--primary-color)]/25 hover:shadow-[0_12px_36px_-12px_var(--glow-color)] group"
        onClick={() => setExpanded(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setExpanded(true);
        }}
      >
        <div className="relative w-[140px] h-full flex-shrink-0 overflow-hidden">
          {imgUrl && (
            <picture>
              {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes="140px" />}
              {jpgSrcSet && <source type="image/jpeg" srcSet={jpgSrcSet} sizes="140px" />}
              <img
                src={imgUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                onError={(e) => { if (e.target) e.target.style.display = "none"; }}
              />
            </picture>
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--surface-1)]/30" />

          {score && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 glass text-yellow-400 px-1.5 py-0.5 rounded-md">
              <Star size={10} fill="currentColor" />
              <span className="text-xs font-bold">{score}</span>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="rounded-full bg-[var(--primary-color)]/70 p-2 shadow-lg">
              <Play size={18} className="text-white" fill="white" />
            </span>
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-base font-bold text-[var(--text-color)] truncate group-hover:text-[var(--primary-color)] transition-colors">
              {title}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
              {[type, episodes && `${episodes} eps`, season && year && `${season} ${year}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {status && (
              <span className={`inline-block mt-1.5 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                status === "Currently Airing"
                  ? "bg-green-500/15 text-green-400"
                  : "bg-[var(--surface-1)] text-[var(--text-muted)]"
              }`}>
                {status === "Currently Airing" ? "Airing" : status}
              </span>
            )}
          </div>

          <div className="space-y-1 text-[11px] text-[var(--text-muted)]">
            {studios?.length > 0 && (
              <p className="truncate">
                {studios.map((s) => s.name).join(", ")}
              </p>
            )}
            {genres?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {genres.slice(0, 3).map((g) => (
                  <span key={g.mal_id} className="px-1.5 py-px rounded bg-white/5 border border-[var(--border-color)] text-[10px]">
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

export default AnimeDetailCard;

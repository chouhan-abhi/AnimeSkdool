import React, { useState, useCallback, lazy, Suspense } from "react";
const AnimeDetailsPanel = lazy(() => import("../components/AnimeDetailsPanel"));

const AnimeDetailCard = ({ anime, bookmarked = [], toggleBookmark }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Memoize onClose to prevent re-renders
  const handleClose = useCallback(() => {
    setExpanded(false);
  }, []);

  if (!anime) return null;

  const {
    mal_id,
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
    popularity,
    members,
    producers,
  } = anime;

  const isBookmarked = bookmarked.includes(mal_id);
  const nsfw = rating === "Rx - Hentai";

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
        className="relative w-full rounded-2xl overflow-hidden border border-[var(--border-color)] bg-white/5 shadow-[0_20px_60px_-40px_var(--shadow-color)] flex cursor-pointer h-[220px]
                   transform transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_30px_80px_-40px_var(--glow-color)]"
        onClick={() => setExpanded(true)}
      >
        {/* Background blur - disabled on mobile for performance */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0 hidden md:block"
          style={{ 
            backgroundImage: imgUrl ? `url(${imgUrl})` : undefined,
            filter: 'blur(12px)',
            transform: 'scale(1.05)'
          }}
        />

        <div className="absolute inset-0 bg-black/60 z-0" />

        {/* Main content */}
        <div className="relative flex flex-row h-full overflow-hidden">
          {/* Left image */}
          <div className="relative w-40 h-full flex-shrink-0 overflow-hidden rounded-l-xl">
            {imgUrl && (
              <picture>
                {webpSrcSet && (
                  <source
                    type="image/webp"
                    srcSet={webpSrcSet}
                    sizes="160px"
                  />
                )}
                {jpgSrcSet && (
                  <source
                    type="image/jpeg"
                    srcSet={jpgSrcSet}
                    sizes="160px"
                  />
                )}
                <img
                  src={imgUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (e.target) {
                      e.target.style.display = 'none';
                    }
                  }}
                />
              </picture>
            )}

            {/* NSFW badge */}
            {nsfw && (
              <div className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
                NSFW
              </div>
            )}

            {/* Floating rating & rank badges */}
            <div className="absolute bottom-2 left-2 flex gap-2 items-center">
              {score && (
                <span className="font-bold text-xs px-2 py-1 rounded-full bg-black/70 text-white shadow-md">
                  ⭐ {score}
                </span>
              )}
              {rank && (
                <span className="font-bold text-xs px-2 py-1 rounded-full bg-black/70 text-white shadow-md">
                  #{rank}
                </span>
              )}
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1 p-4 flex flex-col justify-between text-white relative overflow-hidden">
            {/* Bookmark */}
            {toggleBookmark && (
              <div
                className="absolute top-2 right-2 text-yellow-400 text-2xl z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(mal_id);
                }}
                title={isBookmarked ? "Bookmarked" : "Bookmark"}
              >
                {isBookmarked ? "🔖" : "📑"}
              </div>
            )}

            {/* Title & Basic Info */}
            <div className="space-y-1">
              <h3 className="text-lg font-bold truncate">{title}</h3>
              <p className="text-sm text-gray-300 truncate">
                {type} • {duration} • {episodes ?? "TBA"} eps
              </p>
              <p className="text-xs text-gray-400 truncate">
                {status} {year ? `• ${season} ${year}` : ""} • {rating}
              </p>
            </div>

            {/* Studios, Genres, Producers */}
            <div className="space-y-1 text-xs text-gray-300 truncate">
              {studios?.length > 0 && (
                <p className="truncate">
                  Studio: {studios.map((s) => s.name).join(", ")}
                </p>
              )}
              {genres?.length > 0 && (
                <p className="truncate">
                  Genres: {genres.map((g) => g.name).join(", ")}
                </p>
              )}
              {producers?.length > 0 && (
                <p className="truncate">
                  Producer: {producers.map((p) => p.name).join(", ")}
                </p>
              )}
              {popularity && members && (
                <p className="truncate">
                  Popularity: #{popularity} • {members.toLocaleString()} members
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]"><div className="text-white">Loading...</div></div>}>
          <AnimeDetailsPanel anime={anime} onClose={handleClose} />
        </Suspense>
      )}
    </>
  );
};

export default AnimeDetailCard;

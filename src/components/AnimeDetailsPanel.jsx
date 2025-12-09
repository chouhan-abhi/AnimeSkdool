import React, { useState, useEffect, useCallback, useRef, lazy, Suspense, memo } from "react";
import ReactDOM from "react-dom";
import { Bookmark, X } from "lucide-react";
import { contentProvider, formatNumber } from "../utils/utils";
import PageLoader from "../helperComponent/PageLoader";
import storageManager from "../utils/storageManager";
import { useToast } from "../utils/toast";

// Detect mobile once at module level
const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

// Lazy-loaded components - only for desktop
const EpisodesList = lazy(() => import("../helperComponent/EpisodeList"));
const Badge = lazy(() => import("../helperComponent/Badge"));

// ============================================
// MOBILE VERSION - Lightweight, no frills
// ============================================
const MobileAnimeDetails = memo(({ anime, onClose }) => {
  const { showToast } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(() => 
    storageManager.isInWatchlist(anime?.mal_id)
  );

  // Simple close on ESC
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!anime) return null;

  const imgUrl = anime.images?.webp?.image_url || anime.images?.jpg?.image_url;

  const toggleWatchlist = () => {
    if (isInWatchlist) {
      storageManager.removeFromWatchlist(anime.mal_id);
      showToast("Removed from watchlist", "info");
    } else {
      storageManager.addToWatchlist(anime);
      showToast("Added to watchlist", "success");
    }
    setIsInWatchlist(!isInWatchlist);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black text-white"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Header with close */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-3 bg-black/90">
        <button type="button" onClick={onClose} className="p-2 -ml-2">
          <X size={24} />
        </button>
        <button type="button" onClick={toggleWatchlist} className="p-2 -mr-2">
          <Bookmark 
            size={24} 
            className={isInWatchlist ? "fill-[var(--primary-color)] text-[var(--primary-color)]" : ""} 
          />
        </button>
      </div>

      {/* Scrollable content */}
      <div 
        className="overflow-y-auto pb-6"
        style={{ height: 'calc(100vh - 56px)', WebkitOverflowScrolling: 'touch' }}
      >
        {/* Image - small and simple */}
        {imgUrl && (
          <div className="w-full h-40 bg-gray-900">
            <img 
              src={imgUrl} 
              alt="" 
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h1 className="text-xl font-bold leading-tight">{anime.title}</h1>
          {anime.title_english && anime.title_english !== anime.title && (
            <p className="text-sm text-gray-400">{anime.title_english}</p>
          )}

          {/* Quick stats row */}
          <div className="flex flex-wrap gap-2 text-xs">
            {anime.score && (
              <span className="bg-yellow-600 px-2 py-1 rounded">⭐ {anime.score}</span>
            )}
            {anime.episodes && (
              <span className="bg-gray-700 px-2 py-1 rounded">{anime.episodes} eps</span>
            )}
            {anime.status && (
              <span className="bg-gray-700 px-2 py-1 rounded">{anime.status}</span>
            )}
          </div>

          {/* Synopsis - truncated for mobile */}
          <p className="text-sm text-gray-300 leading-relaxed">
            {anime.synopsis 
              ? (anime.synopsis.length > 400 
                  ? `${anime.synopsis.slice(0, 400)}...` 
                  : anime.synopsis)
              : "No synopsis available."}
          </p>

          {/* Genres - simple chips */}
          {anime.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {anime.genres.slice(0, 5).map((g) => (
                <span key={g.mal_id} className="text-xs bg-gray-800 px-2 py-1 rounded">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Watch providers - simple list */}
          <div className="pt-2">
            <p className="text-sm font-semibold mb-2">Watch on:</p>
            <div className="flex flex-wrap gap-2">
              {contentProvider.slice(0, 4).map((p) => (
                <a
                  key={p.name}
                  href={`${p.url}${encodeURIComponent(anime.title_english || anime.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-[var(--primary-color)] px-3 py-2 rounded"
                >
                  {p.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================
// DESKTOP VERSION - Full featured
// ============================================
const DesktopAnimeDetails = memo(({ anime, onClose }) => {
  const { showToast } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [portalRoot, setPortalRoot] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    setPortalRoot(document.getElementById("modal-root") || document.body);
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (anime?.mal_id) {
      setIsInWatchlist(storageManager.isInWatchlist(anime.mal_id));
    }
  }, [anime?.mal_id]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const toggleWatchlist = useCallback(() => {
    if (isInWatchlist) {
      storageManager.removeFromWatchlist(anime.mal_id);
      showToast(`Removed ${anime.title} from watchlist`, "info");
    } else {
      storageManager.addToWatchlist(anime);
      showToast(`Added ${anime.title} to watchlist`, "success");
    }
    setIsInWatchlist(!isInWatchlist);
  }, [isInWatchlist, anime, showToast]);

  const handleProviderClick = useCallback((name) => {
    storageManager.saveToWatchlist(anime, true);
    if (!isInWatchlist) setIsInWatchlist(true);
    showToast(`Started watching on ${name}`, "success");
  }, [anime, isInWatchlist, showToast]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target.id === "anime-details-backdrop") onClose();
  }, [onClose]);

  if (!anime || !portalRoot) return null;

  const imgSrc = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url;

  return ReactDOM.createPortal(
    <dialog
      id="anime-details-backdrop"
      className="fixed inset-0 z-[9999] flex flex-row bg-black/80 m-0 p-0 max-w-none max-h-none w-full h-full"
      onClick={handleBackdropClick}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      open
    >
      {/* Close button */}
      <button
        type="button"
        className="absolute right-4 top-4 w-10 h-10 flex justify-center items-center rounded-full bg-black/60 text-white text-xl hover:bg-white/20 transition z-50"
        onClick={onClose}
      >
        ×
      </button>

      {/* Details Panel */}
      <div className="w-[40%] max-w-[720px] p-6 overflow-y-auto text-white">
        <div className="space-y-4">
          {/* Title & Bookmark */}
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{anime.title}</h2>
            <button type="button" onClick={toggleWatchlist} className="p-2 rounded-full hover:bg-white/20">
              <Bookmark
                size={24}
                className={isInWatchlist ? "fill-[var(--primary-color)] text-[var(--primary-color)]" : ""}
              />
            </button>
          </div>
          {anime.title_english && <p className="text-sm italic">{anime.title_english}</p>}

          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            {anime.status && <span className="bg-[var(--primary-color)] text-white px-2 py-1 rounded-full text-xs">📺 {anime.status}</span>}
            {anime.score && <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">⭐ {anime.score}</span>}
            {anime.rank && <span className="bg-[var(--primary-color)] text-white px-2 py-1 rounded-full text-xs">Rank #{anime.rank}</span>}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-black/40 text-center">
              <p className="text-xs">Popularity</p>
              <p className="font-semibold">#{anime.popularity}</p>
            </div>
            <div className="p-2 rounded-lg bg-black/40 text-center">
              <p className="text-xs">Members</p>
              <p className="font-semibold">{formatNumber(anime.members)}</p>
            </div>
            <div className="p-2 rounded-lg bg-black/40 text-center">
              <p className="text-xs">Favorites</p>
              <p className="font-semibold">{formatNumber(anime.favorites)}</p>
            </div>
            <div className="p-2 rounded-lg bg-black/40 text-center">
              <p className="text-xs">Episodes</p>
              <p className="font-semibold">{anime.episodes || "TBA"}</p>
            </div>
          </div>

          <p className="leading-relaxed">{anime.synopsis || "No synopsis available."}</p>

          {/* Episodes list */}
          <Suspense fallback={<PageLoader />}>
            <EpisodesList animeId={anime.mal_id} />
          </Suspense>

          {/* Genres */}
          {anime.genres?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-1">Genres</h4>
              <div className="flex flex-wrap gap-1">
                <Suspense fallback={<span>Loading...</span>}>
                  {anime.genres.map((g) => <Badge key={g.mal_id}>{g.name}</Badge>)}
                </Suspense>
              </div>
            </div>
          )}

          {/* Studios */}
          {anime.studios?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-1">Studios</h4>
              <div className="flex flex-wrap gap-1">
                {anime.studios.map((s) => (
                  <a key={s.mal_id} href={s.url} target="_blank" rel="noreferrer" 
                     className="border px-2 py-1 rounded text-sm hover:bg-[var(--primary-color)]">
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Watch providers */}
          <div>
            <h4 className="font-semibold mb-1">Watch on</h4>
            <div className="flex flex-wrap gap-1">
              {contentProvider.map((p) => (
                <a
                  key={p.name}
                  href={`${p.url}${encodeURIComponent(anime.title_english || anime.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleProviderClick(p.name)}
                  className="border px-2 py-1 rounded text-sm hover:bg-[var(--primary-color)]"
                >
                  {p.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Image Panel */}
      <div className="flex-1 relative overflow-hidden">
        {imgSrc && (
          <img src={imgSrc} alt={anime.title} loading="lazy" className="w-full h-full object-cover" />
        )}
      </div>
    </dialog>,
    portalRoot
  );
});

// ============================================
// MAIN EXPORT - Routes to correct version
// ============================================
const AnimeDetailsPanel = ({ anime, onClose }) => {
  if (!anime || !anime.mal_id) return null;
  
  // Use lightweight mobile version on small screens
  if (isMobile) {
    return <MobileAnimeDetails anime={anime} onClose={onClose} />;
  }
  
  return <DesktopAnimeDetails anime={anime} onClose={onClose} />;
};

export default memo(AnimeDetailsPanel);

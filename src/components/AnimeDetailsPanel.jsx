import React, { useState, useEffect, useCallback, useRef, lazy, Suspense, memo } from "react";
import ReactDOM from "react-dom";
import { Bookmark, X, Images, ChevronLeft, ChevronRight, Loader2, Play, ExternalLink } from "lucide-react";
import { contentProvider, formatNumber } from "../utils/utils";
import PageLoader, { MiniLoader, Spinner } from "../helperComponent/PageLoader";
import storageManager from "../utils/storageManager";
import { useToast } from "../utils/toast";

// Lazy-loaded components
const EpisodesList = lazy(() => import("../helperComponent/EpisodeList"));
const Badge = lazy(() => import("../helperComponent/Badge"));

// ============================================
// UNIFIED ANIME DETAILS PANEL
// ============================================
const AnimeDetailsPanel = memo(({ anime, onClose }) => {
  const { showToast } = useToast();
  const [portalRoot, setPortalRoot] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(() =>
    storageManager.isInWatchlist(anime?.mal_id)
  );
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const isMountedRef = useRef(true);

  // Gallery state - loads on demand
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Trailer state - loads on demand
  const [trailerData, setTrailerData] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [trailerExpanded, setTrailerExpanded] = useState(false);

  // Get portal root on mount
  useEffect(() => {
    isMountedRef.current = true;
    setPortalRoot(document.getElementById("modal-root") || document.body);
    return () => { isMountedRef.current = false; };
  }, []);

  // Update watchlist status when anime changes
  useEffect(() => {
    if (anime?.mal_id) {
      setIsInWatchlist(storageManager.isInWatchlist(anime.mal_id));
      
      if (!storageManager.isInStarted(anime.mal_id)) {
        storageManager.addToStarted(anime);
      }
    }
  }, [anime?.mal_id]);

  // Close on ESC
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

  // Fetch gallery images on demand
  const loadGallery = useCallback(async () => {
    if (galleryImages.length > 0 || galleryLoading || !anime?.mal_id) return;

    setGalleryLoading(true);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime/${anime.mal_id}/pictures`);
      if (res.ok && isMountedRef.current) {
        const data = await res.json();
        setGalleryImages(data.data || []);
        setGalleryExpanded(true);
      }
    } catch (err) {
      if (isMountedRef.current) showToast("Failed to load gallery", "error");
    } finally {
      if (isMountedRef.current) setGalleryLoading(false);
    }
  }, [anime?.mal_id, galleryImages.length, galleryLoading, showToast]);

  // Load trailer on demand - use embed_url from anime object if available
  const loadTrailer = useCallback(async () => {
    if (trailerData || trailerLoading || !anime?.mal_id) return;

    // Check if anime already has trailer embed_url or youtube_id
    if (anime.trailer?.embed_url || anime.trailer?.youtube_id) {
      setTrailerData(anime.trailer);
      setTrailerExpanded(true);
      return;
    }

    // Fallback: fetch from API if no trailer in anime object
    setTrailerLoading(true);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime/${anime.mal_id}/videos`);
      if (res.ok && isMountedRef.current) {
        const data = await res.json();
        const promo = data.data?.promo?.[0] || null;
        setTrailerData(promo?.trailer || null);
        setTrailerExpanded(true);
      }
    } catch (err) {
      if (isMountedRef.current) showToast("Failed to load trailer", "error");
    } finally {
      if (isMountedRef.current) setTrailerLoading(false);
    }
  }, [anime?.mal_id, anime?.trailer, trailerData, trailerLoading, showToast]);

  // Navigate gallery
  const nextImage = useCallback(() => {
    if (selectedImageIndex !== null && galleryImages.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
    }
  }, [selectedImageIndex, galleryImages.length]);

  const prevImage = useCallback(() => {
    if (selectedImageIndex !== null && galleryImages.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  }, [selectedImageIndex, galleryImages.length]);

  const toggleWatchlist = useCallback(() => {
    if (isInWatchlist) {
      storageManager.removeFromWatchlist(anime.mal_id);
      showToast("Removed from watchlist", "info");
    } else {
      storageManager.addToWatchlist(anime);
      showToast("Added to watchlist", "success");
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

  if (!anime || !anime.mal_id || !portalRoot) return null;

  const imgUrl = anime.images?.webp?.large_image_url || anime.images?.webp?.image_url || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const synopsis = anime.synopsis || "No synopsis available.";
  const shouldTruncate = synopsis.length > 400 && !synopsisExpanded;

  // Shared Details Content Component
  const DetailsContent = () => (
    <div className="space-y-4 md:space-y-5">
      {/* Title Section */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-bold leading-tight">{anime.title}</h1>
          <button
            type="button"
            onClick={toggleWatchlist}
            className="flex-shrink-0 p-2 rounded-full hover:bg-white/20 transition"
          >
            <Bookmark
              size={24}
              className={isInWatchlist ? "fill-[var(--primary-color)] text-[var(--primary-color)]" : ""}
            />
          </button>
        </div>
        {anime.title_english && anime.title_english !== anime.title && (
          <p className="text-sm text-gray-400 mt-1">{anime.title_english}</p>
        )}
        {anime.title_japanese && (
          <p className="text-xs text-gray-500 mt-0.5">{anime.title_japanese}</p>
        )}
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 text-xs">
        {anime.status && (
          <span className="bg-[var(--primary-color)] px-2.5 py-1 rounded-full font-medium">
            📺 {anime.status}
          </span>
        )}
        {anime.score && (
          <span className="bg-yellow-500 text-black px-2.5 py-1 rounded-full font-bold">
            ⭐ {anime.score}
          </span>
        )}
        {anime.rank && (
          <span className="bg-[var(--primary-color)] px-2.5 py-1 rounded-full font-medium">
            Rank #{anime.rank}
          </span>
        )}
        {anime.type && (
          <span className="bg-gray-700 px-2.5 py-1 rounded-full">{anime.type}</span>
        )}
        {anime.source && (
          <span className="bg-gray-700 px-2.5 py-1 rounded-full">{anime.source}</span>
        )}
        {anime.rating && (
          <span className="bg-gray-700 px-2.5 py-1 rounded-full">{anime.rating}</span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-gray-800/80 p-2.5 rounded-lg text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Episodes</p>
          <p className="font-bold text-sm">{anime.episodes || "TBA"}</p>
        </div>
        <div className="bg-gray-800/80 p-2.5 rounded-lg text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Score</p>
          <p className="font-bold text-sm text-yellow-400">{anime.score || "N/A"}</p>
        </div>
        <div className="bg-gray-800/80 p-2.5 rounded-lg text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Rank</p>
          <p className="font-bold text-sm">#{anime.rank || "—"}</p>
        </div>
        <div className="bg-gray-800/80 p-2.5 rounded-lg text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Popularity</p>
          <p className="font-bold text-sm">#{anime.popularity || "—"}</p>
        </div>
      </div>

      {/* More Stats Row */}
      <div className="flex flex-wrap justify-between text-xs text-gray-400 px-1 gap-2">
        <span>👥 {formatNumber(anime.members || 0)} members</span>
        <span>❤️ {formatNumber(anime.favorites || 0)} favorites</span>
        {anime.scored_by && <span>📊 {formatNumber(anime.scored_by)} votes</span>}
      </div>

      {/* Broadcast / Airing Info */}
      {(anime.broadcast?.string || anime.aired?.string || anime.duration) && (
        <div className="bg-gray-800/60 p-3 rounded-lg space-y-1">
          {anime.broadcast?.string && (
            <p className="text-sm">
              <span className="text-gray-400">📅 Broadcast:</span>{" "}
              <span className="text-white">{anime.broadcast.string}</span>
            </p>
          )}
          {anime.aired?.string && (
            <p className="text-sm">
              <span className="text-gray-400">🗓️ Aired:</span>{" "}
              <span className="text-white">{anime.aired.string}</span>
            </p>
          )}
          {anime.duration && (
            <p className="text-sm">
              <span className="text-gray-400">⏱️ Duration:</span>{" "}
              <span className="text-white">{anime.duration}</span>
            </p>
          )}
          {anime.season && anime.year && (
            <p className="text-sm">
              <span className="text-gray-400">🌸 Season:</span>{" "}
              <span className="text-white capitalize">{anime.season} {anime.year}</span>
            </p>
          )}
        </div>
      )}

      {/* Trailer Section - On Demand */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-300">Trailer</h3>
          {!trailerExpanded && (
            <button
              type="button"
              onClick={loadTrailer}
              disabled={trailerLoading}
              className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              {trailerLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Play size={14} />
                  Watch Trailer
                </>
              )}
            </button>
          )}
        </div>

        {trailerExpanded && (trailerData?.embed_url || trailerData?.youtube_id) && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900">
            <iframe
              src={trailerData.embed_url || `https://www.youtube.com/embed/${trailerData.youtube_id}`}
              title="Trailer"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {trailerExpanded && !trailerData?.embed_url && !trailerData?.youtube_id && !trailerLoading && (
          <p className="text-xs text-gray-500 text-center py-4 bg-gray-800/40 rounded-lg">
            No trailer available for this anime
          </p>
        )}
      </div>

      {/* Synopsis with expand/collapse */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Synopsis</h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          {shouldTruncate ? `${synopsis.slice(0, 400)}...` : synopsis}
        </p>
        {synopsis.length > 400 && (
          <button
            type="button"
            onClick={() => setSynopsisExpanded(!synopsisExpanded)}
            className="text-[var(--primary-color)] text-sm mt-2 font-medium hover:underline"
          >
            {synopsisExpanded ? "Show less ↑" : "Read more ↓"}
          </button>
        )}
      </div>

      {/* Episodes List */}
      <Suspense fallback={<MiniLoader text="Loading episodes..." />}>
        <EpisodesList animeId={anime.mal_id} />
      </Suspense>

      {/* Genres */}
      {anime.genres?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Genres</h3>
          <div className="flex flex-wrap gap-1.5">
            <Suspense fallback={<Spinner size={14} />}>
              {anime.genres.map((g) => (
                <Badge key={g.mal_id}>{g.name}</Badge>
              ))}
            </Suspense>
          </div>
        </div>
      )}

      {/* Themes */}
      {anime.themes?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Themes</h3>
          <div className="flex flex-wrap gap-1.5">
            {anime.themes.map((t) => (
              <span key={t.mal_id} className="text-xs bg-purple-900/50 px-2.5 py-1 rounded-full border border-purple-700/50">
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Demographics */}
      {anime.demographics?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Demographics</h3>
          <div className="flex flex-wrap gap-1.5">
            {anime.demographics.map((d) => (
              <span key={d.mal_id} className="text-xs bg-blue-900/50 px-2.5 py-1 rounded-full border border-blue-700/50">
                {d.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Studios */}
      {anime.studios?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Studios</h3>
          <div className="flex flex-wrap gap-2">
            {anime.studios.map((s) => (
              <a
                key={s.mal_id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] transition"
              >
                🎬 {s.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Producers */}
      {anime.producers?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Producers</h3>
          <div className="flex flex-wrap gap-1.5">
            {anime.producers.slice(0, 6).map((p) => (
              <span key={p.mal_id} className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                {p.name}
              </span>
            ))}
            {anime.producers.length > 6 && (
              <span className="text-xs text-gray-500">+{anime.producers.length - 6} more</span>
            )}
          </div>
        </div>
      )}

      {/* Licensors */}
      {anime.licensors?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Licensors</h3>
          <div className="flex flex-wrap gap-1.5">
            {anime.licensors.map((l) => (
              <span key={l.mal_id} className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                {l.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Section - On Demand */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-300">Gallery</h3>
          {!galleryExpanded && (
            <button
              type="button"
              onClick={loadGallery}
              disabled={galleryLoading}
              className="flex items-center gap-1.5 text-xs bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-700 transition disabled:opacity-50"
            >
              {galleryLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Images size={14} />
                  View Gallery
                </>
              )}
            </button>
          )}
        </div>

        {/* Gallery thumbnails - horizontal scroll */}
        {galleryExpanded && galleryImages.length > 0 && (
          <div className="relative">
            <div
              className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={img.jpg?.image_url || img.webp?.image_url || `gallery-${idx}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className="flex-shrink-0 w-20 h-28 md:w-24 md:h-32 rounded-lg overflow-hidden border-2 border-transparent hover:border-[var(--primary-color)] transition"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <img
                    src={img.jpg?.image_url || img.webp?.small_image_url}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {galleryImages.length} images • Tap to view full size
            </p>
          </div>
        )}

        {galleryExpanded && galleryImages.length === 0 && !galleryLoading && (
          <p className="text-xs text-gray-500 text-center py-4 bg-gray-800/40 rounded-lg">
            No gallery images available
          </p>
        )}
      </div>

      {/* Watch providers */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Watch On</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {contentProvider.map((p) => (
            <a
              key={p.name}
              href={`${p.url}${encodeURIComponent(anime.title_english || anime.title)}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleProviderClick(p.name)}
              className="flex items-center justify-center gap-2 text-sm bg-[var(--primary-color)] px-3 py-2.5 rounded-lg font-medium hover:opacity-90 transition"
            >
              ▶️ {p.name}
            </a>
          ))}
        </div>
      </div>

      {/* MAL Link */}
      {anime.url && (
        <a
          href={anime.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-[var(--primary-color)] hover:underline py-2"
        >
          <ExternalLink size={14} />
          View on MyAnimeList
        </a>
      )}
    </div>
  );

  return ReactDOM.createPortal(
    <dialog
      id="anime-details-backdrop"
      open
      className="
  fixed inset-0 z-[9999] m-0 p-0 max-w-none max-h-none w-full h-full bg-[var(--bg-color)] text-[var(--text-color)]"
      onClick={handleBackdropClick}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      {/* Close button */}
      <button
        type="button"
        className="absolute right-3 top-3 md:right-4 md:top-4 w-10 h-10 flex justify-center items-center rounded-full bg-black/60 text-white text-xl hover:bg-white/20 transition z-50"
        onClick={onClose}
      >
        <X size={24} />
      </button>

      {/* Layout Container - Stack on mobile, side-by-side on desktop */}
      <div className="h-full flex flex-col md:flex-row overflow-hidden">

        {/* Image Panel - Top on mobile, Right on desktop */}
        <div className="relative h-[35vh] md:h-full md:flex-1 md:order-2 flex-shrink-0 overflow-hidden">
          {imgUrl && (
            <>
              <img
                src={imgUrl}
                alt={anime.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent md:bg-gradient-to-l md:from-black/60 md:via-transparent md:to-transparent" />

              {/* Score badge on image */}
              {anime.score && (
                <div className="absolute top-3 left-20 bg-yellow-500 text-black font-bold px-3 py-1.5 rounded-full text-sm shadow-lg">
                  ⭐ {anime.score}
                </div>
              )}

              {/* Rank badge */}
              {anime.rank && (
                <div className="absolute top-3 left-3 bg-[var(--primary-color)] text-white font-bold px-3 py-1.5 rounded-full text-sm shadow-lg">
                  #{anime.rank}
                </div>
              )}
            </>
          )}
        </div>

        {/* Details Panel - Bottom on mobile, Left on desktop */}
        <div
          className="flex-1 md:w-[45%] md:max-w-[800px] md:order-1 overflow-y-auto
    text-[var(--text-primary)]
    bg-[var(--panel-bg)]
  "
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="p-4 md:p-6 pb-20 md:pb-6">
            <DetailsContent />
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {selectedImageIndex !== null && galleryImages[selectedImageIndex] && (
        <dialog
          open
          className="fixed inset-0 z-[10000] bg-black flex flex-col m-0 p-0 max-w-none max-h-none w-full h-full border-none"
          onClick={() => setSelectedImageIndex(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSelectedImageIndex(null);
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
          }}
        >
          {/* Viewer Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-3 bg-black/80">
            <span className="text-sm text-gray-400">
              {selectedImageIndex + 1} / {galleryImages.length}
            </span>
            <button
              type="button"
              onClick={() => setSelectedImageIndex(null)}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Image */}
          <div
            className="flex-1 flex items-center justify-center p-4 relative"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {/* Previous button */}
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/80 transition z-10"
            >
              <ChevronLeft size={28} />
            </button>

            <img
              src={galleryImages[selectedImageIndex].jpg?.large_image_url || galleryImages[selectedImageIndex].jpg?.image_url}
              alt={`Full size ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {/* Next button */}
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/80 transition z-10"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="flex-shrink-0 py-2 px-4 bg-black/80">
            <div
              className="flex gap-2 overflow-x-auto justify-center"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={img.jpg?.image_url || img.webp?.image_url || `thumb-${idx}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(idx);
                  }}
                  className={`flex-shrink-0 w-12 h-16 rounded overflow-hidden transition ${idx === selectedImageIndex
                    ? 'ring-2 ring-[var(--primary-color)] opacity-100'
                    : 'opacity-50 hover:opacity-80'
                    }`}
                >
                  <img
                    src={img.jpg?.small_image_url || img.jpg?.image_url}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </dialog>
      )}
    </dialog>,
    portalRoot
  );
});

export default AnimeDetailsPanel;

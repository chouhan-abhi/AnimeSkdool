import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  lazy,
  Suspense,
  memo,
} from "react";
import ReactDOM from "react-dom";
import { Bookmark } from "lucide-react";
import { contentProvider, formatNumber } from "../utils/utils";
import PageLoader from "../helperComponent/PageLoader";
import storageManager from "../utils/storageManager";
import { useToast } from "../utils/toast";

// Lazy-loaded components
const EpisodesList = lazy(() => import("../helperComponent/EpisodeList"));
const Badge = lazy(() => import("../helperComponent/Badge"));

// Memoized stat block - moved outside to prevent recreation
const StatBlock = memo(({ label, value }) => (
  <div className="p-2 rounded-lg bg-black/40 text-center">
    <p className="text-xs">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
));

const AnimeDetailsPanel = ({ anime, onClose }) => {
  const { showToast } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [portalRoot, setPortalRoot] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [showImage, setShowImage] = useState(false);

  const resizeTimeout = useRef(null);
  const imageTimeout = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Clear all timeouts on unmount
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current);
        resizeTimeout.current = null;
      }
      if (imageTimeout.current) {
        clearTimeout(imageTimeout.current);
        imageTimeout.current = null;
      }
    };
  }, []);

  // Preload heavy components lazily
  useEffect(() => {
    requestIdleCallback?.(() => {
      import("../helperComponent/EpisodeList");
      import("../helperComponent/Badge");
    });
  }, []);

  // Setup portal - only once on mount
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    try {
      const root = document.getElementById("modal-root") || document.body;
      setPortalRoot(root);
    } catch (error) {
      console.error("Error in portal setup:", error);
      setPortalRoot(document.body);
    }
  }, []);

  // Update watchlist status when anime changes
  useEffect(() => {
    if (!isMountedRef.current) return;
    try {
      const inWatchlist = storageManager.isInWatchlist(anime.mal_id);
      setIsInWatchlist(inWatchlist);
    } catch (error) {
      console.error("Error checking watchlist:", error);
    }
  }, [anime.mal_id]);

  // Separate resize handler to prevent recreation
  useEffect(() => {
    if (!isMountedRef.current) return;

    const handleResize = () => {
      if (!isMountedRef.current) return;
      clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(() => {
        if (isMountedRef.current) {
          setIsLargeScreen(window.innerWidth >= 1024);
        }
      }, 300);
    };
    
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout.current);
    };
  }, []);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc, { passive: false });
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Lazy show image to reduce GPU pressure - with cleanup to prevent memory leak
  useEffect(() => {
    imageTimeout.current = setTimeout(() => {
      if (isMountedRef.current) {
        setShowImage(true);
      }
    }, 100);

    return () => {
      if (imageTimeout.current) {
        clearTimeout(imageTimeout.current);
        imageTimeout.current = null;
      }
    };
  }, []);

  // Toggle watchlist
  const toggleWatchlist = useCallback(() => {
    if (isInWatchlist) {
      storageManager.removeFromWatchlist(anime.mal_id);
      showToast(`Removed ${anime.title} from watchlist`, "info");
    } else {
      storageManager.addToWatchlist(anime);
      showToast(`📚 ${anime.title} added to watchlist`, "success");
    }
    setIsInWatchlist(!isInWatchlist);
  }, [isInWatchlist, anime, showToast]);

  // Streaming provider click
  const handleProviderClick = useCallback(
    (providerName) => {
      storageManager.saveToWatchlist(anime, true);
      if (!isInWatchlist) setIsInWatchlist(true);
      showToast(`🎬 Started watching ${anime.title} on ${providerName}`, "success");
    },
    [anime, isInWatchlist, showToast]
  );

  // Memoize backdrop click handler
  const handleBackdropClick = useCallback((e) => {
    if (e.target.id === "anime-details-backdrop") onClose();
  }, [onClose]);

  // Memoize image source to prevent recalculation on every render
  const imageSrc = useMemo(() => {
    if (!anime?.images) return null;
    if (isLargeScreen) {
      return anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.images?.webp?.image_url || anime.images?.jpg?.image_url;
    }
    return anime.images?.webp?.small_image_url || anime.images?.jpg?.small_image_url || anime.images?.webp?.image_url || anime.images?.jpg?.image_url;
  }, [isLargeScreen, anime?.images]);

  // Render details content - memoized to prevent recreation
  const renderDetailsContent = useCallback(() => {
    if (!anime) return null;
    return (
    <div className="space-y-4">
      {/* Title & Bookmark */}
      <div className="flex items-center gap-3">
        <h2 id="anime-title" className="text-2xl font-bold">{anime.title}</h2>
        <button
          type="button"
          onClick={toggleWatchlist}
          className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-white/20 transition"
        >
          <Bookmark
            size={24}
            className={`${
              isInWatchlist
                ? "fill-[var(--primary-color)] text-[var(--primary-color)]"
                : "text-[var(--text-color)]"
            }`}
          />
        </button>
      </div>
      {anime.title_english && <p className="text-sm italic">{anime.title_english}</p>}
      {anime.title_japanese && <p className="text-sm italic">{anime.title_japanese}</p>}

      {/* Status & Stats */}
      <div className="flex flex-wrap gap-2">
        {anime.status && <span className="bg-[var(--primary-color)] text-white px-2 py-1 rounded-full text-xs">📺 {anime.status}</span>}
        {anime.score && <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">⭐ {anime.score} ({anime.scored_by || 0})</span>}
        {anime.rank && <span className="bg-[var(--primary-color)] text-white px-2 py-1 rounded-full text-xs">Rank #{anime.rank}</span>}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatBlock label="Popularity" value={`#${anime.popularity}`} />
        <StatBlock label="Members" value={formatNumber(anime.members)} />
        <StatBlock label="Favorites" value={formatNumber(anime.favorites)} />
        <StatBlock label="Episodes" value={anime.episodes || "TBA"} />
      </div>

      <p className="leading-relaxed">{anime.synopsis || "No synopsis available."}</p>

      {/* Lazy-load episodes */}
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

      {/* Studios / Producers */}
      {["studios", "producers"].map((key) => {
        const section = anime[key];
        if (!section?.length) return null;
        return (
          <div key={key}>
            <h4 className="font-semibold mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
            <div className="flex flex-wrap gap-1">
              {section.map((item) => (
                <a key={item.mal_id} href={item.url} target="_blank" rel="noreferrer" className="border px-2 py-1 rounded text-sm hover:bg-[var(--primary-color)]">
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        );
      })}

      {/* Watch providers */}
      <h4 className="font-semibold mb-1">Watch it on</h4>
      <div className="flex flex-wrap gap-1">
        {contentProvider.map((provider) => (
          <a
            key={provider.name}
            href={`${provider.url}${encodeURIComponent(anime.title_english || anime.title || anime.title_japanese)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => handleProviderClick(provider.name)}
            className="border px-2 py-1 rounded text-sm hover:bg-[var(--primary-color)]"
          >
            {provider.name}
          </a>
        ))}
      </div>
    </div>
    );
  }, [anime, isInWatchlist, toggleWatchlist, handleProviderClick]);

  // Early return if no anime data or portal root - AFTER all hooks
  if (!anime || !anime.mal_id || !portalRoot || !isMountedRef.current) {
    if (!anime || !anime.mal_id) {
      console.warn("AnimeDetailsPanel: No anime data provided");
    }
    return null;
  }

  try {
    return ReactDOM.createPortal(
      <div
        id="anime-details-backdrop"
        className={`fixed inset-0 z-[9999] flex ${isLargeScreen ? "flex-row bg-black/80" : "flex-col bg-black/90"}`}
        onClick={handleBackdropClick}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        {/* Close button */}
        <button
          type="button"
          className="absolute right-4 top-4 w-10 h-10 flex justify-center items-center rounded-full bg-black/60 text-white text-xl hover:bg-white/20 transition z-50"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          ×
        </button>

        {/* Desktop Layout */}
        {isLargeScreen && (
          <>
            <div className="w-[40%] max-w-[720px] p-6 overflow-y-auto text-white">
              {renderDetailsContent()}
            </div>
            <div className="flex-1 relative overflow-hidden">
              {showImage && imageSrc && (
                <img 
                  src={imageSrc} 
                  alt={anime.title} 
                  loading="lazy" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (e.target) {
                      e.target.style.display = 'none';
                    }
                  }}
                />
              )}
            </div>
          </>
        )}

        {/* Mobile Layout - Simplified for stability */}
        {!isLargeScreen && (
          <div 
            className="flex flex-col w-full h-full"
            style={{ 
              maxHeight: '100vh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {showImage && imageSrc && (
              <div className="w-full h-[25vh] min-h-[120px] flex-shrink-0 overflow-hidden">
                <img 
                  src={imageSrc} 
                  alt={anime.title || 'Anime'} 
                  loading="lazy" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (e.target) {
                      e.target.style.display = 'none';
                    }
                  }}
                  onLoad={() => {
                    // Image loaded successfully
                  }}
                />
              </div>
            )}
            <div className="text-white p-3 flex-1 min-h-0">
              {renderDetailsContent()}
            </div>
          </div>
        )}
      </div>,
      portalRoot
    );
  } catch (error) {
    console.error("AnimeDetailsPanel render error:", error);
    return null;
  }
};

export default memo(AnimeDetailsPanel);

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
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

// ✅ Lazy load heavy subcomponents
const EpisodesList = lazy(() => import("../helperComponent/EpisodeList"));
const Badge = lazy(() => import("../helperComponent/Badge"));

const AnimeDetailsPanel = ({ anime, onClose }) => {
  const { showToast } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [portalRoot, setPortalRoot] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [isExpanded, setIsExpanded] = useState(false);

  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const resizeTimeout = useRef(null);

  // 🧠 Lazy preloading of subcomponents (improves subsequent loads)
  useEffect(() => {
    requestIdleCallback?.(() => {
      import("../helperComponent/EpisodeList");
      import("../helperComponent/Badge");
    });
  }, []);

  // 🖼️ Preload portal and watchlist
  useEffect(() => {
    const root = document.getElementById("modal-root");
    setPortalRoot(root);

    setIsInWatchlist(storageManager.isInWatchlist(anime.mal_id));

    const handleResize = () => {
      clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(() => {
        setIsLargeScreen(window.innerWidth >= 1024);
      }, 150);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout.current);
    };
  }, [anime.mal_id]);

  // ⌨️ Close with ESC key
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // 📱 Swipe gestures for mobile expand/collapse
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = () => {
    const delta = touchStartY.current - touchEndY.current;
    if (delta > 50) setIsExpanded(true);
    else if (delta < -50) setIsExpanded(false);
  };

  // ⭐ Watchlist toggle (memoized)
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

  // 🎬 Mark anime as started when user clicks on streaming provider
  const handleProviderClick = useCallback((providerName) => {
    // Mark anime as started (starred) in watchlist
    storageManager.saveToWatchlist(anime, true);
    
    // Update local state if not already in watchlist
    if (!isInWatchlist) {
      setIsInWatchlist(true);
    }
    
    // Show toast notification
    showToast(`🎬 Started watching ${anime.title} on ${providerName}`, "success");
  }, [anime, isInWatchlist, showToast]);

  if (!portalRoot) return null;

  // 🧩 Memoized stats block - optimized for mobile
  const StatBlock = memo(({ label, value, isLargeScreen: isLarge }) => (
    <div
      className="p-2 rounded-lg bg-black/40 text-center"
      style={isLarge ? { backdropFilter: "blur(4px)" } : {}}
    >
      <p className="text-xs">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  ));

  const renderDetails = () => (
    <div className="overflow-y-auto h-full space-y-6">
      {/* Titles + Bookmark */}
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-4xl font-bold">{anime.title}</h2>
        <button
          type="button"
          onClick={toggleWatchlist}
          className="w-10 h-10 flex justify-center items-center rounded-full hover:bg-white/20 transition"
          style={isLargeScreen ? { backdropFilter: "blur(4px)" } : {}}
        >
          <Bookmark
            size={32}
            className={`p-[4px] ${
              isInWatchlist
                ? "fill-[var(--primary-color)] text-[var(--primary-color)]"
                : "text-white"
            }`}
          />
        </button>
      </div>

      {anime.title_english && <p className="text-sm italic">{anime.title_english}</p>}
      {anime.title_japanese && <p className="text-sm italic">{anime.title_japanese}</p>}

      {/* Status + Stats */}
      <div className="flex flex-wrap gap-3 my-4">
        {anime.status && (
          <span className="bg-[var(--primary-color)] text-white text-xs px-2 py-1 rounded-full font-semibold">
            📺 {anime.status}
          </span>
        )}
        {anime.score && (
          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            ⭐ {anime.score} ({anime.scored_by || 0} users)
          </span>
        )}
        {anime.rank && (
          <span className="bg-[var(--primary-color)] text-white text-xs px-2 py-1 rounded-full font-semibold">
            Rank #{anime.rank}
          </span>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatBlock label="Popularity" value={`#${anime.popularity}`} isLargeScreen={isLargeScreen} />
        <StatBlock label="Members" value={formatNumber(anime.members)} isLargeScreen={isLargeScreen} />
        <StatBlock label="Favorites" value={formatNumber(anime.favorites)} isLargeScreen={isLargeScreen} />
        <StatBlock label="Episodes" value={anime.episodes || "TBA"} isLargeScreen={isLargeScreen} />
      </div>

      <p className="mb-4 leading-relaxed">
        {anime.synopsis || "No synopsis available."}
      </p>

      {/* Lazy load EpisodesList */}
      <Suspense fallback={<PageLoader />}>
        <EpisodesList animeId={anime.mal_id} />
      </Suspense>

      <div
        className={`p-4 bg-black/40 rounded-lg mb-6 ${isLargeScreen ? "backdrop-blur-md" : ""}`}
      >
        {anime.genres?.length > 0 && (
          <>
            <h4 className="font-semibold text-lg mb-2">Genres</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              <Suspense fallback={<span>Loading...</span>}>
                {anime.genres.map((g) => (
                  <Badge key={g.mal_id}>{g.name}</Badge>
                ))}
              </Suspense>
            </div>
          </>
        )}

        {/* Studios / Producers */}
        {["studios", "producers"].map((key) => {
          const section = anime[key];
          if (!section?.length) return null;
          return (
            <div key={key} className="mb-6">
              <h4 className="font-semibold text-lg mb-2">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </h4>
              <div className="flex flex-wrap gap-3">
                {section.map((item) => (
                  <a
                    key={item.mal_id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-gray-600 text-center px-4 py-2 rounded-lg transition hover:bg-[var(--primary-color)]"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          );
        })}

        {/* Trailer */}
        {anime.trailer?.embed_url && (
          <>
            <h4 className="font-semibold text-lg mb-2">Trailer</h4>
            <iframe
              src={`${anime.trailer.embed_url}&mute=1`}
              title="Anime Trailer"
              width="100%"
              height="315"
              allow="encrypted-media"
              allowFullScreen
              className="rounded-lg mb-6"
            />
          </>
        )}

        {/* Watch it on */}
        <h4 className="font-semibold text-lg mb-2">Watch it on</h4>
        <div className="flex flex-wrap gap-3 mb-6">
          {contentProvider.map((provider) => (
            <a
              key={provider.name}
              href={`${provider.url}${encodeURIComponent(
                anime.title_english || anime.title || anime.title_japanese
              )}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleProviderClick(provider.name)}
              className="border border-gray-600 text-center px-4 py-2 rounded-lg transition hover:bg-[var(--primary-color)]"
            >
              {provider.name}
            </a>
          ))}
        </div>
      </div>

      {/* External link */}
      {anime.url && (
        <div className="mt-4 flex justify-end">
          <a
            href={anime.url}
            target="_blank"
            rel="noreferrer"
            className="underline font-medium mr-4 border border-gray-600 rounded-lg transition hover:bg-[var(--primary-color)] px-4 py-2 text-[var(--primary-color)]"
          >
            View on MAL →
          </a>
        </div>
      )}
    </div>
  );

  const handleBackdropClick = (e) => {
    // Only close if clicking directly on backdrop, not on child elements
    if (e.target.id === "anime-details-backdrop") {
      onClose();
    }
  };

  const handleBackdropKeyDown = (e) => {
    // Escape key is already handled by the useEffect above
    // This handler exists to satisfy accessibility requirements
    if (e.key === 'Escape' && e.target.id === "anime-details-backdrop") {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div
      id="anime-details-backdrop"
      className={`fixed inset-0 w-screen h-screen z-[9999] flex ${
        isLargeScreen 
          ? "flex-row bg-black/80 backdrop-blur-sm" 
          : "flex-col bg-black/70"
      } overflow-hidden`}
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      style={!isLargeScreen ? { contain: "layout style paint" } : {}}
    >
      {/* Close Button */}
      <button
        type="button"
        className="absolute right-6 top-6 w-14 h-14 flex justify-center items-center cursor-pointer z-[100] p-3 bg-black/40 rounded-full hover:bg-white/20 transition text-4xl font-light"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }
        }}
        style={isLargeScreen 
          ? { backdropFilter: "blur(6px)", pointerEvents: "auto" }
          : { pointerEvents: "auto", backgroundColor: "rgba(0,0,0,0.6)" }
        }
      >
        ×
      </button>

      {/* Desktop Layout: Details Panel on Left */}
      {isLargeScreen && (
        <>
          {/* Details Panel - Left Side */}
          <div 
            className="relative z-10 w-[40%] max-w-[720px] p-10 overflow-y-auto text-white animate-slideIn"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            style={{ 
              pointerEvents: "auto",
              willChange: "transform",
              transform: "translateZ(0)"
            }}
          >
            {renderDetails()}
          </div>

          {/* Image Panel - Right Side */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src={anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.images?.webp?.image_url || anime.images?.jpg?.image_url}
              alt={anime.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ 
                pointerEvents: "none",
                willChange: "transform",
                transform: "translateZ(0)"
              }}
            />
            <div 
              className="absolute inset-0 bg-gradient-to-l from-black/20 via-black/50 to-black/90"
              style={{ pointerEvents: "none" }}
            />
          </div>
        </>
      )}

      {/* Mobile Layout: Image on Top, Details Below - Optimized for GPU */}
      {!isLargeScreen && (
        <div
          className="flex flex-col w-full h-full overflow-hidden"
          style={{ 
            top: isExpanded ? "0" : "50vh", 
            height: "100vh",
            contain: "layout style paint",
            willChange: "transform"
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {/* Image Header - Top Section - Optimized */}
          <div 
            className="relative w-full h-[40vh] min-h-[300px] flex-shrink-0 overflow-hidden"
            style={{ contain: "layout style paint" }}
          >
            <img
              src={anime.images?.webp?.image_url || anime.images?.jpg?.image_url || anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url}
              alt={anime.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ 
                pointerEvents: "none",
                transform: "translateZ(0)",
                imageRendering: "auto"
              }}
            />
            {/* Simplified gradient for mobile - single solid overlay */}
            <div 
              className="absolute inset-0 bg-black/60"
              style={{ pointerEvents: "none" }}
            />
          </div>

          {/* Details Panel - Bottom Section - Optimized */}
          <div 
            className="relative z-10 flex-1 overflow-y-auto text-white p-6"
            style={{ 
              contain: "layout style",
              WebkitOverflowScrolling: "touch"
            }}
          >
            {/* Simplified solid background for mobile - no gradients */}
            <div 
              className="absolute inset-0 z-0 bg-black/85"
              style={{ pointerEvents: "none" }}
            />
            
            {/* Foreground content */}
            <div 
              className="relative z-10" 
              style={{ 
                pointerEvents: "auto",
                contain: "layout style"
              }}
            >
              {renderDetails()}
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(-100%) translateZ(0); opacity: 0; }
            to { transform: translateX(0) translateZ(0); opacity: 1; }
          }
          .animate-slideIn {
            animation: slideIn 0.4s ease-out forwards;
            will-change: transform;
          }
          ${!isLargeScreen ? `
            /* Mobile optimizations - reduce repaints */
            #anime-details-backdrop * {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
          ` : ''}
        `}
      </style>
    </div>,
    portalRoot
  );
};

export default memo(AnimeDetailsPanel);

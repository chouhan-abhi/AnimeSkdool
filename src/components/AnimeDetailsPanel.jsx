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

// Lazy-loaded components
const EpisodesList = lazy(() => import("../helperComponent/EpisodeList"));
const Badge = lazy(() => import("../helperComponent/Badge"));

const AnimeDetailsPanel = ({ anime, onClose }) => {
  const { showToast } = useToast();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [portalRoot, setPortalRoot] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const resizeTimeout = useRef(null);
  const touchTimeout = useRef(null);

  // Preload heavy components lazily
  useEffect(() => {
    requestIdleCallback?.(() => {
      import("../helperComponent/EpisodeList");
      import("../helperComponent/Badge");
    });
  }, []);

  // Setup portal and watchlist
  useEffect(() => {
    try {
      const root = document.getElementById("modal-root");
      setPortalRoot(root || document.body);

      setIsInWatchlist(storageManager.isInWatchlist(anime.mal_id));

      const handleResize = () => {
        clearTimeout(resizeTimeout.current);
        resizeTimeout.current = setTimeout(() => {
          setIsLargeScreen(window.innerWidth >= 1024);
        }, 200);
      };
      window.addEventListener("resize", handleResize, { passive: true });

      return () => {
        window.removeEventListener("resize", handleResize);
        clearTimeout(resizeTimeout.current);
        if (touchTimeout.current) clearTimeout(touchTimeout.current);
      };
    } catch (error) {
      console.error("Error in portal setup:", error);
    }
  }, [anime.mal_id]);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc, { passive: false });
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Lazy show image to reduce GPU pressure
  useEffect(() => {
    setTimeout(() => setShowImage(true), 100);
  }, []);

  // Swipe gestures for mobile expand/collapse
  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEndY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchTimeout.current) clearTimeout(touchTimeout.current);
    touchTimeout.current = setTimeout(() => {
      const delta = touchStartY.current - touchEndY.current;
      if (Math.abs(delta) > 50) {
        setIsExpanded(delta > 50);
      }
    }, 50);
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

  if (!portalRoot) return null;

  // Memoized stat block
  const StatBlock = memo(({ label, value }) => (
    <div className="p-2 rounded-lg bg-black/40 text-center">
      <p className="text-xs">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  ));

  const renderDetails = () => (
    <div className="space-y-4">
      {/* Title & Bookmark */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">{anime.title}</h2>
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
                : "text-white"
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

  const handleBackdropClick = (e) => {
    if (e.target.id === "anime-details-backdrop") onClose();
  };

  // Determine image source based on screen
  const imageSrc = isLargeScreen
    ? anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url
    : anime.images?.webp?.small_image_url || anime.images?.jpg?.small_image_url;

  try {
    return ReactDOM.createPortal(
      <div
        id="anime-details-backdrop"
        className={`fixed inset-0 z-[9999] flex ${isLargeScreen ? "flex-row bg-black/80" : "flex-col bg-black/90"}`}
        onClick={handleBackdropClick}
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
            <div className="w-[40%] max-w-[720px] p-6 overflow-y-auto text-white">{renderDetails()}</div>
            <div className="flex-1 relative overflow-hidden">
              {showImage && (
                <img src={imageSrc} alt={anime.title} loading="lazy" className="w-full h-full object-cover"/>
              )}
            </div>
          </>
        )}

        {/* Mobile Layout */}
        {!isLargeScreen && (
          <div className="flex flex-col w-full overflow-auto p-2">
            {showImage && (
              <div className="w-full h-[30vh] min-h-[150px] overflow-hidden">
                <img src={imageSrc} alt={anime.title} loading="lazy" className="w-full h-full object-cover"/>
              </div>
            )}
            <div className="text-white p-2">{renderDetails()}</div>
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

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
  const touchTimeout = useRef(null);

  // Lazy preload
  useEffect(() => {
    requestIdleCallback?.(() => {
      import("../helperComponent/EpisodeList");
      import("../helperComponent/Badge");
    });
  }, []);

  // Portal & watchlist setup
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
      console.error("Portal setup error:", error);
    }
  }, [anime.mal_id]);

  // ESC key close
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Touch gestures for mobile
  const handleTouchStart = useCallback((e) => { touchStartY.current = e.touches[0].clientY; }, []);
  const handleTouchMove = useCallback((e) => { e.preventDefault(); touchEndY.current = e.touches[0].clientY; }, []);
  const handleTouchEnd = useCallback(() => {
    if (touchTimeout.current) clearTimeout(touchTimeout.current);
    touchTimeout.current = setTimeout(() => {
      const delta = touchStartY.current - touchEndY.current;
      if (Math.abs(delta) > 50) setIsExpanded(delta > 50);
    }, 50);
  }, []);

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

  const handleProviderClick = useCallback(
    (providerName) => {
      storageManager.saveToWatchlist(anime, true);
      if (!isInWatchlist) setIsInWatchlist(true);
      showToast(`🎬 Started watching ${anime.title} on ${providerName}`, "success");
    },
    [anime, isInWatchlist, showToast]
  );

  if (!portalRoot) return null;

  const StatBlock = memo(({ label, value }) => (
    <div className="p-2 rounded-lg bg-black/50 text-center">
      <p className="text-xs">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  ));

  const renderDetails = () => (
    <div className="space-y-4">
      {/* Titles + Bookmark */}
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold">{anime.title}</h2>
        <button
          onClick={toggleWatchlist}
          className="w-10 h-10 flex justify-center items-center rounded-full bg-black/60 hover:bg-black/70 transition"
        >
          <Bookmark
            size={28}
            className={`p-[2px] ${isInWatchlist ? "fill-[var(--primary-color)] text-[var(--primary-color)]" : "text-white"}`}
          />
        </button>
      </div>

      {anime.title_english && <p className="text-sm italic">{anime.title_english}</p>}
      {anime.title_japanese && <p className="text-sm italic">{anime.title_japanese}</p>}

      <div className="flex flex-wrap gap-2 my-2">
        {anime.status && <span className="bg-[var(--primary-color)] text-white text-xs px-2 py-1 rounded-full font-semibold">📺 {anime.status}</span>}
        {anime.score && <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">⭐ {anime.score} ({anime.scored_by || 0})</span>}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatBlock label="Popularity" value={`#${anime.popularity}`} />
        <StatBlock label="Members" value={formatNumber(anime.members)} />
        <StatBlock label="Favorites" value={formatNumber(anime.favorites)} />
        <StatBlock label="Episodes" value={anime.episodes || "TBA"} />
      </div>

      <p className="leading-relaxed">{anime.synopsis || "No synopsis available."}</p>

      <Suspense fallback={<PageLoader />}>
        <EpisodesList animeId={anime.mal_id} />
      </Suspense>

      {anime.genres?.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-lg mb-2">Genres</h4>
          <div className="flex flex-wrap gap-2">
            <Suspense fallback={<span>Loading...</span>}>
              {anime.genres.map((g) => <Badge key={g.mal_id}>{g.name}</Badge>)}
            </Suspense>
          </div>
        </div>
      )}

      {["studios", "producers"].map((key) => {
        const section = anime[key];
        if (!section?.length) return null;
        return (
          <div key={key} className="mb-4">
            <h4 className="font-semibold text-lg mb-2">{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
            <div className="flex flex-wrap gap-2">
              {section.map((item) => (
                <a key={item.mal_id} href={item.url} target="_blank" rel="noreferrer" className="border border-gray-600 text-center px-3 py-1 rounded-lg transition hover:bg-[var(--primary-color)]">{item.name}</a>
              ))}
            </div>
          </div>
        );
      })}

      {anime.trailer?.embed_url && (
        <>
          <h4 className="font-semibold text-lg mb-2">Trailer</h4>
          <iframe src={`${anime.trailer.embed_url}&mute=1`} title="Anime Trailer" width="100%" height="215" allowFullScreen className="rounded-lg mb-4" />
        </>
      )}

      <h4 className="font-semibold text-lg mb-2">Watch it on</h4>
      <div className="flex flex-wrap gap-2 mb-4">
        {contentProvider.map((provider) => (
          <a
            key={provider.name}
            href={`${provider.url}${encodeURIComponent(anime.title_english || anime.title || anime.title_japanese)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => handleProviderClick(provider.name)}
            className="border border-gray-600 text-center px-3 py-1 rounded-lg transition hover:bg-[var(--primary-color)]"
          >
            {provider.name}
          </a>
        ))}
      </div>
    </div>
  );

  const handleBackdropClick = (e) => { if (e.target.id === "anime-details-backdrop") onClose(); };

  return ReactDOM.createPortal(
    <div
      id="anime-details-backdrop"
      className={`fixed inset-0 z-[9999] flex ${isLargeScreen ? "flex-row bg-black/80" : "flex-col bg-black/90"} overflow-hidden`}
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button type="button" className="absolute right-4 top-4 w-12 h-12 flex justify-center items-center rounded-full bg-black/60 hover:bg-black/70 text-2xl font-light z-[100]" onClick={onClose}>×</button>

      {/* Desktop layout */}
      {isLargeScreen && (
        <>
          <div className="relative z-10 w-[40%] max-w-[720px] p-6 overflow-y-auto text-white">{renderDetails()}</div>
          <div className="flex-1 relative overflow-hidden">
            <img
              src={anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.images?.webp?.image_url || anime.images?.jpg?.image_url}
              alt={anime.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ pointerEvents: "none" }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-black/50 to-black/90" style={{ pointerEvents: "none" }} />
          </div>
        </>
      )}

      {/* Mobile layout */}
      {!isLargeScreen && (
        <div className="flex flex-col w-full h-full overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <div className="relative w-full h-[35vh] min-h-[200px] flex-shrink-0 overflow-hidden">
            <img
              src={anime.images?.webp?.image_url || anime.images?.jpg?.image_url || anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url}
              alt={anime.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ pointerEvents: "none" }}
            />
            <div className="absolute inset-0 bg-black/70" style={{ pointerEvents: "none" }} />
          </div>
          <div className="relative flex-1 overflow-y-auto text-white bg-black/90 p-4">{renderDetails()}</div>
        </div>
      )}
    </div>,
    portalRoot
  );
};

export default memo(AnimeDetailsPanel);

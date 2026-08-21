import React, { useState, useEffect, useCallback, useRef, lazy, Suspense, memo } from "react";
import ReactDOM from "react-dom";
import {
  Bookmark,
  X,
  Play,
  ExternalLink,
  Star,
  Plus,
  Check,
  Film,
  Calendar,
  Clock,
  Share2,
  Tv,
  Users,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { contentProvider, formatNumber } from "../utils/utils";
import { MiniLoader } from "../helperComponent/PageLoader";
import storageManager from "../utils/storageManager";
import { useToast } from "../utils/toast";
import { jikanFetch } from "../utils/jikanClient";

const EpisodesList = lazy(() => import("../helperComponent/EpisodeList"));

const AnimeDetailsPanel = memo(({ anime: initialAnime, onClose, onSelectAnime }) => {
  const { showToast } = useToast();
  const [portalRoot, setPortalRoot] = useState(null);
  const [activeAnime, setActiveAnime] = useState(initialAnime);
  const containerRef = useRef(null);

  useEffect(() => {
    setActiveAnime(initialAnime);
  }, [initialAnime]);

  const anime = activeAnime;

  const [isInWatchlist, setIsInWatchlist] = useState(() =>
    storageManager.isInWatchlist(anime?.mal_id)
  );
  const [progress, setProgress] = useState(() =>
    storageManager.getAnimeProgress(anime?.mal_id)
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const isMountedRef = useRef(true);

  // Gallery state
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Trailer state
  const [trailerData, setTrailerData] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);

  // Characters / Cast state
  const [characters, setCharacters] = useState([]);
  const [charactersLoading, setCharactersLoading] = useState(false);

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    isMountedRef.current = true;
    setPortalRoot(document.getElementById("modal-root") || document.body);
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!anime?.mal_id) return;
    setIsInWatchlist(storageManager.isInWatchlist(anime.mal_id));
    setProgress(storageManager.getAnimeProgress(anime.mal_id));
    setActiveTab("overview");
    setSynopsisExpanded(false);
    setGalleryImages([]);
    setTrailerData(null);
    setCharacters([]);
    setRecommendations([]);
    setSelectedImageIndex(null);

    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (!storageManager.isInStarted(anime.mal_id)) {
      storageManager.addToStarted(anime);
    }
  }, [anime]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Fetch gallery with resilient fallback images
  const loadGallery = useCallback(async () => {
    if (galleryImages.length > 0 || galleryLoading || !anime?.mal_id) return;
    setGalleryLoading(true);
    try {
      const data = await jikanFetch(`/anime/${anime.mal_id}/pictures`);
      const apiPictures = (data?.data || [])
        .map((img) => ({
          url:
            img.webp?.large_image_url ||
            img.jpg?.large_image_url ||
            img.webp?.image_url ||
            img.jpg?.image_url ||
            img.url,
          thumb:
            img.webp?.image_url ||
            img.jpg?.image_url ||
            img.webp?.small_image_url ||
            img.jpg?.small_image_url ||
            img.url,
        }))
        .filter((p) => Boolean(p.url));

      // Build rich fallback list from anime's own images
      const fallbackList = [];
      if (anime.banner_image) {
        fallbackList.push({ url: anime.banner_image, thumb: anime.banner_image });
      }
      const coverLarge =
        anime.images?.webp?.large_image_url ||
        anime.images?.jpg?.large_image_url ||
        anime.images?.webp?.image_url ||
        anime.images?.jpg?.image_url;
      if (coverLarge) {
        fallbackList.push({ url: coverLarge, thumb: coverLarge });
      }

      const finalPictures = apiPictures.length > 0 ? apiPictures : fallbackList;
      if (isMountedRef.current) {
        setGalleryImages(finalPictures);
      }
    } catch {
      const fallbackList = [];
      if (anime?.banner_image) {
        fallbackList.push({ url: anime.banner_image, thumb: anime.banner_image });
      }
      const coverLarge =
        anime?.images?.webp?.large_image_url ||
        anime?.images?.jpg?.large_image_url ||
        anime?.images?.webp?.image_url ||
        anime?.images?.jpg?.image_url;
      if (coverLarge) {
        fallbackList.push({ url: coverLarge, thumb: coverLarge });
      }
      if (isMountedRef.current) setGalleryImages(fallbackList);
    } finally {
      if (isMountedRef.current) setGalleryLoading(false);
    }
  }, [anime, galleryImages.length, galleryLoading]);

  // Fetch trailer
  const loadTrailer = useCallback(async () => {
    setActiveTab("trailers");
    if (trailerData || trailerLoading || !anime?.mal_id) {
      return;
    }
    if (anime.trailer?.embed_url || anime.trailer?.youtube_id) {
      setTrailerData(anime.trailer);
      return;
    }
    setTrailerLoading(true);
    try {
      const data = await jikanFetch(`/anime/${anime.mal_id}/videos`);
      if (isMountedRef.current) {
        const promo = data?.data?.promo?.[0] || null;
        setTrailerData(promo?.trailer || null);
      }
    } catch {
      if (isMountedRef.current) showToast("Failed to load trailer", "error");
    } finally {
      if (isMountedRef.current) setTrailerLoading(false);
    }
  }, [anime?.mal_id, anime?.trailer, trailerData, trailerLoading, showToast]);

  // Fetch Characters & Cast
  const loadCharacters = useCallback(async () => {
    if (characters.length > 0 || charactersLoading || !anime?.mal_id) return;
    setCharactersLoading(true);
    try {
      const data = await jikanFetch(`/anime/${anime.mal_id}/characters`);
      if (isMountedRef.current) {
        setCharacters((data?.data || []).slice(0, 12));
      }
    } catch {
      // Ignore characters error
    } finally {
      if (isMountedRef.current) setCharactersLoading(false);
    }
  }, [anime?.mal_id, characters.length, charactersLoading]);

  // Fetch Recommendations
  const loadRecommendations = useCallback(async () => {
    if (recommendations.length > 0 || !anime?.mal_id) return;
    try {
      const data = await jikanFetch(`/anime/${anime.mal_id}/recommendations`);
      if (isMountedRef.current) {
        setRecommendations((data?.data || []).slice(0, 6));
      }
    } catch {
      // Ignore recommendations error
    }
  }, [anime?.mal_id, recommendations.length]);

  const handleSelectRecommendation = useCallback(
    async (entry) => {
      if (!entry?.mal_id) return;
      try {
        const fullData = await jikanFetch(`/anime/${entry.mal_id}`);
        const resolvedAnime = fullData?.data || entry;
        if (isMountedRef.current) {
          setActiveAnime(resolvedAnime);
          onSelectAnime?.(resolvedAnime);
        }
      } catch {
        if (isMountedRef.current) {
          setActiveAnime(entry);
          onSelectAnime?.(entry);
        }
      }
    },
    [onSelectAnime]
  );

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const toggleWatchlist = useCallback(() => {
    if (isInWatchlist) {
      storageManager.removeFromWatchlist(anime.mal_id);
      showToast("Removed from Up Next", "info");
    } else {
      storageManager.addToWatchlist(anime);
      showToast("Added to Up Next", "success");
    }
    setIsInWatchlist(!isInWatchlist);
  }, [isInWatchlist, anime, showToast]);

  const handleIncrementEpisode = useCallback(() => {
    const nextEp = (progress?.episode || 0) + 1;
    const total = anime.episodes || null;
    const isCompleted = total ? nextEp >= total : false;
    const newProg = {
      episode: total ? Math.min(nextEp, total) : nextEp,
      status: isCompleted ? "completed" : "watching",
    };
    storageManager.setAnimeProgress(anime.mal_id, newProg);
    setProgress(newProg);
    showToast(`Updated to Episode ${newProg.episode}`, "success");
  }, [anime.mal_id, anime.episodes, progress, showToast]);

  const handleStatusChange = useCallback(
    (newStatus) => {
      const newProg = { ...progress, status: newStatus };
      storageManager.setAnimeProgress(anime.mal_id, newProg);
      setProgress(newProg);
      showToast(`Status updated to ${newStatus.replace(/_/g, " ")}`, "success");
    },
    [anime.mal_id, progress, showToast]
  );

  const handleProviderClick = useCallback(
    (name) => {
      storageManager.saveToWatchlist(anime, true);
      if (!isInWatchlist) setIsInWatchlist(true);
      showToast(`Opening on ${name}`, "success");
    },
    [anime, isInWatchlist, showToast]
  );

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: anime.title,
          text: `Check out ${anime.title} on AnimeSkdool!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast("Link copied to clipboard", "success");
    }
  }, [anime.title, showToast]);

  if (!anime || !anime.mal_id || !portalRoot) return null;

  const webp = anime.images?.webp || {};
  const jpg = anime.images?.jpg || {};
  const backdropUrl =
    anime.banner_image ||
    webp.large_image_url ||
    jpg.large_image_url ||
    webp.image_url ||
    jpg.image_url;

  const synopsis = anime.synopsis
    ? anime.synopsis.replace(/\[Written by.*?\]/gi, "").trim()
    : "No synopsis available for this anime.";

  const trailerEmbed =
    trailerData?.embed_url ||
    (trailerData?.youtube_id
      ? `https://www.youtube.com/embed/${trailerData.youtube_id}?autoplay=1`
      : anime.trailer?.embed_url ||
        (anime.trailer?.youtube_id
          ? `https://www.youtube.com/embed/${anime.trailer.youtube_id}?autoplay=1`
          : null));

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "episodes", label: "Episodes" },
    { key: "trailers", label: "Trailers & Stills" },
    { key: "cast", label: "Cast & Characters" },
    { key: "details", label: "Production Info" },
  ];

  return ReactDOM.createPortal(
    <dialog
      ref={containerRef}
      open
      className="fixed inset-0 z-[9999] m-0 h-full w-full max-h-none max-w-none bg-black/90 backdrop-blur-3xl overflow-y-auto scrollbar-thin border-0 p-0 animate-fadeIn"
    >
      {/* Floating Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-white text-white hover:text-black border border-white/20 backdrop-blur-2xl transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
        aria-label="Close details"
      >
        <X size={18} className="sm:w-5 sm:h-5" />
      </button>

      {/* Cinematic Hero Backdrop Showcase */}
      <div className="relative h-[55vh] sm:h-[65vh] min-h-[380px] sm:min-h-[460px] max-h-[700px] w-full overflow-hidden">
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={anime.title}
            className="w-full h-full object-cover filter brightness-[0.82] contrast-[1.05]"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-color)] via-black/40 to-transparent" />

        {/* Hero Meta Info */}
        <div className="absolute inset-x-0 bottom-0 max-w-[1800px] mx-auto px-4 sm:px-10 md:px-16 lg:px-20 pb-6 sm:pb-8 z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* Portrait Cover */}
            <div className="relative w-36 sm:w-44 md:w-52 aspect-[2/3] rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/20 flex-shrink-0 hidden sm:block">
              <img
                src={webp.large_image_url || jpg.large_image_url || backdropUrl}
                alt={anime.title}
                className="w-full h-full object-cover"
              />
              <div className="specular-highlight opacity-50" />
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase text-white border border-white/20">
                  {anime.type || "TV Series"}
                </span>

                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold tracking-widest bg-white/10 text-white/90 border border-white/15 uppercase">
                  {anime.rating?.split(" ")[0] || "TV-14"}
                </span>

                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-widest bg-white/10 text-white/80 border border-white/15">
                  4K HDR
                </span>

                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-widest bg-white/10 text-white/80 border border-white/15">
                  DOLBY ATMOS
                </span>

                {anime.score && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold">
                    <Star size={11} fill="currentColor" />
                    {anime.score}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
                {anime.title}
              </h1>

              {anime.title_english && anime.title_english !== anime.title && (
                <p className="text-sm sm:text-base text-white/70 font-medium">
                  {anime.title_english}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Watch Episode Launcher */}
                <a
                  href={`https://9anime.org.lv/${(anime.title_english || anime.title)
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")}-episode-${(progress?.episode || 0) + 1}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-bold shadow-[0_4px_24px_rgba(255,255,255,0.4)] hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
                >
                  <Play size={18} className="fill-black" />
                  Stream Ep {(progress?.episode || 0) + 1}
                </a>

                {/* +1 Episode Quick Tracker */}
                <button
                  type="button"
                  onClick={handleIncrementEpisode}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold backdrop-blur-2xl bg-white/12 text-white border border-white/20 hover:bg-white/25 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Plus size={16} />
                  <span>+1 Ep ({progress?.episode || 0} Watched)</span>
                </button>

                {/* Up Next Toggle */}
                <button
                  type="button"
                  onClick={toggleWatchlist}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold backdrop-blur-2xl transition-all duration-200 active:scale-95 border ${
                    isInWatchlist
                      ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-[0_0_24px_var(--glow-color)]"
                      : "bg-white/12 text-white border-white/20 hover:bg-white/20"
                  }`}
                >
                  {isInWatchlist ? <Check size={18} /> : <Plus size={18} />}
                  {isInWatchlist ? "In Up Next" : "Add to Up Next"}
                </button>

                {/* Trailer Button */}
                <button
                  type="button"
                  onClick={loadTrailer}
                  disabled={trailerLoading}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold backdrop-blur-2xl bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-all hover:scale-[1.02]"
                >
                  {trailerLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Film size={16} />
                  )}
                  Trailer
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/15 transition-all hover:scale-105"
                  title="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-10 md:px-16 lg:px-20 py-6 sm:py-8">
        {/* Segmented Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-full bg-white/[0.06] backdrop-blur-2xl border border-white/10 max-w-full overflow-x-auto scrollbar-none mb-6 sm:mb-8">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key === "trailers") {
                    loadTrailer();
                    loadGallery();
                  } else if (tab.key === "cast") {
                    loadCharacters();
                  }
                }}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? "bg-white text-black shadow-md scale-[1.02]"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
            <div className="space-y-8">
              {/* Synopsis */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Synopsis</h3>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
                  {synopsisExpanded
                    ? synopsis
                    : synopsis.length > 380
                    ? `${synopsis.slice(0, 380)}...`
                    : synopsis}
                </p>
                {synopsis.length > 380 && (
                  <button
                    type="button"
                    onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                    className="text-[var(--primary-color)] text-xs sm:text-sm font-semibold mt-2 hover:underline inline-block"
                  >
                    {synopsisExpanded ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>

              {/* Streaming Channels */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Watch Online</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {contentProvider.map((p) => (
                    <a
                      key={p.name}
                      href={`${p.url}${encodeURIComponent(
                        anime.title_english || anime.title
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => handleProviderClick(p.name)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2">
                        <Tv size={16} className="text-[var(--primary-color)]" />
                        <span className="text-xs font-semibold text-white">
                          {p.name}
                        </span>
                      </div>
                      <ExternalLink
                        size={13}
                        className="text-white/40 group-hover:text-white transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </div>

              {/* Related / More Like This Shelf */}
              {recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles size={16} className="text-[var(--primary-color)]" />
                    More Like This
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                    {recommendations.map((rec) => {
                      const entry = rec.entry;
                      const rImg =
                        entry?.images?.webp?.large_image_url ||
                        entry?.images?.webp?.image_url ||
                        entry?.images?.jpg?.large_image_url ||
                        entry?.images?.jpg?.image_url;

                      return (
                        <div
                          key={entry?.mal_id}
                          onClick={() => handleSelectRecommendation(entry)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleSelectRecommendation(entry);
                            }
                          }}
                          className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#08080c] border border-white/[0.08] hover:border-white/30 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg select-none"
                        >
                          <img
                            src={rImg}
                            alt={entry?.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => {
                              e.target.parentElement.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="p-2.5 rounded-full bg-white text-black shadow-lg">
                              <Play size={12} className="fill-black translate-x-0.5" />
                            </span>
                          </div>
                          <p className="absolute bottom-2.5 inset-x-2.5 text-[11px] font-bold text-white truncate drop-shadow-md group-hover:text-[var(--primary-color)] transition-colors">
                            {entry?.title}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Anime Specs Sidebar */}
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/10 backdrop-blur-2xl space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-white/50">
                  Information
                </h4>

                <div className="flex justify-between items-center py-2 border-b border-white/[0.06] text-xs sm:text-sm">
                  <span className="text-white/50">Watch Status</span>
                  <select
                    value={progress?.status || "plan_to_watch"}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="rounded-lg bg-white/10 border border-white/15 px-2.5 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="plan_to_watch" className="bg-[#12121a]">Plan to Watch</option>
                    <option value="watching" className="bg-[#12121a]">Watching</option>
                    <option value="completed" className="bg-[#12121a]">Completed</option>
                  </select>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/[0.06] text-xs sm:text-sm">
                  <span className="text-white/50">Rating</span>
                  <span className="font-semibold text-white">{anime.rating || "TV-14"}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/[0.06] text-xs sm:text-sm">
                  <span className="text-white/50">Season</span>
                  <span className="font-semibold text-white capitalize">
                    {anime.season} {anime.year || ""}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/[0.06] text-xs sm:text-sm">
                  <span className="text-white/50">Duration</span>
                  <span className="font-semibold text-white">{anime.duration || "24m"}</span>
                </div>

                <div className="flex justify-between items-center py-2 text-xs sm:text-sm">
                  <span className="text-white/50">Studios</span>
                  <span className="font-semibold text-white truncate max-w-[180px]">
                    {anime.studios?.map((s) => s.name).join(", ") || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Episodes */}
        {activeTab === "episodes" && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Season Episodes</h3>
            <Suspense fallback={<MiniLoader text="Loading episodes..." />}>
              <EpisodesList
                animeId={anime.mal_id}
                animeName={anime.title_english || anime.title}
              />
            </Suspense>
          </div>
        )}

        {/* Tab 3: Trailers & Stills */}
        {activeTab === "trailers" && (
          <div className="space-y-10">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Official Trailer</h3>
              {trailerEmbed ? (
                <div className="relative aspect-video max-w-4xl rounded-3xl overflow-hidden bg-black border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                  <iframe
                    src={trailerEmbed}
                    title="Trailer"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : trailerLoading ? (
                <div className="aspect-video max-w-4xl rounded-3xl bg-white/5 flex items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-white/50" />
                </div>
              ) : (
                <p className="text-white/50 text-sm">No video trailer available.</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Photos & Stills</h3>
              {galleryLoading ? (
                <MiniLoader text="Loading gallery..." />
              ) : galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                  {galleryImages.map((img, idx) => {
                    const imgSrc =
                      img.url ||
                      img.thumb ||
                      img.jpg?.large_image_url ||
                      img.jpg?.image_url ||
                      img.webp?.large_image_url ||
                      img.webp?.image_url ||
                      img;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className="aspect-[16/10] sm:aspect-[2/3] rounded-2xl overflow-hidden bg-[#08080c] border border-white/[0.08] hover:border-white/25 cursor-pointer transition-all hover:scale-105 group relative shadow-md select-none"
                      >
                        <img
                          src={imgSrc}
                          alt={`${anime.title} Still ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            if (
                              anime.images?.webp?.large_image_url &&
                              e.target.src !== anime.images.webp.large_image_url
                            ) {
                              e.target.src = anime.images.webp.large_image_url;
                            } else {
                              e.target.parentElement.style.display = "none";
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="p-2 rounded-full bg-white text-black shadow-lg">
                            <Play size={12} className="fill-black translate-x-0.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-white/50 text-sm">No photo stills found.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Cast & Characters */}
        {activeTab === "cast" && (
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Voice Actors & Characters</h3>
            {charactersLoading ? (
              <MiniLoader text="Loading cast & characters..." />
            ) : characters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {characters.map((item, idx) => {
                  const char = item.character;
                  const va = item.voice_actors?.[0]?.person;
                  return (
                    <div
                      key={char?.mal_id || idx}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all"
                    >
                      <img
                        src={char?.images?.webp?.image_url || char?.images?.jpg?.image_url}
                        alt={char?.name}
                        className="w-12 h-12 rounded-full object-cover border border-white/15 flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">{char?.name}</h4>
                        <p className="text-[11px] text-white/50 truncate">{item.role || "Main"}</p>
                        {va && (
                          <p className="text-[10px] text-[var(--primary-color)] truncate mt-0.5 font-medium">
                            VA: {va.name}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/50 text-sm">No character details found.</p>
            )}
          </div>
        )}

        {/* Tab 5: Production Info */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/10 space-y-3">
              <h4 className="font-bold text-white text-base">Studios & Production</h4>
              <div className="space-y-1 text-sm text-white/70">
                <p><span className="text-white/40">Studio:</span> {anime.studios?.map((s) => s.name).join(", ") || "—"}</p>
                <p><span className="text-white/40">Producers:</span> {anime.producers?.map((p) => p.name).join(", ") || "—"}</p>
                <p><span className="text-white/40">Licensors:</span> {anime.licensors?.map((l) => l.name).join(", ") || "—"}</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/10 space-y-3">
              <h4 className="font-bold text-white text-base">Broadcast Schedule</h4>
              <div className="space-y-1 text-sm text-white/70">
                <p><span className="text-white/40">Broadcast:</span> {anime.broadcast?.string || "TBD"}</p>
                <p><span className="text-white/40">Aired:</span> {anime.aired?.string || "TBD"}</p>
                <p><span className="text-white/40">Source:</span> {anime.source || "Original"}</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/10 space-y-3">
              <h4 className="font-bold text-white text-base">Audience & Statistics</h4>
              <div className="space-y-1 text-sm text-white/70">
                <p><span className="text-white/40">Favorites:</span> {formatNumber(anime.favorites || 0)}</p>
                <p><span className="text-white/40">Members:</span> {formatNumber(anime.members || 0)}</p>
                <p><span className="text-white/40">Scored by:</span> {formatNumber(anime.scored_by || 0)} users</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImageIndex !== null && galleryImages[selectedImageIndex] && (
        <div
          className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all border border-white/15 z-20"
            aria-label="Close image preview"
          >
            <X size={20} />
          </button>

          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) =>
                  prev === 0 ? galleryImages.length - 1 : prev - 1
                );
              }}
              className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all border border-white/15 z-20 cursor-pointer active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
          )}

          <div
            className="relative max-h-[85vh] max-w-[90vw] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={
                galleryImages[selectedImageIndex]?.url ||
                galleryImages[selectedImageIndex]?.jpg?.large_image_url ||
                galleryImages[selectedImageIndex]?.jpg?.image_url ||
                galleryImages[selectedImageIndex]
              }
              alt="Fullscreen Still"
              className="max-h-[80vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
            <div className="absolute bottom-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
              {selectedImageIndex + 1} / {galleryImages.length}
            </div>
          </div>

          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) =>
                  prev === galleryImages.length - 1 ? 0 : prev + 1
                );
              }}
              className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all border border-white/15 z-20 cursor-pointer active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          )}
        </div>
      )}
    </dialog>,
    portalRoot
  );
});

AnimeDetailsPanel.displayName = "AnimeDetailsPanel";

export default AnimeDetailsPanel;

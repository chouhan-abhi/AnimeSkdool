import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { Play, Plus, Check, ChevronLeft, ChevronRight, Info, Star, Sparkles, Volume2 } from "lucide-react";
import Pill from "./ui/Pill";
import PrimaryButton from "./ui/PrimaryButton";

const AUTO_ADVANCE_MS = 8000;
const HERO_CLASS = "relative h-[65vh] sm:h-[74vh] min-h-[460px] sm:min-h-[540px] max-h-[920px] w-full overflow-hidden select-none";

const buildSrcSet = (urls, widths) => {
  const entries = urls
    .map((url, i) => (url ? `${url} ${widths[i]}w` : null))
    .filter(Boolean);
  return entries.length ? entries.join(", ") : undefined;
};

const HeroCarousel = memo(
  ({
    heroList = [],
    heroLoading = false,
    visible = true,
    onSelectAnime,
    onAddToWatchlist,
    isInWatchlist,
  }) => {
    const [heroIndex, setHeroIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const heroIntervalRef = useRef(null);

    const stopAutoAdvance = useCallback(() => {
      if (heroIntervalRef.current) {
        clearInterval(heroIntervalRef.current);
        heroIntervalRef.current = null;
      }
    }, []);

    const startAutoAdvance = useCallback(() => {
      if (!visible || heroList.length <= 1 || heroIntervalRef.current) return;
      heroIntervalRef.current = setInterval(() => {
        setHeroIndex((i) => (i + 1) % heroList.length);
      }, AUTO_ADVANCE_MS);
    }, [heroList.length, visible]);

    useEffect(() => {
      startAutoAdvance();
      return stopAutoAdvance;
    }, [startAutoAdvance, stopAutoAdvance]);

    useEffect(() => {
      if (!visible) stopAutoAdvance();
    }, [visible, stopAutoAdvance]);

    useEffect(() => {
      if (heroIndex >= heroList.length && heroList.length > 0) {
        setHeroIndex(0);
      }
    }, [heroIndex, heroList.length]);

    useEffect(() => {
      const handleVisibility = () => {
        if (document.hidden) stopAutoAdvance();
        else startAutoAdvance();
      };
      document.addEventListener("visibilitychange", handleVisibility);
      return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [startAutoAdvance, stopAutoAdvance]);

    const goToHeroSlide = useCallback(
      (index) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setHeroIndex(index);
        stopAutoAdvance();
        startAutoAdvance();
        setTimeout(() => setIsTransitioning(false), 500);
      },
      [startAutoAdvance, stopAutoAdvance, isTransitioning]
    );

    const handleMouseEnter = useCallback(() => stopAutoAdvance(), [stopAutoAdvance]);
    const handleMouseLeave = useCallback(() => startAutoAdvance(), [startAutoAdvance]);

    if (!visible) return null;

    if (heroLoading) {
      return (
        <section className={`${HERO_CLASS} bg-[#060608]`}>
          <div className="absolute inset-0 animate-shimmer" />
          <div className="relative h-full flex flex-col justify-end px-4 sm:px-10 md:px-16 lg:px-20 pb-16 sm:pb-20 md:pb-24 max-w-[1800px] mx-auto">
            <div className="h-5 w-28 rounded-full bg-white/10 mb-4" />
            <div className="h-14 w-3/4 max-w-2xl rounded-2xl bg-white/10" />
            <div className="mt-4 h-5 w-full max-w-xl rounded-lg bg-white/5" />
            <div className="mt-2 h-5 w-2/3 max-w-md rounded-lg bg-white/5" />
            <div className="mt-8 flex gap-4">
              <div className="h-12 w-36 rounded-full bg-white/15" />
              <div className="h-12 w-36 rounded-full bg-white/10" />
            </div>
          </div>
        </section>
      );
    }

    if (heroList.length === 0) return null;

    return (
      <section
        className={HERO_CLASS}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Slides Track */}
        <div
          className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
          style={{ transform: `translateX(-${heroIndex * 100}%)` }}
        >
          {heroList.map((anime, index) => {
            const webp = anime.images?.webp || {};
            const jpg = anime.images?.jpg || {};
            const webpSrcSet = buildSrcSet(
              [webp.small_image_url, webp.image_url, webp.large_image_url],
              [600, 1200, 2000]
            );
            const jpgSrcSet = buildSrcSet(
              [jpg.small_image_url, jpg.image_url, jpg.large_image_url],
              [600, 1200, 2000]
            );
            const fallbackSrc =
              anime.banner_image || webp.large_image_url || webp.image_url || jpg.large_image_url || jpg.image_url;

            const inWatchlist = isInWatchlist?.(anime.mal_id);
            const isActiveSlide = heroIndex === index;

            return (
              <div key={anime.mal_id || index} className="relative flex-shrink-0 w-full h-full overflow-hidden">
                {/* Backdrop Image with Ken Burns Zoom */}
                <picture className="absolute inset-0 block">
                  {webpSrcSet && (
                    <source type="image/webp" srcSet={webpSrcSet} sizes="100vw" />
                  )}
                  {jpgSrcSet && (
                    <source type="image/jpeg" srcSet={jpgSrcSet} sizes="100vw" />
                  )}
                  <img
                    src={fallbackSrc}
                    alt={anime.title}
                    className={`w-full h-full object-cover object-center filter brightness-90 contrast-[1.08] transition-transform duration-1000 ${
                      isActiveSlide ? "scale-105" : "scale-100"
                    }`}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "low"}
                    decoding={index === 0 ? "auto" : "async"}
                  />
                </picture>

                {/* Cinematic Ambient Glow & Vignette Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#060608] via-[#060608]/80 to-transparent w-full md:w-3/4" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)]/40 to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 to-transparent" />

                {/* Hero Info Container */}
                <div className="relative h-full flex flex-col justify-end px-4 sm:px-10 md:px-16 lg:px-20 pb-16 sm:pb-20 md:pb-24 max-w-[1800px] mx-auto z-10">
                  {/* Badges Strip */}
                  <div className="flex flex-wrap items-center gap-2.5 mb-3">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-xl text-white text-[11px] font-bold tracking-wider uppercase border border-white/25 shadow-sm">
                      AnimeSkdool Spotlight
                    </span>

                    {anime.rating && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest bg-white/10 backdrop-blur-xl text-white/90 border border-white/15 uppercase">
                        {anime.rating.split(" ")[0] || "TV-14"}
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-widest bg-white/10 backdrop-blur-md text-white/80 border border-white/15">
                      4K HDR
                    </span>

                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-widest bg-white/10 backdrop-blur-md text-white/80 border border-white/15">
                      DOLBY ATMOS
                    </span>

                    {anime.score && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold shadow-sm">
                        <Star size={11} fill="currentColor" />
                        {anime.score}
                      </span>
                    )}

                    {anime.season && anime.year && (
                      <span className="text-xs text-white/70 font-medium capitalize ml-1">
                        {anime.season} {anime.year}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_28px_rgba(0,0,0,0.9)] max-w-3xl leading-[1.08]">
                    {anime.title}
                  </h1>

                  {/* Japanese / Alt Title */}
                  {anime.title_japanese && (
                    <p className="text-sm font-medium text-white/50 mt-1 tracking-wide">
                      {anime.title_japanese}
                    </p>
                  )}

                  {/* Synopsis */}
                  {anime.synopsis && (
                    <p className="mt-3 text-sm sm:text-base text-white/85 line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed font-normal drop-shadow-md">
                      {anime.synopsis.replace(/\[Written by.*?\]/gi, "").trim()}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap items-center gap-3.5">
                    <PrimaryButton
                      variant="white"
                      size="lg"
                      onClick={() => onSelectAnime?.(anime)}
                    >
                      <Play size={18} fill="currentColor" />
                      Watch Episode 1
                    </PrimaryButton>

                    <button
                      type="button"
                      onClick={() => onAddToWatchlist?.(anime)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-2xl transition-all duration-300 hover:bg-white/20 hover:scale-105"
                    >
                      {inWatchlist ? (
                        <>
                          <Check size={16} />
                          <span>In Up Next</span>
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          <span>Add to Up Next</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Navigation Arrows */}
        {heroList.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goToHeroSlide((heroIndex - 1 + heroList.length) % heroList.length)}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center h-12 w-12 rounded-full bg-black/40 border border-white/10 text-white backdrop-blur-xl transition-all hover:bg-black/60 hover:scale-110"
              aria-label="Previous featured anime"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={() => goToHeroSlide((heroIndex + 1) % heroList.length)}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center h-12 w-12 rounded-full bg-black/40 border border-white/10 text-white backdrop-blur-xl transition-all hover:bg-black/60 hover:scale-110"
              aria-label="Next featured anime"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Segmented Slide Indicator Bars */}
        {heroList.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10">
            {heroList.slice(0, 10).map((_, idx) => {
              const active = idx === heroIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToHeroSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    active ? "w-8 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              );
            })}
          </div>
        )}
      </section>
    );
  }
);

export default HeroCarousel;

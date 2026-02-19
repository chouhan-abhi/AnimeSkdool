import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { Play, Plus, Check, ChevronLeft, ChevronRight, Info, Star } from "lucide-react";
import Pill from "./ui/Pill";
import PrimaryButton from "./ui/PrimaryButton";

const AUTO_ADVANCE_MS = 7000;
const HERO_CLASS =
  "relative h-[70vh] min-h-[480px] max-h-[860px] w-full overflow-hidden";

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
    const progressRef = useRef(null);

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
        setTimeout(() => setIsTransitioning(false), 600);
      },
      [startAutoAdvance, stopAutoAdvance, isTransitioning]
    );

    const handleMouseEnter = useCallback(() => stopAutoAdvance(), [stopAutoAdvance]);
    const handleMouseLeave = useCallback(() => startAutoAdvance(), [startAutoAdvance]);

    if (!visible) return null;

    if (heroLoading) {
      return (
        <section className={`${HERO_CLASS} bg-[var(--bg-color)]`}>
          <div className="absolute inset-0 animate-shimmer" />
          <div className="relative h-full flex flex-col justify-end px-6 sm:px-8 md:px-12 lg:px-16 pb-20 md:pb-16">
            <div className="h-4 w-20 rounded-full bg-white/10 mb-4" />
            <div className="h-12 w-3/4 max-w-xl rounded-lg bg-white/8" />
            <div className="mt-3 h-5 w-full max-w-lg rounded bg-white/6" />
            <div className="mt-2 h-5 w-2/3 max-w-md rounded bg-white/6" />
            <div className="mt-6 flex gap-3">
              <div className="h-11 w-32 rounded-full bg-white/10" />
              <div className="h-11 w-36 rounded-full bg-white/6" />
            </div>
          </div>
        </section>
      );
    }

    if (heroList.length === 0) return null;

    const currentAnime = heroList[heroIndex];

    return (
      <section
        className={HERO_CLASS}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="flex h-full transition-transform duration-[600ms] ease-out will-change-transform"
          style={{ transform: `translateX(-${heroIndex * 100}%)` }}
        >
          {heroList.map((anime, index) => {
            const webp = anime.images?.webp || {};
            const jpg = anime.images?.jpg || {};
            const webpSrcSet = buildSrcSet(
              [webp.small_image_url, webp.image_url, webp.large_image_url],
              [480, 800, 1400]
            );
            const jpgSrcSet = buildSrcSet(
              [jpg.small_image_url, jpg.image_url, jpg.large_image_url],
              [480, 800, 1400]
            );
            const fallbackSrc =
              webp.large_image_url || webp.image_url || jpg.large_image_url || jpg.image_url;

            const inWatchlist = isInWatchlist?.(anime.mal_id);

            return (
              <div key={anime.mal_id} className="relative flex-shrink-0 w-full h-full">
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
                    className="w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "low"}
                    decoding={index === 0 ? "auto" : "async"}
                  />
                </picture>

                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-color)] via-[var(--bg-color)]/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)]/20 to-transparent" />

                <div className="relative h-full flex flex-col justify-end px-6 sm:px-8 md:px-12 lg:px-16 pb-20 md:pb-16">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Pill variant="accent" className="bg-[var(--primary-color)]/90 text-white border-transparent">
                      #{index + 1} Trending
                    </Pill>
                    {anime.score && (
                      <Pill className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        <Star size={10} fill="currentColor" />
                        {anime.score}
                      </Pill>
                    )}
                    {anime.season && anime.year && (
                      <span className="text-xs text-white/60 font-medium">
                        {anime.season} {anime.year}
                      </span>
                    )}
                    {anime.episodes && (
                      <span className="text-xs text-white/60">
                        {anime.episodes} Episodes
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] max-w-2xl leading-tight">
                    {anime.title}
                  </h1>

                  {anime.genres?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {anime.genres.slice(0, 4).map((g) => (
                        <span
                          key={g.mal_id}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-white/80 border border-white/10"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {anime.synopsis && (
                    <p className="mt-3 text-sm sm:text-base text-white/80 line-clamp-2 max-w-xl leading-relaxed">
                      {anime.synopsis.replace(/\[Written by.*?\]/gi, "").trim()}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <PrimaryButton onClick={() => onSelectAnime?.(anime)}>
                      <Play size={18} fill="white" />
                      Watch Now
                    </PrimaryButton>
                    <PrimaryButton variant="secondary" onClick={() => onSelectAnime?.(anime)}>
                      <Info size={18} />
                      More Info
                    </PrimaryButton>
                    <button
                      type="button"
                      onClick={() => onAddToWatchlist?.(anime)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                        inWatchlist
                          ? "border-[var(--primary-color)]/40 bg-[var(--primary-color)]/15 text-[var(--primary-color)]"
                          : "border-white/15 bg-white/8 text-white hover:bg-white/15"
                      }`}
                    >
                      {inWatchlist ? <Check size={18} /> : <Plus size={18} />}
                      {inWatchlist ? "In Watchlist" : "Watchlist"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {heroList.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                goToHeroSlide((heroIndex - 1 + heroList.length) % heroList.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/30 text-white/80 hover:bg-black/50 hover:text-white transition-all duration-200 glass"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={() => goToHeroSlide((heroIndex + 1) % heroList.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/30 text-white/80 hover:bg-black/50 hover:text-white transition-all duration-200 glass"
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-4 left-6 sm:left-8 md:left-12 lg:left-16 z-10 flex items-center gap-3">
              <div className="flex gap-1.5">
                {heroList.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToHeroSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === heroIndex ? "true" : undefined}
                    className={`h-1.5 rounded-full transition-all duration-400 ${
                      i === heroIndex
                        ? "w-8 bg-[var(--primary-color)]"
                        : "w-1.5 bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-white/50 font-medium tabular-nums">
                {heroIndex + 1} / {heroList.length}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
              <div
                ref={progressRef}
                key={heroIndex}
                className="h-full bg-[var(--primary-color)]/60 rounded-full"
                style={{ animation: `progressBar ${AUTO_ADVANCE_MS}ms linear` }}
              />
            </div>
          </>
        )}
      </section>
    );
  }
);

HeroCarousel.displayName = "HeroCarousel";

export default HeroCarousel;

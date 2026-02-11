import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { Play, Plus, ChevronLeft, ChevronRight, Info } from "lucide-react";
import Pill from "./ui/Pill";
import PrimaryButton from "./ui/PrimaryButton";

const AUTO_ADVANCE_MS = 6000;
const HERO_CLASS =
    "relative h-[68vh] min-h-[420px] max-h-[820px] w-full overflow-hidden";

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
            if (heroIndex >= heroList.length) {
                setHeroIndex(0);
            }
        }, [heroIndex, heroList.length]);

        useEffect(() => {
            const handleVisibility = () => {
                if (document.hidden) {
                    stopAutoAdvance();
                } else {
                    startAutoAdvance();
                }
            };
            document.addEventListener("visibilitychange", handleVisibility);
            return () => document.removeEventListener("visibilitychange", handleVisibility);
        }, [startAutoAdvance, stopAutoAdvance]);

        const goToHeroSlide = useCallback((index) => {
            setHeroIndex(index);
            stopAutoAdvance();
            startAutoAdvance();
        }, [startAutoAdvance, stopAutoAdvance]);

        const handleMouseEnter = useCallback(() => {
            stopAutoAdvance();
        }, [stopAutoAdvance]);

        const handleMouseLeave = useCallback(() => {
            startAutoAdvance();
        }, [startAutoAdvance]);

        if (!visible) return null;

        if (heroLoading) {
            return (
                <section className={`${HERO_CLASS} bg-neutral-900`}>
                    <div className="absolute inset-0 animate-pulse bg-neutral-800/50" />
                    <div className="relative h-full flex flex-col justify-end px-4 sm:px-6 md:px-8 lg:px-12 pb-8 md:pb-12">
                        <div className="h-10 w-3/4 max-w-xl rounded bg-white/10" />
                        <div className="mt-3 h-5 w-full max-w-xl rounded bg-white/10" />
                        <div className="mt-3 h-5 w-2/3 max-w-md rounded bg-white/10" />
                        <div className="mt-4 flex gap-3">
                            <div className="h-10 w-28 rounded-md bg-white/20" />
                            <div className="h-10 w-32 rounded-md bg-white/10" />
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
                <div
                    className="flex h-full transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${heroIndex * 100}%)` }}
                >
                    {heroList.map((anime, index) => {
                        const webp = anime.images?.webp || {};
                        const jpg = anime.images?.jpg || {};
                        const webpSrcSet = buildSrcSet(
                            [webp.small_image_url, webp.image_url, webp.large_image_url],
                            [480, 800, 1200]
                        );
                        const jpgSrcSet = buildSrcSet(
                            [jpg.small_image_url, jpg.image_url, jpg.large_image_url],
                            [480, 800, 1200]
                        );
                        const fallbackSrc =
                            webp.large_image_url ||
                            webp.image_url ||
                            jpg.large_image_url ||
                            jpg.image_url;

                        return (
                        <div
                            key={anime.mal_id}
                            className="relative flex-shrink-0 w-full h-full"
                        >
                            <picture className="absolute inset-0 block">
                                {webpSrcSet && (
                                    <source
                                        type="image/webp"
                                        srcSet={webpSrcSet}
                                        sizes="100vw"
                                    />
                                )}
                                {jpgSrcSet && (
                                    <source
                                        type="image/jpeg"
                                        srcSet={jpgSrcSet}
                                        sizes="100vw"
                                    />
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
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-color)] via-[var(--bg-color)]/80 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-transparent to-transparent" />
                            <div className="relative h-full flex flex-col justify-end px-4 sm:px-6 md:px-8 lg:px-12 pb-14 md:pb-12">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <Pill className="bg-[var(--primary-color)]/90 text-white">
                                        Trending #1
                                    </Pill>
                                    {anime.season && anime.year && (
                                        <span className="text-xs text-white/70">
                                            {anime.season} {anime.year}
                                        </span>
                                    )}
                                    {anime.episodes && (
                                        <span className="text-xs text-white/70">
                                            • {anime.episodes} Episodes
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg max-w-2xl">
                                    {anime.title}
                                </h1>
                                {anime.synopsis && (
                                    <p className="mt-2 text-sm sm:text-base text-white/90 line-clamp-2 max-w-xl">
                                        {anime.synopsis
                                            .replace(/\[Written by.*?\]/gi, "")
                                            .trim()}
                                    </p>
                                )}
                                <div className="mt-5 flex flex-wrap items-center gap-3">
                                    <PrimaryButton onClick={() => onSelectAnime?.(anime)}>
                                        <Play size={18} />
                                        Watch Now
                                    </PrimaryButton>
                                    <PrimaryButton
                                        variant="secondary"
                                        onClick={() => onSelectAnime?.(anime)}
                                    >
                                        <Info size={18} />
                                        More Info
                                    </PrimaryButton>
                                    <button
                                        type="button"
                                        onClick={() => onAddToWatchlist?.(anime)}
                                        className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition"
                                    >
                                        <Plus size={18} />
                                        {isInWatchlist?.(anime.mal_id)
                                            ? "In Watchlist"
                                            : "Add to Watchlist"}
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
                                goToHeroSlide(
                                    (heroIndex - 1 + heroList.length) % heroList.length
                                )
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                goToHeroSlide((heroIndex + 1) % heroList.length)
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Next slide"
                        >
                            <ChevronRight size={28} />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                            {heroList.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => goToHeroSlide(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                    aria-current={i === heroIndex ? "true" : undefined}
                                    className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent ${i === heroIndex
                                            ? "w-6 bg-white"
                                            : "w-2 bg-white/50 hover:bg-white/70"
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </section>
        );
    }
);

HeroCarousel.displayName = "HeroCarousel";

export default HeroCarousel;

import React, { useState, useCallback, useMemo, memo } from "react";
import { Star, MessageSquareText, ChevronDown, ChevronUp, Play, Quote, User, Sparkles } from "lucide-react";
import { useAnimeReviews } from "../../queries/useAnimeReviews";

const ReviewSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6">
    <div className="aspect-[16/9] rounded-3xl bg-[#08080c] border border-white/[0.04] animate-shimmer" />
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[2/3] rounded-2xl bg-[#08080c] border border-white/[0.04] animate-shimmer"
        />
      ))}
    </div>
  </div>
);

const AnimeReviews = memo(({ onSelectAnime }) => {
  const { data: reviews = [], isLoading } = useAnimeReviews();
  const [expanded, setExpanded] = useState({});
  const [scoreFilter, setScoreFilter] = useState("all");
  const [isExpandedAll, setIsExpandedAll] = useState(false);

  const toggleExpand = useCallback((id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const filteredReviews = useMemo(() => {
    if (scoreFilter === "9plus") {
      return reviews.filter((r) => Number(r.score) >= 9);
    }
    if (scoreFilter === "8plus") {
      return reviews.filter((r) => Number(r.score) >= 8);
    }
    return reviews;
  }, [reviews, scoreFilter]);

  const heroReview = filteredReviews[0] || null;
  const primaryGridReviews = filteredReviews.slice(1, 5);
  const extraReviews = filteredReviews.slice(5);

  if (isLoading && !reviews.length) {
    return <ReviewSkeleton />;
  }

  if (!reviews.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)] bg-[#08080c] rounded-3xl border border-white/[0.06]">
        <MessageSquareText size={36} className="mb-3 opacity-40" />
        <p className="text-sm">No reviews available at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] max-w-fit">
          <button
            type="button"
            onClick={() => setScoreFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              scoreFilter === "all"
                ? "bg-white text-black shadow-md scale-[1.02]"
                : "text-white/70 hover:text-white"
            }`}
          >
            All Insights ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setScoreFilter("9plus")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              scoreFilter === "9plus"
                ? "bg-white text-black shadow-md scale-[1.02]"
                : "text-white/70 hover:text-white"
            }`}
          >
            Masterpieces (9+ ★)
          </button>
          <button
            type="button"
            onClick={() => setScoreFilter("8plus")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              scoreFilter === "8plus"
                ? "bg-white text-black shadow-md scale-[1.02]"
                : "text-white/70 hover:text-white"
            }`}
          >
            Top Rated (8+ ★)
          </button>
        </div>

        {filteredReviews.length > 5 && (
          <button
            type="button"
            onClick={() => setIsExpandedAll((prev) => !prev)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all"
          >
            <Sparkles size={13} className="text-[var(--primary-color)]" />
            <span>{isExpandedAll ? "Collapse" : `Expand (${filteredReviews.length})`}</span>
            {isExpandedAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Primary Dual-Pane Layout: Left Hero Spotlight + Right 4-Tile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6 items-stretch">
        {/* Left Hero Spotlight Review Card */}
        {heroReview && (
          (() => {
            const user = heroReview.user;
            const entry = heroReview.entry;
            const isExpanded = expanded[heroReview.mal_id];
            const reviewText = heroReview.review || "";
            const hasLongText = reviewText.length > 340;
            const displayText =
              hasLongText && !isExpanded ? `${reviewText.slice(0, 340)}...` : reviewText;

            const bgImg =
              entry?.images?.webp?.large_image_url ||
              entry?.images?.webp?.image_url ||
              entry?.images?.jpg?.large_image_url ||
              entry?.images?.jpg?.image_url;

            return (
              <div className="relative rounded-3xl overflow-hidden bg-[#08080c] border border-white/[0.06] hover:border-white/20 transition-all duration-300 flex flex-col justify-between p-6 sm:p-8 min-h-[380px] shadow-[0_20px_50px_rgba(0,0,0,0.95)] group select-none">
                {/* Background Artwork Vignette */}
                {bgImg && (
                  <img
                    src={bgImg}
                    alt={entry?.title || "Anime"}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.25] contrast-[1.1] blur-[1px]"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/85 to-black/60" />
                <div className="specular-highlight opacity-30 group-hover:opacity-100 transition-opacity" />

                {/* Top Row: User Avatar & Score Badge */}
                <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {user?.images?.jpg?.image_url ? (
                      <img
                        src={user.images.jpg.image_url}
                        alt={user?.username || "Reviewer"}
                        className="w-11 h-11 rounded-full object-cover border border-white/20 shadow-md flex-shrink-0"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white/60 border border-white/20 flex-shrink-0">
                        <User size={20} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-white truncate">
                          {user?.username || "Featured Reviewer"}
                        </p>
                        <span className="px-2 py-0.5 rounded-full bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/30 text-[9px] font-bold uppercase tracking-wider">
                          Spotlight
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-dim)]">
                        {heroReview.date
                          ? new Date(heroReview.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Verified Review"}
                      </p>
                    </div>
                  </div>

                  {heroReview.score && (
                    <div className="flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                      <Star size={12} fill="currentColor" />
                      <span>{heroReview.score}/10</span>
                    </div>
                  )}
                </div>

                {/* Quote Excerpt */}
                <div className="relative z-10 my-3 space-y-2">
                  <Quote size={24} className="text-[var(--primary-color)] opacity-60" />
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal italic">
                    &ldquo;{displayText}&rdquo;
                  </p>

                  {hasLongText && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(heroReview.mal_id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary-color)] hover:text-white transition-colors pt-1"
                    >
                      <span>{isExpanded ? "Show Less" : "Read Full Review"}</span>
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  )}
                </div>

                {/* Bottom Row: Linked Anime & Watch Button */}
                {entry && (
                  <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 mt-auto">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-black/60 flex-shrink-0 border border-white/15">
                        {bgImg && (
                          <img
                            src={bgImg}
                            alt={entry.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">
                          Reviewed Series
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-white truncate max-w-sm">
                          {entry.title}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectAnime?.(entry)}
                      className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-xs font-bold shadow-md hover:scale-105 transition-transform"
                    >
                      <Play size={13} className="fill-black" />
                      Watch Show
                    </button>
                  </div>
                )}
              </div>
            );
          })()
        )}

        {/* Right 4-Tile Grid of Other Community Reviews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {primaryGridReviews.map((review) => {
            const user = review.user;
            const entry = review.entry;
            const posterImg =
              entry?.images?.webp?.large_image_url ||
              entry?.images?.webp?.image_url ||
              entry?.images?.jpg?.large_image_url ||
              entry?.images?.jpg?.image_url;

            const reviewText = review.review || "";
            const snippet =
              reviewText.length > 130 ? `${reviewText.slice(0, 130)}...` : reviewText;

            return (
              <div
                key={review.mal_id}
                onClick={() => entry && onSelectAnime?.(entry)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && entry) onSelectAnime?.(entry);
                }}
                className="group/card relative rounded-2xl overflow-hidden bg-[#08080c] border border-white/[0.06] hover:border-white/20 p-4 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none space-y-3 hover:scale-[1.02]"
              >
                <div>
                  {/* Card Header: User & Score */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {user?.images?.jpg?.image_url ? (
                        <img
                          src={user.images.jpg.image_url}
                          alt={user?.username || "Viewer"}
                          className="w-7 h-7 rounded-full object-cover border border-white/10 flex-shrink-0"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs border border-white/10 flex-shrink-0">
                          <User size={12} />
                        </div>
                      )}
                      <p className="text-xs font-bold text-white truncate">
                        {user?.username || "Viewer"}
                      </p>
                    </div>

                    {review.score && (
                      <div className="flex items-center gap-0.5 bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded-full text-[10px] font-black">
                        <Star size={9} fill="currentColor" /> {review.score}
                      </div>
                    )}
                  </div>

                  {/* Review Snippet */}
                  <p className="text-xs text-white/70 line-clamp-3 leading-relaxed">
                    &ldquo;{snippet}&rdquo;
                  </p>
                </div>

                {/* Linked Mini Card Thumbnail */}
                {entry && (
                  <div className="flex items-center gap-2.5 pt-2 border-t border-white/[0.06]">
                    <div className="relative w-8 h-11 rounded-lg overflow-hidden bg-black/60 flex-shrink-0 border border-white/10">
                      {posterImg && (
                        <img
                          src={posterImg}
                          alt={entry.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate group-hover/card:text-[var(--primary-color)] transition-colors">
                        {entry.title}
                      </h4>
                      <p className="text-[10px] text-[var(--text-dim)] truncate">
                        Tap to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Grid Rows for Extra Community Reviews */}
      {isExpandedAll && extraReviews.length > 0 && (
        <div className="space-y-4 pt-2 border-t border-white/[0.06] animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50">
            <MessageSquareText size={14} className="text-[var(--primary-color)]" />
            <span>Additional Community Reviews & Critiques</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {extraReviews.map((review) => {
              const user = review.user;
              const entry = review.entry;
              const isExpanded = expanded[review.mal_id];
              const reviewText = review.review || "";
              const hasLongText = reviewText.length > 200;
              const displayText =
                hasLongText && !isExpanded ? `${reviewText.slice(0, 200)}...` : reviewText;

              const posterImg =
                entry?.images?.webp?.large_image_url ||
                entry?.images?.webp?.image_url ||
                entry?.images?.jpg?.large_image_url ||
                entry?.images?.jpg?.image_url;

              return (
                <div
                  key={review.mal_id}
                  className="rounded-3xl bg-[#08080c] hover:bg-[#0c0c12] border border-white/[0.06] hover:border-white/20 p-5 transition-all duration-300 flex flex-col justify-between space-y-3 group/extra select-none"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {user?.images?.jpg?.image_url ? (
                          <img
                            src={user.images.jpg.image_url}
                            alt={user?.username || "Viewer"}
                            className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs border border-white/10 flex-shrink-0">
                            <User size={14} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {user?.username || "Community Reviewer"}
                          </p>
                          <p className="text-[10px] text-[var(--text-dim)]">
                            {review.date
                              ? new Date(review.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Verified Review"}
                          </p>
                        </div>
                      </div>

                      {review.score && (
                        <div className="flex items-center gap-1 bg-yellow-500/15 text-yellow-400 px-2.5 py-1 rounded-full text-xs font-black">
                          <Star size={10} fill="currentColor" /> {review.score}/10
                        </div>
                      )}
                    </div>

                    {/* Review text */}
                    <p className="text-xs text-white/80 leading-relaxed italic">
                      &ldquo;{displayText}&rdquo;
                    </p>

                    {hasLongText && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(review.mal_id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary-color)] hover:text-white transition-colors"
                      >
                        <span>{isExpanded ? "Show Less" : "Read Full Review"}</span>
                        {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                    )}
                  </div>

                  {/* Linked Anime Banner */}
                  {entry && (
                    <div
                      onClick={() => onSelectAnime?.(entry)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") onSelectAnime?.(entry);
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.04] hover:border-white/15 transition-all cursor-pointer select-none mt-auto"
                    >
                      <div className="relative w-9 h-12 rounded-lg overflow-hidden bg-black/60 flex-shrink-0 border border-white/10">
                        {posterImg && (
                          <img
                            src={posterImg}
                            alt={entry.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate group-hover/extra:text-[var(--primary-color)] transition-colors">
                          {entry.title}
                        </h4>
                        <span className="text-[10px] text-[var(--primary-color)] font-semibold flex items-center gap-1 mt-0.5">
                          <Play size={9} className="fill-current" /> Watch Show
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expand / Collapse Section Button */}
      {extraReviews.length > 0 && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setIsExpandedAll((prev) => !prev)}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-2xl transition-all duration-300 hover:scale-105 shadow-xl active:scale-95 select-none"
          >
            <MessageSquareText size={15} className="text-[var(--primary-color)]" />
            <span>
              {isExpandedAll
                ? "Collapse Community Reviews"
                : `Show All Community Reviews (${filteredReviews.length})`}
            </span>
            {isExpandedAll ? (
              <ChevronUp size={16} className="transition-transform group-hover:-translate-y-0.5" />
            ) : (
              <ChevronDown size={16} className="transition-transform group-hover:translate-y-0.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
});

AnimeReviews.displayName = "AnimeReviews";

export default AnimeReviews;

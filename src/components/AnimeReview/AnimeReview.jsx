import React, { useEffect, useState, useCallback } from "react";
import { Star, MessageSquareText, ChevronDown, ChevronUp } from "lucide-react";

const ReviewSkeleton = () => (
  <div className="p-5 animate-shimmer">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-white/10" />
      <div className="flex-1">
        <div className="h-3.5 w-24 rounded bg-white/10" />
        <div className="h-3 w-16 rounded bg-white/10 mt-1.5" />
      </div>
    </div>
    <div className="flex gap-3">
      <div className="w-20 h-28 rounded-lg bg-white/10 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-full rounded bg-white/8" />
        <div className="h-3 w-5/6 rounded bg-white/8" />
      </div>
    </div>
  </div>
);

const AnimeReviews = ({ onSelectAnime }) => {
  const [reviews, setReviews] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://api.jikan.moe/v4/reviews/anime", {
          signal: controller.signal,
        });
        const data = await res.json();
        setReviews(data?.data || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to load reviews:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
    return () => controller.abort();
  }, []);

  const toggleExpand = useCallback(
    (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] })),
    []
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border-color)]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--surface-1)]/50">
            <ReviewSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
        <MessageSquareText size={36} className="mb-3 opacity-40" />
        <p className="text-sm">No reviews available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 max-h-[80vh] overflow-y-auto scrollbar-thin">
      {reviews.map((review) => {
        const user = review.user;
        const entry = review.entry;
        const isExpanded = expanded[review.mal_id];
        const text =
          review.review.length > 350 && !isExpanded
            ? `${review.review.slice(0, 350)}...`
            : review.review;

        return (
          <div
            key={review.mal_id}
            className="border-b border-r border-[var(--border-color)] p-5 transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3 mb-3">
              <img
                src={user?.images?.jpg?.image_url}
                alt={user?.username}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-[var(--border-color)]"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-color)] font-medium truncate">
                  {user?.username}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {new Date(review.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-yellow-500/15 text-yellow-400 px-2 py-1 rounded-lg">
                <Star size={12} fill="currentColor" />
                <span className="text-xs font-bold">{review.score || "?"}</span>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => onSelectAnime?.(entry)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectAnime?.(entry);
              }}
              className="flex gap-3 rounded-xl bg-[var(--surface-1)]/50 p-3 cursor-pointer hover:bg-[var(--surface-1)]/80 transition-colors"
            >
              <img
                src={
                  entry?.images?.webp?.image_url ||
                  entry?.images?.jpg?.image_url
                }
                alt={entry?.title}
                className="w-16 h-22 object-cover rounded-lg flex-shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-[var(--text-color)] font-semibold text-sm mb-1 line-clamp-1">
                  {entry?.title}
                </h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {review.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[9px] uppercase px-1.5 py-px bg-[var(--primary-color)]/15 text-[var(--primary-color)] rounded-md font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                  {review.is_spoiler && (
                    <span className="text-[9px] px-1.5 py-px bg-yellow-500/15 text-yellow-400 rounded-md font-semibold">
                      Spoiler
                    </span>
                  )}
                </div>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed whitespace-pre-line">
                  {text}
                </p>
                {review.review.length > 350 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(review.mal_id);
                    }}
                    className="flex items-center gap-1 mt-2 text-[var(--primary-color)] text-xs font-medium hover:opacity-80 transition-opacity"
                  >
                    {isExpanded ? (
                      <>Show less <ChevronUp size={12} /></>
                    ) : (
                      <>Read more <ChevronDown size={12} /></>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-[var(--text-muted)] mt-3 pt-2.5 border-t border-[var(--border-color)]">
              <span className="flex items-center gap-1">
                <MessageSquareText size={11} />
                Helpful: {review.reactions?.overall || 0}
              </span>
              <a
                href={review.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary-color)] hover:underline font-medium"
              >
                View on MAL
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnimeReviews;

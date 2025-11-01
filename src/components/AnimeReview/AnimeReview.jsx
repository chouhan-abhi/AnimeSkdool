import React, { useEffect, useState } from "react";
import { Star, MessageSquareText, ChevronDown, ChevronUp } from "lucide-react";

const AnimeReviews = ({ animeId }) => {
  const [reviews, setReviews] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://api.jikan.moe/v4/reviews/anime`);
        const data = await res.json();
        setReviews(data?.data || []);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [animeId]);

  if (loading)
    return (
      <div className="text-gray-400 text-center p-8 animate-pulse">
        Loading reviews...
      </div>
    );

  if (!reviews.length)
    return (
      <div className="text-gray-500 text-center p-8">
        No reviews available yet.
      </div>
    );

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    // ✅ Scrollable fixed-height container
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
      {reviews.map((review) => {
        const user = review.user;
        const entry = review.entry;
        const isExpanded = expanded[review.mal_id];
        const text =
          review.review.length > 400 && !isExpanded
            ? review.review.slice(0, 400) + "..."
            : review.review;

        return (
          <div
            key={review.mal_id}
            className="bg-gray-900/70 border border-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-800">
              <img
                src={user?.images?.jpg?.image_url}
                alt={user?.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-200 font-medium">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(review.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Star size={14} className="text-yellow-400" />
                <span className="text-sm text-yellow-400 font-semibold">
                  {review.score || "?"}
                </span>
              </div>
            </div>

            {/* Anime Info */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-800/40">
              <img
                src={
                  entry?.images?.webp?.image_url ||
                  entry?.images?.jpg?.image_url
                }
                alt={entry?.title}
                className="w-full sm:w-24 sm:h-32 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-white font-semibold text-base mb-1">
                  {entry?.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {review.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] uppercase px-2 py-[2px] bg-red-500/20 text-red-400 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {review.is_spoiler && (
                    <span className="text-[10px] px-2 py-[2px] bg-yellow-500/20 text-yellow-400 rounded-full">
                      Spoiler
                    </span>
                  )}
                </div>

                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {text}
                </p>

                {review.review.length > 400 && (
                  <button
                    onClick={() => toggleExpand(review.mal_id)}
                    className="flex items-center gap-1 mt-2 text-blue-400 text-xs hover:text-blue-300 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        Show less <ChevronUp size={12} />
                      </>
                    ) : (
                      <>
                        Read more <ChevronDown size={12} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 px-4 py-3 border-t border-gray-800">
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <MessageSquareText size={12} />
                  Helpful: {review.reactions?.overall || 0}
                </span>
              </div>
              <a
                href={review.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
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

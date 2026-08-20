import React, { useState } from "react";
import { useEpisodes } from "../queries/useEpisodes";
import { useToast } from "../utils/toast";
import { Play, Star, Calendar } from "lucide-react";

const EpisodesList = ({ animeId, animeName }) => {
  const [visibleCount, setVisibleCount] = useState(6);
  const { showToast } = useToast();
  const { data: episodes = [], isLoading, isError } = useEpisodes(animeId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-white/5 animate-shimmer" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-red-400 py-4 text-center">Failed to load episode list.</p>
    );
  }

  if (!episodes.length) {
    return (
      <p className="text-sm text-white/50 py-4 text-center">No individual episodes listed.</p>
    );
  }

  const visibleEpisodes = episodes.slice(0, visibleCount);

  return (
    <div className="space-y-3">
      <div className="space-y-2.5">
        {visibleEpisodes.map((ep) => (
          <div
            key={ep.mal_id}
            onClick={() => {
              if (animeName && ep.mal_id) {
                window.open(
                  `https://9anime.org.lv/${animeName
                    .toLowerCase()
                    .replace(/\s+/g, "-")}-episode-${ep.mal_id}/`
                );
              } else {
                showToast("Episode details are unavailable", "error");
              }
            }}
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                if (animeName && ep.mal_id) {
                  window.open(
                    `https://9anime.org.lv/${animeName
                      .toLowerCase()
                      .replace(/\s+/g, "-")}-episode-${ep.mal_id}/`
                  );
                }
              }
            }}
          >
            {/* Play Button & Episode Title */}
            <div className="flex items-center gap-3.5 min-w-0 pr-3">
              <span className="flex-shrink-0 w-9 h-9 rounded-full bg-white/10 group-hover:bg-white group-hover:text-black text-white flex items-center justify-center transition-all duration-200">
                <Play size={14} className="fill-current translate-x-0.5" />
              </span>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">
                    Episode {ep.mal_id}
                  </span>
                  {ep.score && (
                    <span className="flex items-center gap-0.5 text-[10px] text-yellow-400 font-bold">
                      <Star size={9} fill="currentColor" /> {ep.score}
                    </span>
                  )}
                </div>
                <h5 className="text-sm font-semibold text-white truncate group-hover:text-[var(--primary-color)] transition-colors">
                  {ep.title || `Episode ${ep.mal_id}`}
                </h5>
                {ep.title_japanese && (
                  <p className="text-[11px] text-white/40 truncate">
                    {ep.title_japanese}
                  </p>
                )}
              </div>
            </div>

            {/* Air Date & Stream Trigger */}
            <div className="flex items-center gap-3 text-xs text-white/50 flex-shrink-0">
              {ep.aired && (
                <span className="hidden sm:inline">
                  {new Date(ep.aired).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-white/10 group-hover:bg-white group-hover:text-black text-white text-xs font-semibold transition-all">
                Stream
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Episodes Pill */}
      {visibleCount < episodes.length && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 8)}
            className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 backdrop-blur-xl transition-all hover:scale-105"
          >
            Show More ({episodes.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default EpisodesList;

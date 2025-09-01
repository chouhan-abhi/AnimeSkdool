import React, { useState } from "react";
import { useEpisodes } from "../queries/useEpisodes";

const EpisodesList = ({ animeId }) => {
  const [visibleCount, setVisibleCount] = useState(3);

  const { data: episodes = [], isLoading, isError } = useEpisodes(animeId);

  if (isLoading) return <p className="text-gray-400">Loading episodes...</p>;
  if (isError) return <p className="text-red-400">Failed to load episodes.</p>;
  if (!episodes.length) return <p className="text-gray-400">No episodes available.</p>;

  const visibleEpisodes = episodes.slice(0, visibleCount);

  return (
    <div className="mb-6 p-2 bg-black/30 rounded-lg" style={{ backdropFilter: "blur(4px)" }}>
      <h4 className="font-semibold text-lg mb-2">Episodes</h4>
      <div className="flex flex-col gap-2">
        {visibleEpisodes.map((ep) => (
          <div
            key={ep.mal_id}
            className="flex justify-between items-center border border-gray-700 rounded-lg px-3 py-2 hover:bg-gray-700/40 transition"
          >
            {/* Left side → Episode number + title */}
            <div className="flex flex-col">
              <span className="font-semibold text-sm">
                Ep {ep.mal_id}: {ep.title || "Untitled"}
              </span>
              {ep.title_japanese && (
                <span className="text-xs text-gray-400 italic">{ep.title_japanese}</span>
              )}
            </div>

            {/* Right side → Date + Score */}
            <div className="text-right text-xs text-gray-400 flex flex-col">
              <span>{ep.aired ? new Date(ep.aired).toLocaleDateString() : "N/A"}</span>
              {ep.score && (
                <span className="text-yellow-400 font-medium">⭐ {ep.score}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show more button */}
      {visibleCount < episodes.length && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setVisibleCount(visibleCount + 5)}
            className="text-sm px-3 py-1 hover:bg-gray-600 rounded-full transition"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
};

export default EpisodesList;

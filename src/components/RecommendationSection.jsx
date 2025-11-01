import React, { useState } from "react";
import { useRandomAnimeList } from "../queries/useRandomAnimeList";
import AnimeDetailsPanel from "./AnimeDetailsPanel";
import PageLoader from "../helperComponent/PageLoader";
import AnimeDetailCard from "../helperComponent/AnimeDetailCard";

const RecommendationSection = () => {
  const [selectedAnime, setSelectedAnime] = useState(null);

  // 🔥 Use custom React Query hook
  const {
    data: randomAnimeList = [],
    isLoading,
    isFetching,
    refetch,
    isError,
  } = useRandomAnimeList(8);

  return (
    <div className="py-4 flex flex-col items-center rounded-2xl backdrop-blur-md w-full">
      {/* Content */}
      {isLoading ? (
        <div className="w-full py-10">
          <PageLoader />
        </div>
      ) : isError ? (
        <p className="text-gray-400 mt-4">⚠️ Failed to fetch random anime.</p>
      ) : randomAnimeList.length > 0 ? (
        <div className="w-full grid grid-cols-2 lg:grid-cols-2 gap-4 place-items-center">
          {randomAnimeList.map((anime) => (
            <div
              key={anime.mal_id}
              onClick={() => setSelectedAnime(anime)}
              className="cursor-pointer w-full"
            >
              <AnimeDetailCard anime={anime} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 mt-4">No anime found. Try refreshing!</p>
      )}

      {/* Details Panel */}
      {selectedAnime && (
        <AnimeDetailsPanel
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
        />
      )}
    </div>
  );
};

export default RecommendationSection;

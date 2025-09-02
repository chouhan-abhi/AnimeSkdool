import React from "react";
import { useUpcomingAnime } from "../queries/useUpcomingAnime";
import PageLoader from "../helperComponent/PageLoader";
import AnimeDetailCard from "../helperComponent/AnimeDetailCard";

const UpcomingAnimeList = () => {
  const { data: animeList, isLoading, isError, error } = useUpcomingAnime();

  if (isLoading) {
    return <PageLoader />
  }

  if (isError) {
    return (
      <div className="text-center py-6 text-red-500">
        ❌ {error.message || "Failed to load upcoming anime"}
      </div>
    );
  }

  return (
    <div className="p-4 h-full">
      <div className="h-full overflow-y-auto pr-2">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {animeList?.map((anime) => (
            <AnimeDetailCard key={anime.mal_id} anime={anime} showStatusBadge />
          ))}
        </div>
      </div>
    </div>

  );
};

export default UpcomingAnimeList;

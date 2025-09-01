import React from "react";
import { useUpcomingAnime } from "../queries/useUpcomingAnime";
import AnimeCard from "../helperComponent/AnimeCard";
import PageLoader from "../helperComponent/PageLoader";

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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--primary-color)" }}>
        Upcoming Anime
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {animeList?.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} showStatusBadge />
        ))}
      </div>
    </div>
  );
};

export default UpcomingAnimeList;

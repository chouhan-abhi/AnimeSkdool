import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NoAnimeFound from "../helperComponent/NoAnimeFound";
import PageLoader from "../helperComponent/PageLoader";
import AnimeDetailCard from "../helperComponent/AnimeDetailCard";

import { jikanFetch } from "../utils/jikanClient";

// Fetch seasons list
const fetchSeasonsList = async () => {
  const json = await jikanFetch("/seasons");
  return json?.data || [];
};

// Fetch anime for a specific season
const fetchSeasonAnime = async ({ queryKey }) => {
  const [_key, { year, season }] = queryKey;
  const json = await jikanFetch(`/seasons/${year}/${season}`);
  return json?.data || [];
};

const SeasonsExplorer = () => {
  const [selectedSeason, setSelectedSeason] = useState(null);

  // Query: Seasons List
  const {
    data: seasons,
    isLoading: loadingSeasons,
    error: seasonsError,
  } = useQuery({
    queryKey: ["seasonsList"],
    queryFn: fetchSeasonsList,
    staleTime: 1000 * 60 * 60, // 1h cache
    refetchOnWindowFocus: false,
  });

  // Query: Anime in selected season
  const {
    data: seasonAnime,
    isLoading: loadingAnime,
    error: animeError,
  } = useQuery({
    queryKey: ["seasonAnime", selectedSeason],
    queryFn: fetchSeasonAnime,
    enabled: !!selectedSeason, // only run when selected
    staleTime: 1000 * 60 * 10, // 10 min
    refetchOnWindowFocus: false,
  });

  if (loadingSeasons) return <PageLoader />;
  if (seasonsError) return <NoAnimeFound message={seasonsError.message} />;

  return (
    <div className="p-6 space-y-8">
      {/* Seasons Grid */}
      <h2 className="text-2xl font-bold text-[var(--text-color)] mb-4">
        Explore Seasons
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {seasons.map(({ year, season, url }) => {
          const isSelected =
            selectedSeason?.year === year && selectedSeason?.season === season;
          return (
            <div
              key={`${year}-${season}`}
              onClick={() => setSelectedSeason({ year, season })}
              className={`cursor-pointer rounded-3xl p-6 flex flex-col items-center justify-center transition-all duration-200 border ${
                isSelected
                  ? "bg-white text-black border-white shadow-xl scale-[1.02]"
                  : "bg-[#08080c] text-white border-white/[0.06] hover:border-white/25 hover:bg-[#0f0f14]"
              }`}
            >
              <h3 className="text-xl font-bold capitalize tracking-tight">
                {season} {year}
              </h3>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-2 text-xs font-medium underline transition-opacity ${
                    isSelected ? "text-black/70 hover:text-black" : "text-white/50 hover:text-white"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  View on MAL
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Season Anime */}
      {selectedSeason && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-[var(--text-color)] mb-4">
            {selectedSeason.season} {selectedSeason.year} Anime
          </h3>

          {loadingAnime ? (
            <PageLoader />
          ) : animeError ? (
            <NoAnimeFound message={animeError.message} />
          ) : !seasonAnime || seasonAnime.length === 0 ? (
            <NoAnimeFound message="No anime found for this season." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {seasonAnime.map((anime) => (
                <AnimeDetailCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeasonsExplorer;

import React, { useState, useEffect } from "react";
import AnimeDetailsPanel from "./AnimeDetailsPanel";
import RecommendationSection from "./RecommendationSection";
import { useAnimeSearch } from "../queries/useAnimeSearch";
import PageLoader from "../helperComponent/PageLoader";

const AppHome = () => {
  const [search, setSearch] = useState("");
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [starredAnimes, setStarredAnimes] = useState([]);

  // use our new React Query hook
  const { data: results = [], isFetching, isError } = useAnimeSearch(search);

  // Load starred anime from localStorage (cached schedule)
  useEffect(() => {
    try {
      const starredIds = JSON.parse(localStorage.getItem("starredAnime") || "[]");
      const cache = JSON.parse(localStorage.getItem("animeScheduleCache") || "[]");
      const matched = cache.filter((anime) => starredIds.includes(anime.mal_id));
      setStarredAnimes(matched || []);
    } catch (err) {
      console.error("Failed to load starred animes", err);
      setStarredAnimes([]);
    }
  }, []);

  // Clear results when input cleared while typing
  const handleInputChange = (e) => {
    const v = e.target.value;
    setSearch(v);
  };

  // Card component (responsive widths so small screens show 2 per row)
  const AnimeCard = ({ anime }) => {
    if (!anime) return null;
    return (
      <div
        className="relative rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition 
                   w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/4 max-w-[148px]"
        onClick={() => setSelectedAnime(anime)}
      >
        <div className="aspect-[3/4] w-full bg-gray-700 rounded-lg overflow-hidden">
          <img
            src={anime.images?.webp?.image_url || anime.images?.jpg?.image_url}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* bottom gradient + title overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/90 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold leading-tight line-clamp-2">
            {anime.title}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center py-6 px-2 text-white min-h-screen">
      {/* Search Bar */}
      <form onSubmit={(e) => e.preventDefault()} className="w-full flex justify-center mt-8 mb-6 px-4">
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          placeholder="Search your new anime..."
          className="p-2 w-full max-w-xl text-base rounded-full border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Search anime"
        />
      </form>

      {/* Search Results */}
      {isFetching ? (
        <div className="w-full max-w-5xl p-4">
          <PageLoader />
        </div>
      ) : isError ? (
        <p className="text-red-400">Failed to fetch results. Try again later.</p>
      ) : (
        results.length > 0 && (
          <section className="p-2 mx-2 my-4 w-full max-w-5xl flex flex-col items-center text-center">
            <h2 className="text-lg font-semibold text-primary mb-3 w-full px-2 text-[var(--primary-color)]">
              Search Results
            </h2>

            {/* centered row-based layout */}
            <div className="w-full flex flex-wrap justify-center gap-4 py-2">
              {results.slice(0, 20).map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
          </section>
        )
      )}

      {starredAnimes.length > 0 && (
        <section className="p-2 mx-2 my-4 w-full max-w-5xl flex flex-col text-center">
          <h2 className="text-lg font-semibold text-[var(--primary-color)] mb-3 w-full">
            Your Starred Animes
          </h2>

          <div className="w-full flex flex-wrap justify-center gap-4">
            {starredAnimes.map((anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      <section className="w-full mx-2 my-4 px-2">
        <RecommendationSection />
      </section>

      {/* Details Panel */}
      {selectedAnime && (
        <AnimeDetailsPanel anime={selectedAnime} onClose={() => setSelectedAnime(null)} />
      )}
    </div>
  );
};

export default AppHome;

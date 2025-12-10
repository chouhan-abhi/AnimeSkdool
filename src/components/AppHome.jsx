import React, { useState, Suspense, lazy, useEffect, useCallback } from "react";
import { useAnimeSearch } from "../queries/useAnimeSearch";
import { useStarredAnime } from "../queries/useStarredAnime";
import { useWatchlistAnime } from "../queries/useWatchlistAnime";
import PageLoader, { GridLoader, MiniLoader, DetailsPanelLoader } from "../helperComponent/PageLoader";
import { useDebounce } from "../utils/utils";

const AnimeDetailsPanel = lazy(() => import("./AnimeDetailsPanel"));
const RecommendationSection = lazy(() => import("./RecommendationSection"));
const AnimeReview = lazy(() => import("./AnimeReview/AnimeReview"));

const AppHome = () => {
  const [search, setSearch] = useState("");
  const [selectedAnime, setSelectedAnime] = useState(null);
  const debouncedSearch = useDebounce(search);
  const { data: results = [], isFetching, isError } = useAnimeSearch(debouncedSearch);

  const { data: starredAnimes = [] } = useStarredAnime();
  const { data: watchlistAnimes = [] } = useWatchlistAnime();

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        import("./AnimeReview/AnimeReview");
        import("./AnimeDetailsPanel");
        import("./RecommendationSection");
      });
    } else {
      setTimeout(() => {
        import("./AnimeReview/AnimeReview");
        import("./AnimeDetailsPanel");
        import("./RecommendationSection");
      }, 2000);
    }
  }, []);


  const handleInputChange = (e) => setSearch(e.target.value);

  // Memoize onClose to prevent re-renders
  const handleClosePanel = useCallback(() => {
    setSelectedAnime(null);
  }, []);

  const AnimeCard = ({ anime }) => {
    if (!anime) return null;
    return (
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer transform hover:scale-[1.03] transition duration-300
                   w-[46%] sm:w-[30%] md:w-[23%] xl:w-[20%] max-w-[160px] group shadow-sm"
        onClick={() => setSelectedAnime(anime)}
      >
        <div className="aspect-[3/4] w-full rounded-xl overflow-hidden">
          <img
            src={anime.images?.webp?.image_url || anime.images?.jpg?.image_url}
            alt={anime.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              if (e.target) {
                e.target.style.display = 'none';
              }
            }}
          />
        </div>

        {/* Overlay for title */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/90 to-transparent">
          <div className="text-white text-sm font-semibold leading-tight line-clamp-2 drop-shadow-lg">
            {anime.title}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center py-8 px-2 text-on-background min-h-screen transition-colors">
      <div className="w-full max-w-[1900px] grid grid-cols-1 lg:grid-cols-[68%_32%] gap-8">
        {/* =================== LEFT PANEL =================== */}
        <div className="flex flex-col w-full rounded-2xl bg-surface transition-colors">
          {/* Search Bar */}
          <form onSubmit={(e) => e.preventDefault()} className="w-full hover:text-[var(--primary-color)]">
            <input
              type="text"
              value={search}
              onChange={handleInputChange}
              placeholder="Search for an anime..."
              className="p-3 w-full text-base shadow-md rounded-full bg-gray-900/90
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
            />
          </form>

          {/* Search Results */}
          {isFetching ? (
            <div className="p-4 my-4 w-full bg-gray-900/90 rounded-xl">
              <GridLoader count={4} />
            </div>
          ) : isError ? (
            <p className="text-[var(--error-color)] p-4 my-4 w-full bg-gray-900/90 rounded-xl">
              Failed to fetch results. Try again later.
            </p>
          ) : (
            results.length > 0 && (
              <section className="p-4 my-4 w-full bg-gray-900/90 rounded-xl">
                <h2 className="text-lg font-semibold text-[var(--primary-color)] mb-3">
                  Search Results
                </h2>
                <div className="w-full flex flex-wrap justify-start gap-4">
                  {results.slice(0, 20).map((anime) => (
                    <AnimeCard key={anime.mal_id} anime={anime} />
                  ))}
                </div>
              </section>
            )
          )}

          {/* Starred Section */}
          {starredAnimes?.length > 0 && (
            <section className="p-4 bg-gray-900/90  rounded-xl bg-surface-variant shadow-sm transition-colors mt-8">
              <h2 className="text-lg font-semibold text-[var(--primary-color)] mb-3">
                ⭐ Your Starred Animes
              </h2>
              <div className="w-full flex flex-wrap justify-start gap-4">
                {starredAnimes.map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>
            </section>
          )}

          {/* Watchlist Section */}
          {watchlistAnimes?.length > 0 && (
            <section className="p-4 bg-gray-900/90  rounded-xl bg-surface-variant shadow-sm transition-colors mt-8">
              <h2 className="text-lg font-semibold text-[var(--primary-color)] mb-3">
                🎬 Your Watchlist
              </h2>
              <div className="w-full flex flex-wrap justify-start gap-4">
                {watchlistAnimes.map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>
            </section>
          )}

          {/* Recommendation Section */}
          <section className="p-4 bg-gray-900/90  rounded-xl bg-surface-variant shadow-sm transition-colors mt-8">
            <h2 className="text-lg font-semibold text-[var(--primary-color)] mb-3">
              💡 Anime Recommendations
            </h2>
            <Suspense fallback={<GridLoader count={4} className="py-2" />}>
              <RecommendationSection />
            </Suspense>
          </section>
        </div>

        {/* =================== RIGHT SIDEBAR =================== */}
        <aside
          className="w-full rounded-2xl bg-gray-900/90 shadow-sm bg-surface p-5 flex flex-col text-left transition-colors
             mr-4 lg:mr-6 xl:mr-8" // 👈 Added responsive right margin
        >
          <h2 className="text-lg font-semibold text-[var(--primary-color)] mb-4">
            🗨️ Recent Anime Reviews
          </h2>
          <Suspense fallback={<MiniLoader text="Loading reviews..." />}>
            <AnimeReview />
          </Suspense>
        </aside>

      </div>

      {/* =================== DETAILS PANEL =================== */}
      {selectedAnime && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/90 z-[9999] flex flex-col md:flex-row">
              <div className="h-[35vh] md:h-full md:flex-1 bg-gray-900 animate-pulse" />
              <div className="flex-1 md:w-[45%] p-4 md:p-6 text-white">
                <DetailsPanelLoader />
              </div>
            </div>
          }
        >
          <AnimeDetailsPanel
            anime={selectedAnime}
            onClose={handleClosePanel}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AppHome;

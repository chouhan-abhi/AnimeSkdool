import React, {
  useState,
  Suspense,
  lazy,
  useEffect,
  useCallback,
} from "react";
import { useAnimeSearch } from "../queries/useAnimeSearch";
import { useStarredAnime } from "../queries/useStarredAnime";
import { useWatchlistAnime } from "../queries/useWatchlistAnime";
import PageLoader, {
  GridLoader,
  MiniLoader,
  DetailsPanelLoader,
} from "../helperComponent/PageLoader";
import { useDebounce } from "../utils/utils";

const AnimeDetailsPanel = lazy(() => import("./AnimeDetailsPanel"));
const RecommendationSection = lazy(() => import("./RecommendationSection"));
const AnimeReview = lazy(() => import("./AnimeReview/AnimeReview"));

/* ---------------- Shared shadow style ---------------- */
const SECTION_SHADOW =
  "shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_2px_22px_-12px_var(--primary-color)]";

const AppHome = () => {
  const [search, setSearch] = useState("");
  const [selectedAnime, setSelectedAnime] = useState(null);
  const debouncedSearch = useDebounce(search);

  const {
    data: results = [],
    isFetching,
    isError,
  } = useAnimeSearch(debouncedSearch);

  const { data: starredAnimes = [] } = useStarredAnime();
  const { data: watchlistAnimes = [] } = useWatchlistAnime();

  /* ---------------- Preload heavy panels ---------------- */
  useEffect(() => {
    const preload = () => {
      import("./AnimeReview/AnimeReview");
      import("./AnimeDetailsPanel");
      import("./RecommendationSection");
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(preload);
    } else {
      setTimeout(preload, 2000);
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedAnime(null);
  }, []);

  const AnimeCard = ({ anime }) => {
    if (!anime) return null;

    return (
      <div
        onClick={() => setSelectedAnime(anime)}
        className="relative rounded-xl overflow-hidden cursor-pointer
          w-[46%] sm:w-[30%] md:w-[23%] xl:w-[20%] max-w-[160px]
          transform hover:scale-[1.04] transition duration-300
          shadow-sm group"
      >
        <div className="aspect-[3/4] w-full overflow-hidden">
          <img
            src={
              anime.images?.webp?.image_url ||
              anime.images?.jpg?.image_url
            }
            alt={anime.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              if (e.target) e.target.style.display = "none";
            }}
          />
        </div>

        <div className="absolute inset-0 flex items-end p-3 bg-gradient-to-t from-black/90 to-transparent">
          <div className="text-white text-sm font-semibold line-clamp-2 drop-shadow-lg">
            {anime.title}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center py-8 px-2 min-h-screen text-on-background">
      <div className="w-full max-w-[1900px] grid grid-cols-1 lg:grid-cols-[68%_32%] gap-8">
        {/* ================= LEFT PANEL ================= */}
        <div className="flex flex-col w-full rounded-2xl bg-surface">
          {/* Search */}
          <form onSubmit={(e) => e.preventDefault()} className="w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for an anime..."
              className={`p-3 w-full rounded-full text-[var(--primary-color)] bg-transparent ${SECTION_SHADOW}
                focus:outline-none focus:ring-2
                focus:ring-[var(--primary-color)] transition `}
            />
          </form>

          {/* Search Results */}
          {isFetching ? (
            <div className={`p-4 my-4 rounded-xl ${SECTION_SHADOW}`}>
              <GridLoader count={4} />
            </div>
          ) : isError ? (
            <p className="p-4 my-4 rounded-xl text-[var(--error-color)]">
              Failed to fetch results.
            </p>
          ) : (
            results.length > 0 && (
              <section
                className={`p-4 my-4 rounded-xl ${SECTION_SHADOW}`}
              >
                <h2 className="text-lg font-semibold text-[var(--primary-color)] mb-2">
                  Search Results
                </h2>
                <div className="flex flex-wrap gap-4">
                  {results.slice(0, 20).map((anime) => (
                    <AnimeCard key={anime.mal_id} anime={anime} />
                  ))}
                </div>
              </section>
            )
          )}

          {/* Starred */}
          {starredAnimes.length > 0 && (
            <section
              className={`p-4 mt-8 rounded-xl ${SECTION_SHADOW}`}
            >
              <h2 className="text-lg font-semibold text-[var(--primary-color)] mb-2">
                Your Starred Animes
              </h2>
              <div className="flex flex-wrap gap-4">
                {starredAnimes.map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>
            </section>
          )}

          {/* Watchlist */}
          {watchlistAnimes.length > 0 && (
            <section
              className={`p-4 mt-8 rounded-xl ${SECTION_SHADOW}`}
            >
              <h2 className="text-lg font-semibold text-[var(--primary-color)] mb-2">
                Your Watchlist
              </h2>
              <div className="flex flex-wrap gap-4">
                {watchlistAnimes.map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>
            </section>
          )}

          {/* Recommendations */}
          <section
            className={`px-4 py-2 mt-8 rounded-xl ${SECTION_SHADOW}`}
          >
            <h2 className="text-lg font-semibold text-[var(--primary-color)]">
              Anime Recommendations
            </h2>
            <Suspense fallback={<GridLoader count={4} className="py-2" />}>
              <RecommendationSection />
            </Suspense>
          </section>
        </div>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside
          className={`w-full rounded-2xl bg-surface p-3 flex flex-col
          ${SECTION_SHADOW}`}
        >
          <h2 className="text-lg font-semibold text-[var(--primary-color)] mb-2">
            Recent Anime Reviews
          </h2>
          <Suspense fallback={<MiniLoader text="Loading reviews..." />}>
            <AnimeReview />
          </Suspense>
        </aside>
      </div>

      {/* ================= DETAILS PANEL ================= */}
      {selectedAnime && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/90 z-[9999] flex">
              <div className="hidden md:block md:flex-1 bg-gray-900" />
              <div className="flex-1 p-6 text-white">
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

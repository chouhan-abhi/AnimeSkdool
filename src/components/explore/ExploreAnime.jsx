import React, { useState, useRef, useCallback, useEffect } from "react";
import { useInfiniteAnimeRanking } from "../../queries/useInfiniteAnimeRanking";
import AnimeDetailsPanel from "../AnimeDetailsPanel";
import AnimeDetailCard from "../../helperComponent/AnimeDetailCard";
import PageLoader from "../../helperComponent/PageLoader";
import { SlidersHorizontal } from "lucide-react";
import ExploreFilters from "./ExploreFilters";
import NoAnimeFound from "../../helperComponent/NoAnimeFound";
import CalendarLoader from "../../helperComponent/CalendarLoader";

const STORAGE_KEYS = {
  type: "animeType",
  filter: "animeFilter",
  rating: "animeRating",
  sfw: "animeSfw",
};

const ExploreAnime = () => {
  // filters (persisted in localStorage)
  const [type, setType] = useState(() => localStorage.getItem(STORAGE_KEYS.type) || "");
  const [filter, setFilter] = useState(
    () => localStorage.getItem(STORAGE_KEYS.filter) || "bypopularity"
  );
  const [rating, setRating] = useState(() => localStorage.getItem(STORAGE_KEYS.rating) || "");
  const [sfw, setSfw] = useState(
    () => (localStorage.getItem(STORAGE_KEYS.sfw) === "false" ? false : true)
  );

  const [selectedAnime, setSelectedAnime] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(false);

  const observerRef = useRef(null);

  // responsive
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // persist filters
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.type, type);
    localStorage.setItem(STORAGE_KEYS.filter, filter);
    localStorage.setItem(STORAGE_KEYS.rating, rating);
    localStorage.setItem(STORAGE_KEYS.sfw, String(sfw));
  }, [type, filter, rating, sfw]);

  // fetch hook (infinite query)
  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteAnimeRanking({ type, filter, rating, sfw });

  // flatten pages into a single array
  const animeList = data?.pages.flatMap((page) => page.data) || [];

  // observer for infinite scroll
  const lastElementRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

return (
  <div className="flex h-full overflow-hidden fixed">
    <main className="flex-1 overflow-y-auto p-4 relative z-0">
      {isMobile && (
        <button
          onClick={() => setShowSidebar(true)}
          style={{ position: "fixed", bottom: "10vh", right: "4vw", zIndex: 999 }}
          className="fixed bottom-20 right-4 p-3 bg-[var(--primary-color)] rounded-full shadow-md z-[99]"
        >
          <SlidersHorizontal size={24} />
        </button>
      )}

      {isLoading ? (
        <CalendarLoader />
      ) : error ? (
        <NoAnimeFound message={error.message || String(error)} />
      ) : animeList.length === 0 ? (
        <NoAnimeFound />
      ) : (
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {animeList.map((anime, idx) => {
            if (animeList.length === idx + 1) {
              return (
                <div ref={lastElementRef} key={anime.mal_id}>
                  <AnimeDetailCard
                    anime={anime}
                    onClick={() => setSelectedAnime(anime)}
                  />
                </div>
              );
            }
            return (
              <AnimeDetailCard
                key={anime.mal_id}
                anime={anime}
                onClick={() => setSelectedAnime(anime)}
              />
            );
          })}
        </div>
      )}

      {isFetchingNextPage && (
        <div className="flex justify-center mt-4">
          <PageLoader />
        </div>
      )}
    </main>

    {/* Sidebar + Backdrop (render at root level, above header) */}
    {showSidebar && (
      <>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[70]"
          onClick={() => setShowSidebar(false)}
        />
        <div className="fixed top-0 left-0 h-full w-72 bg-[var(--bg-color)] shadow-lg z-[80]">
          <ExploreFilters
            isMobile={isMobile}
            showSidebar={showSidebar}
            onClose={() => setShowSidebar(false)}
            type={type}
            setType={setType}
            filter={filter}
            setFilter={setFilter}
            rating={rating}
            setRating={setRating}
            sfw={sfw}
            setSfw={setSfw}
          />
        </div>
      </>
    )}
  </div>
);


};

export default ExploreAnime;

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useUpcomingAnime } from "../../queries/useUpcomingAnime";
import PageLoader from "../../helperComponent/PageLoader";
import AnimeDetailCard from "../../helperComponent/AnimeDetailCard";
import NoAnimeFound from "../../helperComponent/NoAnimeFound";

const UpcomingAnimeList = () => {
  const [page, setPage] = useState(1);
  const [animeList, setAnimeList] = useState([]);
  const observerRef = useRef(null);

  const { data, isLoading, isError, error } = useUpcomingAnime({ page });

  const upcomingData = data?.data || [];
  const pagination = data?.pagination || {};

  // append results
  useEffect(() => {
    if (upcomingData.length) {
      setAnimeList((prev) =>
        page === 1 ? upcomingData : [...prev, ...upcomingData]
      );
    }
  }, [upcomingData, page]);

  // observer for infinite scroll
  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination?.has_next_page) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, pagination?.has_next_page]
  );

  if (isError) {
    return <NoAnimeFound message={error?.message || "Failed to load upcoming anime"} />;
  }

  return (
    <div className="flex h-full overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {animeList?.map((anime, idx) => {
            if (animeList.length === idx + 1) {
              return (
                <div ref={lastElementRef} key={anime.mal_id}>
                  <AnimeDetailCard anime={anime} showStatusBadge />
                </div>
              );
            }
            return (
              <AnimeDetailCard
                key={anime.mal_id}
                anime={anime}
                showStatusBadge
              />
            );
          })}
        </div>

        {/* Loader */}
        {isLoading && (
          <div className="flex justify-center mt-4">
            <PageLoader />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && animeList.length === 0 && <NoAnimeFound />}
      </div>
    </div>
  );
};

export default UpcomingAnimeList;

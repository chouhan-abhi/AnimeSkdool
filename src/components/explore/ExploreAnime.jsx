import React, { useState, useRef, useCallback, useEffect } from "react";
import { useInfiniteAnimeRanking } from "../../queries/useInfiniteAnimeRanking";
import AnimeDetailCard from "../../helperComponent/AnimeDetailCard";
import {
  Search,
  Grid,
  List,
  RefreshCw,
  TrendingUp,
  Menu,
} from "lucide-react";
import ExploreFilters from "./ExploreFilters";
import useResponsive from "../../queries/useResponsive";
import storageManager from "../../utils/storageManager";

/* -------------------- CUSTOM HOOKS -------------------- */
const usePersistedState = (key, defaultValue) => {
  const [state, setState] = useState(() => storageManager.get(key, defaultValue));
  useEffect(() => {
    storageManager.set(key, state);
  }, [key, state]);
  return [state, setState];
};

/* -------------------- UI SUBCOMPONENTS -------------------- */
const SearchBar = ({ value, onChange }) => (
  <div className="mb-6">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-color)]/60" />
      <input
        type="text"
        placeholder="Search anime..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-3 py-3 rounded-lg bg-[var(--bg-color)]/80 text-[var(--text-color)] text-sm shadow-inner border border-[var(--text-color)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40 transition"
      />
    </div>
  </div>
);

const ViewModeToggle = ({ viewMode, setViewMode }) => (
  <div className="mt-6 border border-[var(--text-color)]/20 flex bg-[var(--bg-color)]/50 rounded-full shadow-md">
    {[
      { mode: "grid", icon: Grid, title: "Grid view" },
      { mode: "list", icon: List, title: "List view" },
    ].map(({ mode, icon: Icon, title }) => (
      <button
        key={mode}
        onClick={() => setViewMode(mode)}
        className={`p-2 rounded-full flex-1 flex justify-center transition ${
          viewMode === mode
            ? "bg-[var(--primary-color)] text-white shadow-md"
            : "text-[var(--text-color)] hover:shadow-sm hover:bg-[var(--bg-color)]/80"
        }`}
        title={title}
      >
        <Icon className="w-5 h-5" />
      </button>
    ))}
  </div>
);

const Sidebar = ({
  type,
  setType,
  filter,
  setFilter,
  rating,
  setRating,
  sfw,
  setSfw,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
}) => (
  <aside className="w-72 bg-[var(--bg-color)]/90 p-4 sticky top-0 h-screen overflow-y-auto shadow-lg rounded-r-xl border-r border-[var(--text-color)]/10">
    <SearchBar value={searchQuery} onChange={setSearchQuery} />
    <div className="rounded-xl bg-[var(--bg-color)]/60 shadow-md p-3">
      <ExploreFilters
        embedded
        isMobile={false}
        showSidebar={false}
        onClose={() => {}}
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
    <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
  </aside>
);

const MobileHeader = ({ onOpenSidebar, onRefresh }) => (
  <div className="sticky top-0 z-10 bg-[var(--bg-color)]/90 backdrop-blur">
    <div className="flex items-center justify-between px-4 py-1">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-[var(--primary-color)]" />
        <h2 className="text-lg font-semibold text-[var(--text-color)]">Explore Anime</h2>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-full hover:text-[var(--primary-color)]"
        >
          <Menu className="w-5 h-5 text-[var(--text-color)]/60" />
        </button>
        <button
          onClick={onRefresh}
          className="p-2 rounded-full hover:text-[var(--primary-color)]"
        >
          <RefreshCw className="w-5 h-5 text-[var(--text-color)]/60" />
        </button>
      </div>
    </div>
  </div>
);

/* -------------------- MAIN COMPONENT -------------------- */
const ExploreAnime = () => {
  // Persisted filters - using storageManager keys
  const [type, setType] = usePersistedState(storageManager.keys.type, "");
  const [filter, setFilter] = usePersistedState(storageManager.keys.filter, "bypopularity");
  const [rating, setRating] = usePersistedState(storageManager.keys.rating, "");
  const [sfw, setSfw] = usePersistedState(storageManager.keys.sfw, "true");

  const isMobile = useResponsive();
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const observerRef = useRef(null);

  // Fetch data
  const { data, error, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteAnimeRanking({ type, filter, rating, sfw });

  const animeList = data?.pages.flatMap((page) => page.data) || [];

  useEffect(() => {
    if (animeList.length > 0 && isInitialLoad) setIsInitialLoad(false);
  }, [animeList.length, isInitialLoad]);

  // Cleanup IntersectionObserver on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  // Infinite scroll
  const lastElementRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const handleRefresh = () => window.location.reload();

  const filteredAnimeList = animeList.filter((anime) =>
    searchQuery === ""
      ? true
      : anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        anime.title_english?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[var(--bg-color)] transition-colors">
      {!isMobile && (
        <Sidebar
          type={type}
          setType={setType}
          filter={filter}
          setFilter={setFilter}
          rating={rating}
          setRating={setRating}
          sfw={sfw}
          setSfw={setSfw}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        {isMobile && (
          <MobileHeader
            onOpenSidebar={() => setShowSidebar(true)}
            onRefresh={handleRefresh}
          />
        )}

        <div className="p-6">
          {isInitialLoad && isLoading && (
            <p className="text-center text-[var(--text-color)]/60">Loading anime...</p>
          )}

          {!isLoading && !error && (
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {filteredAnimeList.map((anime, idx) => {
                const isLastItem = filteredAnimeList.length === idx + 1;
                return (
                  <div
                    key={anime.mal_id}
                    ref={isLastItem ? lastElementRef : null}
                    className="rounded-xl overflow-hidden shadow-sm bg-[var(--bg-color)]/50 hover:shadow-lg hover:scale-[1.01] transition"
                  >
                    <AnimeDetailCard anime={anime} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sidebar */}
      {isMobile && showSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[70]"
            onClick={() => setShowSidebar(false)}
          />
          <div className="fixed top-0 left-0 h-full w-72 bg-[var(--bg-color)] shadow-xl z-[80] border-r border-[var(--text-color)]/20">
            <ExploreFilters
              isMobile
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

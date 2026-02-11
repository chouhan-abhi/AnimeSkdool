import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useDeferredValue,
} from "react";
import { Virtuoso, VirtuosoGrid } from "react-virtuoso";
import { useQueryClient } from "@tanstack/react-query";
import { useInfiniteAnimeRanking } from "../../queries/useInfiniteAnimeRanking";
import AnimeDetailCard from "../../helperComponent/AnimeDetailCard";
import { GridLoader, LoadingMore } from "../../helperComponent/PageLoader";
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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
      <input
        type="text"
        placeholder="Search anime..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-3 py-3 rounded-full bg-white/10 text-white text-sm shadow-inner border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40 transition"
      />
    </div>
  </div>
);

const ViewModeToggle = ({ viewMode, setViewMode }) => (
  <div className="mt-6 border border-[var(--border-color)] flex bg-white/5 rounded-full shadow-md">
    {[
      { mode: "grid", icon: Grid, title: "Grid view" },
      { mode: "list", icon: List, title: "List view" },
    ].map(({ mode, icon: Icon, title }) => (
      <button
        key={mode}
        onClick={() => setViewMode(mode)}
        className={`p-2 rounded-full flex-1 flex justify-center transition ${
          viewMode === mode
            ? "bg-[var(--primary-color)] text-white shadow-[0_0_18px_var(--glow-color)]"
            : "text-white/70 hover:shadow-sm hover:bg-white/10"
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
  <aside className="w-72 bg-[var(--panel-bg)]/90 p-4 sticky top-0 h-screen overflow-y-auto shadow-lg rounded-r-2xl border-r border-[var(--border-color)]">
    <SearchBar value={searchQuery} onChange={setSearchQuery} />
    <div className="rounded-2xl bg-white/5 shadow-md p-3 border border-[var(--border-color)]">
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
  <div className="sticky top-0 z-10 bg-[var(--panel-bg)]/90 backdrop-blur">
    <div className="flex items-center justify-between px-4 py-1">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-[var(--primary-color)]" />
        <h2 className="text-lg font-semibold text-white">Explore Anime</h2>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-full hover:text-[var(--primary-color)]"
        >
          <Menu className="w-5 h-5 text-white/60" />
        </button>
        <button
          onClick={onRefresh}
          className="p-2 rounded-full hover:text-[var(--primary-color)]"
        >
          <RefreshCw className="w-5 h-5 text-white/60" />
        </button>
      </div>
    </div>
  </div>
);

/* -------------------- MAIN COMPONENT -------------------- */
const ExploreAnime = ({ embedded = false, externalState = null }) => {
  // Persisted filters - using storageManager keys
  const [typeState, setTypeState] = usePersistedState(storageManager.keys.type, "");
  const [filterState, setFilterState] = usePersistedState(storageManager.keys.filter, "bypopularity");
  const [ratingState, setRatingState] = usePersistedState(storageManager.keys.rating, "");
  const [sfwState, setSfwState] = usePersistedState(storageManager.keys.sfw, "true");

  const isMobile = useResponsive();
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewModeState, setViewModeState] = useState("grid");
  const [searchQueryState, setSearchQueryState] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const scrollParentRef = useRef(null);
  const queryClient = useQueryClient();

  const type = externalState?.type ?? typeState;
  const setType = externalState?.setType ?? setTypeState;
  const filter = externalState?.filter ?? filterState;
  const setFilter = externalState?.setFilter ?? setFilterState;
  const rating = externalState?.rating ?? ratingState;
  const setRating = externalState?.setRating ?? setRatingState;
  const sfw = externalState?.sfw ?? sfwState;
  const setSfw = externalState?.setSfw ?? setSfwState;
  const searchQuery = externalState?.searchQuery ?? searchQueryState;
  const setSearchQuery = externalState?.setSearchQuery ?? setSearchQueryState;
  const viewMode = externalState?.viewMode ?? viewModeState;
  const setViewMode = externalState?.setViewMode ?? setViewModeState;

  // Fetch data
  const { data, error, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteAnimeRanking({ type, filter, rating, sfw });

  const animeList = data?.pages.flatMap((page) => page.data) || [];

  useEffect(() => {
    if (animeList.length > 0 && isInitialLoad) setIsInitialLoad(false);
  }, [animeList.length, isInitialLoad]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["animeRankingInfinite"] });
  };

  const deferredSearch = useDeferredValue(searchQuery);

  const filteredAnimeList = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return animeList;
    return animeList.filter((anime) => {
      const title = anime.title?.toLowerCase() || "";
      const titleEnglish = anime.title_english?.toLowerCase() || "";
      return title.includes(query) || titleEnglish.includes(query);
    });
  }, [animeList, deferredSearch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={`flex h-full bg-[var(--bg-color)] transition-colors ${embedded ? "rounded-2xl" : ""}`}>
      {!embedded && !isMobile && (
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

      <main
        ref={scrollParentRef}
        className={`flex-1 overflow-y-auto flex flex-col min-h-0 ${embedded ? "p-0" : ""}`}
      >
        {!embedded && isMobile && (
          <MobileHeader
            onOpenSidebar={() => setShowSidebar(true)}
            onRefresh={handleRefresh}
          />
        )}

        <div className={`${embedded ? "p-0" : "p-4 md:p-6"} flex-1 min-h-0`}>
          {isInitialLoad && isLoading && <GridLoader count={6} />}

          {!isLoading && !error && (
            <>
              {viewMode === "grid" ? (
                <VirtuosoGrid
                  data={filteredAnimeList}
                  endReached={handleEndReached}
                  customScrollParent={scrollParentRef.current || undefined}
                  listClassName="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  itemKey={(_index, anime) => anime.mal_id}
                  itemContent={(_index, anime) => (
                    <div className="rounded-xl overflow-hidden shadow-sm bg-[var(--bg-color)]/50 hover:shadow-lg hover:scale-[1.01] transition">
                      <AnimeDetailCard anime={anime} />
                    </div>
                  )}
                />
              ) : (
                <Virtuoso
                  data={filteredAnimeList}
                  endReached={handleEndReached}
                  customScrollParent={scrollParentRef.current || undefined}
                  itemKey={(_index, anime) => anime.mal_id}
                  itemContent={(_index, anime) => (
                    <div className="rounded-xl overflow-hidden shadow-sm bg-[var(--bg-color)]/50 hover:shadow-lg hover:scale-[1.01] transition mb-4">
                      <AnimeDetailCard anime={anime} />
                    </div>
                  )}
                />
              )}
            </>
          )}

          {isFetchingNextPage && <LoadingMore />}
        </div>
      </main>

      {/* Mobile Sidebar */}
      {!embedded && isMobile && showSidebar && (
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

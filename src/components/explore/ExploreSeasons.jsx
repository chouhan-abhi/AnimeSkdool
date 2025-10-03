import React, { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteAnimeRanking } from "../../queries/useInfiniteAnimeRanking";
import AnimeDetailCard from "../../helperComponent/AnimeDetailCard";
import ExploreFilters from "./ExploreFilters";
import { Search, Grid, List, RefreshCw, Menu, TrendingUp, X } from "lucide-react";

const STORAGE_KEYS = {
  type: "animeType",
  filter: "animeFilter",
  rating: "animeRating",
  sfw: "animeSfw",
};

const ExploreAnime = () => {
  const [type, setType] = useState(() => localStorage.getItem(STORAGE_KEYS.type) || "");
  const [filter, setFilter] = useState(() => localStorage.getItem(STORAGE_KEYS.filter) || "bypopularity");
  const [rating, setRating] = useState(() => localStorage.getItem(STORAGE_KEYS.rating) || "");
  const [sfw, setSfw] = useState(() => (localStorage.getItem(STORAGE_KEYS.sfw) === "false" ? false : true));
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const observerRef = useRef(null);

  // --- Responsive handler ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Persist filters ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.type, type);
    localStorage.setItem(STORAGE_KEYS.filter, filter);
    localStorage.setItem(STORAGE_KEYS.rating, rating);
    localStorage.setItem(STORAGE_KEYS.sfw, String(sfw));
  }, [type, filter, rating, sfw]);

  // --- Fetch Anime ---
  const { data, error, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteAnimeRanking({ type, filter, rating, sfw });
  const animeList = data?.pages.flatMap((page) => page.data) || [];

  useEffect(() => {
    if (animeList.length > 0 && isInitialLoad) setIsInitialLoad(false);
  }, [animeList.length, isInitialLoad]);

  // --- Infinite scroll ---
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

  // --- Filter anime by search query ---
  const filteredAnimeList = animeList.filter(
    (anime) =>
      searchQuery === "" ||
      anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (anime.title_english && anime.title_english.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ---------------- Subcomponents ----------------

  // Sidebar component
  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`${
        mobile
          ? "fixed top-0 left-0 h-full w-72 z-50 bg-surface-container-high shadow-xl border-r border-outline transform transition-transform duration-300"
          : "w-72"
      } p-4 overflow-y-auto rounded-r-xl ${mobile && !showSidebar ? "-translate-x-full" : "translate-x-0"}`}
    >
      {/* Mobile close button */}
      {mobile && (
        <div className="flex justify-end mb-4">
          <button onClick={() => setShowSidebar(false)} className="p-2 rounded-full hover:bg-surface-container-high">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-3 rounded-lg bg-surface-container text-on-surface text-sm shadow-inner border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-surface-container-high dark:bg-surface-container-dark shadow-md p-3 mb-6">
        <ExploreFilters
          embedded
          isMobile={mobile}
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

      {/* Layout toggle (grid/list) */}
      <div className="flex border rounded-full bg-surface-container-high shadow-md overflow-hidden mb-6">
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 flex-1 flex justify-center transition ${
            viewMode === "grid"
              ? "bg-[var(--primary-color)] text-white shadow-md"
              : "text-on-surface hover:shadow-sm hover:bg-surface-container"
          }`}
          title="Grid view"
        >
          <Grid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 flex-1 flex justify-center transition ${
            viewMode === "list"
              ? "bg-[var(--primary-color)] text-white shadow-md"
              : "text-on-surface hover:shadow-sm hover:bg-surface-container"
          }`}
          title="List view"
        >
          <List className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );

  // Mobile header with hamburger menu
  const MobileHeader = () => (
    <div className="sticky top-0 z-10 bg-surface-container/90 backdrop-blur border-b border-outline">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-semibold text-on-surface">Explore anime by seasons</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSidebar(true)}
            className="p-2 rounded-full hover:bg-surface-container-high"
          >
            <Menu className="w-5 h-5 text-on-surface-variant" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-surface-container-high"
          >
            <RefreshCw className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
      </div>
    </div>
  );

  // ---------------- Render ----------------
  return (
    <div className="flex h-full bg-surface-light dark:bg-surface-dark transition-colors relative">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        {isMobile && <MobileHeader />}

        <div className="p-6">
          {isInitialLoad && isLoading && (
            <p className="text-center text-on-surface-variant">Loading anime...</p>
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
                    className="rounded-xl overflow-hidden shadow-sm bg-surface-container hover:shadow-lg hover:scale-[1.01] transition"
                  >
                    <AnimeDetailCard anime={anime} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
            showSidebar ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowSidebar(false)}
          />
          <Sidebar mobile />
        </div>
      )}
    </div>
  );
};

export default ExploreAnime;

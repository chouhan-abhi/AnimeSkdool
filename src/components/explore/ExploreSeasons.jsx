import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import ReactDOM from "react-dom";
import { useSeasonsList, useInfiniteSeasonAnime } from "../../queries/useSeasons";
import AnimeDetailCard from "../../helperComponent/AnimeDetailCard";
import NoAnimeFound from "../../helperComponent/NoAnimeFound";
import CalendarLoader from "../../helperComponent/CalendarLoader";
import { Calendar, ChevronDown, RefreshCw, X, Menu, TrendingUp, Filter } from "lucide-react";
import useResponsive from "../../queries/useResponsive";

const SEASONS_ORDER = ["winter", "spring", "summer", "fall"];

const ExploreSeasons = () => {
  const { data: seasons, isLoading: loadingSeasons, error: seasonsError } = useSeasonsList();
  const [selected, setSelected] = useState(null);
  const [sfw, setSfw] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useResponsive();

  const options = useMemo(() => {
    if (!seasons) return [];
    return seasons
      .slice()
      .sort((a, b) => b.year - a.year)
      .flatMap(({ year, seasons: seasonList }) =>
        seasonList
          .slice()
          .sort((a, b) => SEASONS_ORDER.indexOf(b) - SEASONS_ORDER.indexOf(a))
          .map((season) => ({ year, season }))
      );
  }, [seasons]);

  useEffect(() => {
    if (!selected && options.length > 0) setSelected(options[0]);
  }, [options, selected]);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } = useInfiniteSeasonAnime({
    year: selected?.year,
    season: selected?.season,
    sfw,
  });

  const animeList = data?.pages.flatMap((p) => p?.data ?? []) ?? [];

  useEffect(() => {
    if (animeList.length > 0 && isInitialLoad) setIsInitialLoad(false);
  }, [animeList.length, isInitialLoad]);

  // Infinite scroll observer
  const observerRef = useRef(null);
  
  // Cleanup IntersectionObserver on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

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

  const handleRefresh = () => {
    setIsInitialLoad(true);
    window.location.reload();
  };

  if (loadingSeasons) return <CalendarLoader />;
  if (seasonsError) return <NoAnimeFound message={seasonsError.message} />;

  return (
    <div className="flex h-full relative bg-gradient-to-b from-transparent to-[var(--bg-color)]/50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="hidden lg:block w-72 border-r border-[var(--text-color)]/20">
          <SidebarContent />
        </div>
      )}

      {/* Mobile Sidebar - Only render when open */}
      {isSidebarOpen && ReactDOM.createPortal(
        <MobileSidebar isOpen={isSidebarOpen} close={() => setIsSidebarOpen(false)} />,
        document.body
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative z-0">
        {/* Mobile Header */}
        {isMobile && (
          <MobileHeader
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onRefresh={handleRefresh}
          />
        )}
        <div className="px-4 pb-4">
          {isInitialLoad && isLoading && <CalendarLoader />}
          {!isLoading && error && <NoAnimeFound message={error.message} />}
          {!isLoading && !error && animeList.length > 0 && <AnimeGrid />}
          {!isLoading && isFetchingNextPage && (
            <div className="flex justify-center mt-8">
              <CalendarLoader />
            </div>
          )}
          {!isLoading && animeList.length === 0 && !isInitialLoad && (
            <NoAnimeFound message="No anime found for this season." />
          )}
        </div>
      </main>
    </div>
  );

  // --- Subcomponents ---
  function MobileHeader({ onOpenSidebar, onRefresh }) {
    return (
      <div className="sticky top-0 z-10 bg-[var(--bg-color)]">
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
  }

  function SidebarContent({ closeOnMobile = false }) {
    return (
      <div className={`h-full rounded-lg w-full ${isMobile ? "max-w-full" : "max-w-sm lg:max-w-xs"} bg-[var(--bg-color)] shadow-xl p-4 overflow-y-auto`}>
        <SidebarHeader closeOnMobile={closeOnMobile} />
        <SeasonDropdown />
        <SfwToggle />
        <RefreshButton />
      </div>
    );
  }

  function SidebarHeader({ closeOnMobile }) {
    return (
      <div className="flex items-center justify-between w-full mb-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--primary-color)]/10 rounded-lg">
            <Filter className="w-5 h-5 text-[var(--primary-color)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-color)]">Filters</h2>
            <p className="text-xs text-[var(--text-color)]/60">Customize discovery</p>
          </div>
        </div>
        {closeOnMobile && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-[var(--text-color)]/10 text-[var(--text-color)]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  function SeasonDropdown() {
    return (
      <div className="mb-4 relative">
        <select
          value={selected ? `${selected.year}-${selected.season}` : ""}
          onChange={(e) => {
            const [y, s] = e.target.value.split("-");
            setSelected({ year: Number(y), season: s });
            setIsInitialLoad(true);
            if (isMobile) setIsSidebarOpen(false);
          }}
          className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl border border-[var(--text-color)]/20 bg-[var(--bg-color)] text-[var(--text-color)] focus:ring-2 focus:ring-[var(--primary-color)]/40 focus:border-[var(--primary-color)] capitalize"
        >
          {options.map(({ year, season }) => (
            <option key={`${year}-${season}`} value={`${year}-${season}`} className="capitalize">
              {season} {year}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-color)]/40 pointer-events-none" />
      </div>
    );
  }

  function SfwToggle() {
    return (
      <button
        onClick={() => setSfw((p) => !p)}
        className={`relative w-full flex items-center justify-between px-4 py-2 rounded-xl font-medium transition mb-4 ${
          sfw ? "bg-green-500/90 text-white shadow-md" : "bg-red-500/90 text-white shadow-md"
        }`}
      >
        {sfw ? "Safe For Work" : "NSFW Mode"}
        <div
          className={`absolute border right-2 w-5 h-5 rounded-full bg-white/80 transition ${
            sfw ? "translate-x-0" : "translate-x-[-1rem]"
          }`}
        />
      </button>
    );
  }

  function RefreshButton() {
    return (
      <button
        onClick={handleRefresh}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-[var(--text-color)]/20 rounded-xl text-[var(--text-color)] hover:bg-[var(--text-color)]/10 transition"
      >
        <RefreshCw className="w-4 h-4" /> Reset
      </button>
    );
  }

  function AnimeGrid() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {animeList.map((anime, idx) => {
          const isLastItem = animeList.length === idx + 1;
          return (
            <div
              key={anime.mal_id}
              ref={isLastItem ? lastElementRef : null}
              className={`transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                isLastItem ? "animate-fadeInUp" : ""
              }`}
              style={{
                animationDelay: `${idx * 0.05}s`,
                animationFillMode: "both",
              }}
            >
              <AnimeDetailCard anime={anime} />
            </div>
          );
        })}
      </div>
    );
  }

  function MobileSidebar({ isOpen, close }) {
    return (
      <div
        className={`fixed inset-0 z-40 transform transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={close}
        />
        {/* Sidebar content */}
        <div className="absolute top-0 left-0 h-full w-full bg-[var(--bg-color)] shadow-xl">
          <SidebarContent closeOnMobile />
        </div>
      </div>
    );
  }
};

export default ExploreSeasons;

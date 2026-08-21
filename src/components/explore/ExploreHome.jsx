import React, { useState, useCallback, useMemo, useEffect, lazy, Suspense } from "react";
import ExploreAnime from "./ExploreAnime";
import ExploreSeasons from "./ExploreSeasons";
import {
  Calendar,
  TrendingUp,
  Sparkles,
  Search,
  Star,
  ChevronDown,
  Layers,
  Filter,
  Play,
  RotateCcw,
  Grid,
  List,
  X,
  SlidersHorizontal,
  Building2,
  Check,
} from "lucide-react";
import { useRandomAnimeList } from "../../queries/useRandomAnimeList";
import { useAnimeReviews } from "../../queries/useAnimeReviews";
import storageManager from "../../utils/storageManager";
import SectionHeader from "../ui/SectionHeader";
import { DetailsPanelLoader } from "../../helperComponent/PageLoader";
import {
  ALL_GENRES,
  ALL_THEMES,
  ALL_DEMOGRAPHICS,
  ALL_FORMATS,
  ALL_STATUSES,
  ALL_SORT_OPTIONS,
  ALL_RATINGS,
  ALL_STUDIOS,
  ALL_YEARS,
} from "../../utils/constants";

const AnimeDetailsPanel = lazy(() => import("../AnimeDetailsPanel"));

const ALPHABET_LIST = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

const SCORE_PRESETS = [
  { value: "", label: "Any Score" },
  { value: "9", label: "9.0+ Masterpiece ★" },
  { value: "8.5", label: "8.5+ Legendary ★" },
  { value: "8", label: "8.0+ Great ★" },
  { value: "7.5", label: "7.5+ Very Good ★" },
  { value: "7", label: "7.0+ Good ★" },
  { value: "6", label: "6.0+ Average ★" },
];

const usePersistedState = (key, defaultValue) => {
  const [state, setState] = useState(() =>
    storageManager.get(key, defaultValue)
  );
  useEffect(() => {
    storageManager.set(key, state);
  }, [key, state]);
  return [state, setState];
};

const ExploreHome = ({ onSelectAnime }) => {
  const [viewMode, setViewMode] = useState("seasons"); // "seasons" | "filters" | "ranking" | "genres"
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [viewLayout, setViewLayout] = useState("grid"); // "grid" | "cards"
  const [genreSubTab, setGenreSubTab] = useState("all"); // "all" | "genres" | "themes" | "demographics"
  const [showAllFilterOptions, setShowAllFilterOptions] = useState(false);

  // All Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]); // Array of IDs for multi-genre filtering
  const [type, setType] = usePersistedState(storageManager.keys.type, "");
  const [status, setStatus] = useState("");
  const [sortSelection, setSortSelection] = useState("popularity_desc");
  const [rating, setRating] = usePersistedState(storageManager.keys.rating, "");
  const [sfw, setSfw] = usePersistedState(storageManager.keys.sfw, "true");
  const [minScore, setMinScore] = useState("");
  const [selectedStudio, setSelectedStudio] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("");

  const handleSelect = useCallback(
    (anime) => {
      if (onSelectAnime) onSelectAnime(anime);
      else setSelectedAnime(anime);
    },
    [onSelectAnime]
  );

  const handleModeChange = useCallback(
    (mode) => {
      if (mode === viewMode || isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setViewMode(mode);
        setIsTransitioning(false);
      }, 100);
    },
    [viewMode, isTransitioning]
  );

  const toggleGenre = useCallback((genreId) => {
    setSelectedGenres((prev) => {
      const idStr = String(genreId);
      if (prev.includes(idStr)) {
        return prev.filter((id) => id !== idStr);
      } else {
        return [...prev, idStr];
      }
    });
  }, []);

  const handleGenreQuickPick = useCallback((genreId) => {
    setSelectedGenres([String(genreId)]);
    setViewMode("filters");
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedGenres([]);
    setType("");
    setStatus("");
    setSortSelection("popularity_desc");
    setRating("");
    setSfw("true");
    setMinScore("");
    setSelectedStudio("");
    setSelectedYear("");
    setSelectedLetter("");
  }, [setType, setRating, setSfw]);

  const activeSortObj = useMemo(() => {
    return (
      ALL_SORT_OPTIONS.find((s) => s.value === sortSelection) ||
      ALL_SORT_OPTIONS[0]
    );
  }, [sortSelection]);

  const activeStudioObj = useMemo(() => {
    return ALL_STUDIOS.find((s) => String(s.id) === String(selectedStudio));
  }, [selectedStudio]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedGenres.length > 0) count += selectedGenres.length;
    if (type) count++;
    if (status) count++;
    if (sortSelection !== "popularity_desc") count++;
    if (rating) count++;
    if (sfw !== "true") count++;
    if (minScore) count++;
    if (selectedStudio) count++;
    if (selectedYear) count++;
    if (selectedLetter) count++;
    return count;
  }, [
    searchQuery,
    selectedGenres,
    type,
    status,
    sortSelection,
    rating,
    sfw,
    minScore,
    selectedStudio,
    selectedYear,
    selectedLetter,
  ]);

  // Combined Genre + Theme + Demographic Dictionary for label lookups
  const allCategoryMap = useMemo(() => {
    const map = new Map();
    ALL_GENRES.forEach((g) => map.set(String(g.id), { ...g, category: "Genre" }));
    ALL_THEMES.forEach((t) => map.set(String(t.id), { ...t, category: "Theme" }));
    ALL_DEMOGRAPHICS.forEach((d) => map.set(String(d.id), { ...d, category: "Demographic" }));
    return map;
  }, []);

  // Displayed Genres based on sub-tab
  const displayedCategories = useMemo(() => {
    if (genreSubTab === "genres") return ALL_GENRES;
    if (genreSubTab === "themes") return ALL_THEMES;
    if (genreSubTab === "demographics") return ALL_DEMOGRAPHICS;
    return [...ALL_GENRES, ...ALL_THEMES.slice(0, 10), ...ALL_DEMOGRAPHICS];
  }, [genreSubTab]);

  // Sidebar random spotlight & reviews
  const { data: randomList = [], isLoading: randomLoading } =
    useRandomAnimeList(1);
  const randomPick = randomList[0];

  const { data: allReviews = [], isLoading: reviewsLoading } = useAnimeReviews();
  const recentReviews = useMemo(() => allReviews.slice(0, 3), [allReviews]);

  const modes = [
    {
      key: "seasons",
      label: "Seasonal Premieres",
      icon: Calendar,
      description: "Upcoming & broadcast seasons",
    },
    {
      key: "filters",
      label: "Power Filter Studio",
      icon: Filter,
      description: "Comprehensive multi-criteria filtering",
    },
    {
      key: "ranking",
      label: "Top Charts & Rankings",
      icon: TrendingUp,
      description: "Worldwide rankings & charts",
    },
    {
      key: "genres",
      label: "Genre Universes",
      icon: Layers,
      description: "Explore by theme & category",
    },
  ];

  return (
    <div className="min-h-screen text-white px-4 sm:px-8 md:px-12 lg:px-18 max-w-[1800px] mx-auto pb-24">
      {/* Header Section */}
      <div className="pt-8 pb-6">
        <SectionHeader
          title="Browse Anime Catalog"
          subtitle="Explore upcoming releases, filter across 50+ genres, studios, and customize every discovery parameter"
          badge="Browse & Discover"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Main Browse Section */}
        <section className="min-w-0">
          {/* Top Mode Segmented Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#08080c] border border-white/[0.06] mb-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center p-1 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 overflow-x-auto">
              {modes.map((mode) => {
                const Icon = mode.icon;
                const active = viewMode === mode.key;
                return (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => handleModeChange(mode.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      active
                        ? "bg-white text-black shadow-md scale-[1.02]"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{mode.label}</span>
                    {mode.key === "filters" && activeFilterCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[var(--primary-color)] text-white text-[10px] flex items-center justify-center font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Layout Toggle (Grid vs Cards) */}
            <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10">
              <button
                type="button"
                onClick={() => setViewLayout("grid")}
                className={`p-1.5 rounded-full transition-all ${
                  viewLayout === "grid"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
                title="Poster Grid View"
              >
                <Grid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewLayout("cards")}
                className={`p-1.5 rounded-full transition-all ${
                  viewLayout === "cards"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
                title="Detailed Cards View"
              >
                <List size={15} />
              </button>
            </div>
          </div>

          {/* Comprehensive Power Filter Studio (Visible in 'filters' & 'ranking' modes) */}
          {(viewMode === "filters" || viewMode === "ranking") && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[#08080c] border border-white/[0.06] mb-8 space-y-6 shadow-2xl">
              {/* Row 1: Search Bar + SFW Toggle + Expand All Filters Button */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                  />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, character, staff, studio..."
                    className="w-full rounded-full border border-white/10 bg-white/[0.07] backdrop-blur-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSfw((p) => (p === "true" ? "false" : "true"))}
                  className={`rounded-full px-4 py-2.5 text-xs font-semibold transition-all ${
                    sfw === "true"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {sfw === "true" ? "✓ SFW Safe" : "All Content (NSFW Included)"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAllFilterOptions((prev) => !prev)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold border transition-all ${
                    showAllFilterOptions
                      ? "bg-white text-black border-white shadow-md"
                      : "bg-white/[0.06] text-white/80 hover:text-white border-white/10 hover:bg-white/[0.12]"
                  }`}
                >
                  <SlidersHorizontal size={14} />
                  <span>{showAllFilterOptions ? "Hide Advanced Options" : "All Filter Options"}</span>
                </button>
              </div>

              {/* Row 2: Genre, Theme & Demographic Multi-Select Selector */}
              <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                      Genres & Themes:
                    </span>
                    <div className="flex items-center gap-1 p-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => setGenreSubTab("all")}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          genreSubTab === "all"
                            ? "bg-white text-black"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        All ({ALL_GENRES.length + 10})
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenreSubTab("genres")}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          genreSubTab === "genres"
                            ? "bg-white text-black"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        Genres ({ALL_GENRES.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenreSubTab("themes")}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          genreSubTab === "themes"
                            ? "bg-white text-black"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        Themes ({ALL_THEMES.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenreSubTab("demographics")}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          genreSubTab === "demographics"
                            ? "bg-white text-black"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        Demographics ({ALL_DEMOGRAPHICS.length})
                      </button>
                    </div>
                  </div>

                  {selectedGenres.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedGenres([])}
                      className="text-xs font-semibold text-[var(--primary-color)] hover:text-white transition-colors"
                    >
                      Clear {selectedGenres.length} Selected
                    </button>
                  )}
                </div>

                {/* Genre Horizontal Carousel / Multi-select Grid */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                  {displayedCategories.map((g) => {
                    const isSelected = selectedGenres.includes(String(g.id));
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGenre(g.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 transition-all duration-200 ${
                          isSelected
                            ? "bg-white text-black shadow-md scale-[1.03] ring-2 ring-white/40"
                            : "bg-white/[0.05] text-white/70 hover:text-white hover:bg-white/[0.12] border border-white/[0.06]"
                        }`}
                      >
                        <span>{g.icon}</span>
                        <span>{g.name}</span>
                        {isSelected && <Check size={12} className="stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Primary Dropdowns Bar (Format, Status, Sort, Rating, Min Score) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-3 border-t border-white/[0.06]">
                {/* Format / Type */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-white/40 mb-1 ml-1">
                    Format
                  </label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full appearance-none rounded-full border border-white/10 bg-white/[0.07] py-2 pl-3.5 pr-8 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer"
                    >
                      {ALL_FORMATS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#12121a] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-white/40 mb-1 ml-1">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full appearance-none rounded-full border border-white/10 bg-white/[0.07] py-2 pl-3.5 pr-8 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer"
                    >
                      {ALL_STATUSES.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#12121a] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                  </div>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-white/40 mb-1 ml-1">
                    Sort By
                  </label>
                  <div className="relative">
                    <select
                      value={sortSelection}
                      onChange={(e) => setSortSelection(e.target.value)}
                      className="w-full appearance-none rounded-full border border-white/10 bg-white/[0.07] py-2 pl-3.5 pr-8 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer"
                    >
                      {ALL_SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#12121a] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                  </div>
                </div>

                {/* Age Rating */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-white/40 mb-1 ml-1">
                    Age Rating
                  </label>
                  <div className="relative">
                    <select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full appearance-none rounded-full border border-white/10 bg-white/[0.07] py-2 pl-3.5 pr-8 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer"
                    >
                      {ALL_RATINGS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#12121a] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                  </div>
                </div>

                {/* Min Score */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-white/40 mb-1 ml-1">
                    Score Filter
                  </label>
                  <div className="relative">
                    <select
                      value={minScore}
                      onChange={(e) => setMinScore(e.target.value)}
                      className="w-full appearance-none rounded-full border border-white/10 bg-white/[0.07] py-2 pl-3.5 pr-8 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer"
                    >
                      {SCORE_PRESETS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#12121a] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                  </div>
                </div>
              </div>

              {/* Row 4: Advanced Filter Options (Studios, Release Years, Alphabet Index) */}
              {showAllFilterOptions && (
                <div className="space-y-4 pt-3 border-t border-white/[0.06] animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Animation Studio */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-white/40 mb-1 ml-1 flex items-center gap-1">
                        <Building2 size={11} className="text-[var(--primary-color)]" />
                        <span>Animation Studio</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedStudio}
                          onChange={(e) => setSelectedStudio(e.target.value)}
                          className="w-full appearance-none rounded-full border border-white/10 bg-white/[0.07] py-2 pl-3.5 pr-8 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer"
                        >
                          {ALL_STUDIOS.map((opt) => (
                            <option key={opt.id} value={opt.id} className="bg-[#12121a] text-white">
                              {opt.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                      </div>
                    </div>

                    {/* Release Year */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-white/40 mb-1 ml-1 flex items-center gap-1">
                        <Calendar size={11} className="text-[var(--primary-color)]" />
                        <span>Release Year</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          className="w-full appearance-none rounded-full border border-white/10 bg-white/[0.07] py-2 pl-3.5 pr-8 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer"
                        >
                          {ALL_YEARS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[#12121a] text-white">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                      </div>
                    </div>

                    {/* Quick Clear All in Advanced */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] hover:bg-white/15 py-2 px-4 text-xs font-semibold text-white/80 hover:text-white transition-all"
                      >
                        <RotateCcw size={13} />
                        <span>Reset All Filter Fields</span>
                      </button>
                    </div>
                  </div>

                  {/* Alphabetical Title Index */}
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-white/40 ml-1">
                      Filter by First Letter (A-Z):
                    </label>
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                      <button
                        type="button"
                        onClick={() => setSelectedLetter("")}
                        className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 transition-all ${
                          !selectedLetter
                            ? "bg-white text-black shadow-sm"
                            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        All
                      </button>
                      {ALPHABET_LIST.map((letter) => (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => setSelectedLetter(selectedLetter === letter ? "" : letter)}
                          className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 transition-all ${
                            selectedLetter === letter
                              ? "bg-white text-black shadow-sm"
                              : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Row 5: Active Filter Tags & Reset Action */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                    Active Filters ({activeFilterCount}):
                  </span>

                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                      Query: &ldquo;{searchQuery}&rdquo;
                      <button onClick={() => setSearchQuery("")} className="hover:text-red-400">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {selectedGenres.map((gId) => {
                    const obj = allCategoryMap.get(gId);
                    return (
                      <span
                        key={gId}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/30 text-xs font-semibold"
                      >
                        {obj?.icon} {obj?.name || `Genre #${gId}`}
                        <button onClick={() => toggleGenre(gId)} className="hover:text-white ml-0.5">
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}

                  {type && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                      Format: {type.toUpperCase()}
                      <button onClick={() => setType("")} className="hover:text-red-400">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {status && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                      Status: {status}
                      <button onClick={() => setStatus("")} className="hover:text-red-400">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {selectedStudio && activeStudioObj && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                      Studio: {activeStudioObj.name.split(" ")[0]}
                      <button onClick={() => setSelectedStudio("")} className="hover:text-red-400">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {selectedYear && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                      Year: {selectedYear}
                      <button onClick={() => setSelectedYear("")} className="hover:text-red-400">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {selectedLetter && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                      Starts with: {selectedLetter}
                      <button onClick={() => setSelectedLetter("")} className="hover:text-red-400">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {minScore && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                      Score &ge; {minScore}★
                      <button onClick={() => setMinScore("")} className="hover:text-white">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white/50 hover:text-white transition-colors ml-auto"
                  >
                    <RotateCcw size={12} />
                    <span>Reset All</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main Content Area */}
          <div className="relative">
            {isTransitioning ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
              </div>
            ) : viewMode === "seasons" ? (
              <ExploreSeasons onSelectAnime={handleSelect} />
            ) : viewMode === "genres" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {ALL_GENRES.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => handleGenreQuickPick(g.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleGenreQuickPick(g.id);
                      }}
                      className="group p-5 rounded-3xl bg-[#08080c] hover:bg-[#0e0e16] border border-white/[0.06] hover:border-white/25 transition-all duration-300 hover:scale-[1.025] hover:shadow-[0_20px_45px_rgba(0,0,0,0.95)] cursor-pointer select-none space-y-2"
                    >
                      <div className="text-3xl">{g.icon}</div>
                      <h4 className="text-base font-bold text-white group-hover:text-[var(--primary-color)] transition-colors">
                        {g.name}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--primary-color)] font-semibold pt-1">
                        Explore {g.name} Anime →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ExploreAnime
                onSelectAnime={handleSelect}
                externalState={{
                  type,
                  filter:
                    viewMode === "ranking" &&
                    selectedGenres.length === 0 &&
                    !searchQuery &&
                    !status &&
                    !selectedStudio &&
                    !selectedYear
                      ? sortSelection
                      : "",
                  rating,
                  sfw,
                  genres: selectedGenres.join(","),
                  status,
                  order_by: activeSortObj.order_by,
                  sort: activeSortObj.sort,
                  min_score: minScore,
                  producers: selectedStudio,
                  start_date: selectedYear ? `${selectedYear}-01-01` : "",
                  end_date: selectedYear ? `${selectedYear}-12-31` : "",
                  letter: selectedLetter,
                  searchQuery,
                  viewMode: viewLayout,
                }}
              />
            )}
          </div>
        </section>

        {/* Right Discovery Sidebar */}
        <aside className="hidden xl:flex flex-col gap-6 sticky top-24">
          {/* Spotlight Spotlight Card */}
          <div className="p-5 rounded-3xl bg-[#08080c] border border-white/[0.06] space-y-3 shadow-xl">
            <p className="text-xs uppercase font-bold tracking-wider text-white/50 flex items-center gap-1.5">
              <Sparkles size={13} className="text-[var(--primary-color)]" />
              <span>Spotlight of the Day</span>
            </p>

            {randomLoading ? (
              <div className="h-48 rounded-2xl bg-white/5 animate-shimmer" />
            ) : randomPick ? (
              <div
                onClick={() => handleSelect(randomPick)}
                className="group relative rounded-2xl overflow-hidden bg-[#0e0e14] border border-white/10 cursor-pointer transition-all hover:scale-[1.02] shadow-lg select-none"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleSelect(randomPick);
                }}
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <img
                    src={
                      randomPick.images?.webp?.large_image_url ||
                      randomPick.images?.jpg?.large_image_url ||
                      randomPick.images?.webp?.image_url
                    }
                    alt={randomPick.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="rounded-full bg-white text-black p-2.5 shadow-lg">
                      <Play size={16} className="fill-black translate-x-0.5" />
                    </span>
                  </div>
                </div>

                <div className="p-3.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-white/90">
                      Must Watch
                    </span>
                    {randomPick.score && (
                      <span className="text-xs text-yellow-400 font-bold flex items-center gap-0.5">
                        <Star size={10} fill="currentColor" /> {randomPick.score}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[var(--primary-color)] transition-colors">
                    {randomPick.title}
                  </h4>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40">No pick available.</p>
            )}
          </div>

          {/* Quick Genre Universe Tags */}
          <div className="p-5 rounded-3xl bg-[#08080c] border border-white/[0.06] space-y-3 shadow-xl">
            <p className="text-xs uppercase font-bold tracking-wider text-white/50">
              Popular Genres & Themes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_GENRES.slice(0, 12).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleGenreQuickPick(g.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 ${
                    selectedGenres.includes(String(g.id))
                      ? "bg-white text-black font-bold"
                      : "bg-white/[0.04] hover:bg-white/[0.12] text-white/75 hover:text-white border border-white/[0.06]"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Community Insights Sidebar */}
          <div className="p-5 rounded-3xl bg-[#08080c] border border-white/[0.06] space-y-4 shadow-xl">
            <p className="text-xs uppercase font-bold tracking-wider text-white/50">
              Community Insights
            </p>

            <div className="space-y-3">
              {reviewsLoading && (
                <div className="space-y-2">
                  <div className="h-16 rounded-2xl bg-white/5 animate-shimmer" />
                  <div className="h-16 rounded-2xl bg-white/5 animate-shimmer" />
                </div>
              )}

              {!reviewsLoading &&
                recentReviews.map((review) => (
                  <div
                    key={review.mal_id}
                    onClick={() => handleSelect(review.entry)}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 cursor-pointer transition-all group select-none"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleSelect(review.entry);
                    }}
                  >
                    <img
                      src={
                        review.entry?.images?.webp?.image_url ||
                        review.entry?.images?.jpg?.image_url
                      }
                      alt={review.entry?.title}
                      className="w-11 h-14 rounded-xl object-cover flex-shrink-0 border border-white/10"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-semibold text-white truncate group-hover:text-[var(--primary-color)] transition-colors">
                        {review.entry?.title}
                      </h5>
                      <div className="flex items-center gap-1 text-[11px] text-yellow-400 font-semibold mt-1">
                        <Star size={10} fill="currentColor" />
                        <span>Score: {review.score || "8.5"}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Details Sheet Modal */}
      {selectedAnime && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center">
              <DetailsPanelLoader />
            </div>
          }
        >
          <AnimeDetailsPanel
            anime={selectedAnime}
            onClose={() => setSelectedAnime(null)}
            onSelectAnime={setSelectedAnime}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ExploreHome;

import React from "react";
import { X, Search, Star } from "lucide-react";

const FiltersBar = ({
  search,
  setSearch,
  genres,
  selectedGenre,
  setSelectedGenre,
  selectedStatus,
  setSelectedStatus,
  showStarredOnly,
  setShowStarredOnly,
  onClearFilters,
}) => {
  const hasActiveFilters =
    search || selectedGenre !== "All" || selectedStatus !== "All" || showStarredOnly;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Filter airings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-white/10 bg-white/[0.07] backdrop-blur-xl py-1.5 pl-9 pr-8 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Genre Selector */}
      <select
        value={selectedGenre}
        onChange={(e) => setSelectedGenre(e.target.value)}
        className="rounded-full border border-white/10 bg-white/[0.07] backdrop-blur-xl px-4 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/20"
      >
        {genres.map((g) => (
          <option key={g} value={g} className="bg-[#12121a] text-white">
            {g === "All" ? "All Genres" : g}
          </option>
        ))}
      </select>

      {/* Status Selector */}
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="rounded-full border border-white/10 bg-white/[0.07] backdrop-blur-xl px-4 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/20"
      >
        <option value="All" className="bg-[#12121a] text-white">All Status</option>
        <option value="Airing" className="bg-[#12121a] text-white">Currently Airing</option>
        <option value="Upcoming" className="bg-[#12121a] text-white">Upcoming</option>
      </select>

      {/* Starred Toggle */}
      <button
        type="button"
        onClick={() => setShowStarredOnly(!showStarredOnly)}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl border transition-all ${
          showStarredOnly
            ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-sm"
            : "bg-white/[0.07] text-white/70 border-white/10 hover:text-white hover:bg-white/[0.12]"
        }`}
      >
        <Star size={12} fill={showStarredOnly ? "currentColor" : "none"} />
        <span>Favorites Only</span>
      </button>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white/50 hover:text-white transition-colors"
        >
          <X size={12} />
          <span>Clear</span>
        </button>
      )}
    </div>
  );
};

export default FiltersBar;

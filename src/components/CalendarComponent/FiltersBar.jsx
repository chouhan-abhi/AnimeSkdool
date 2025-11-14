import React from "react";
import { X } from "lucide-react";

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
  const hasActiveFilters = search || selectedGenre !== "All" || selectedStatus !== "All" || showStarredOnly;

  return (
    <div className="flex items-center gap-2 flex-wrap md:ml-auto">
      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1 flex-wrap">
          {search && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--primary-color)]/20 text-[var(--primary-color)] text-xs">
              Search: "{search}"
              <button
                type="button"
                onClick={() => setSearch("")}
                className="hover:bg-[var(--primary-color)]/30 rounded p-0.5 transition"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {selectedGenre !== "All" && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--primary-color)]/20 text-[var(--primary-color)] text-xs">
              {selectedGenre}
              <button
                type="button"
                onClick={() => setSelectedGenre("All")}
                className="hover:bg-[var(--primary-color)]/30 rounded p-0.5 transition"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {selectedStatus !== "All" && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--primary-color)]/20 text-[var(--primary-color)] text-xs">
              {selectedStatus}
              <button
                type="button"
                onClick={() => setSelectedStatus("All")}
                className="hover:bg-[var(--primary-color)]/30 rounded p-0.5 transition"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {showStarredOnly && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--primary-color)]/20 text-[var(--primary-color)] text-xs">
              Starred Only
              <button
                type="button"
                onClick={() => setShowStarredOnly(false)}
                className="hover:bg-[var(--primary-color)]/30 rounded p-0.5 transition"
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Filter Inputs */}
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3 py-1 rounded-lg bg-[var(--text-color)]/10 text-[var(--text-color)] border border-[var(--text-color)]/20 w-40 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none placeholder:text-[var(--text-color)]/50"
      />
      <select
        value={selectedGenre}
        onChange={(e) => setSelectedGenre(e.target.value)}
        className="px-3 py-1 rounded-lg bg-[var(--text-color)]/10 text-[var(--text-color)] border border-[var(--text-color)]/20 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none"
      >
        {genres.map((g) => (
          <option key={g} value={g} className="bg-[var(--bg-color)]">
            {g}
          </option>
        ))}
      </select>
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="px-3 py-1 rounded-lg bg-[var(--text-color)]/10 text-[var(--text-color)] border border-[var(--text-color)]/20 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none"
      >
        <option value="All" className="bg-[var(--bg-color)]">All</option>
        <option value="Upcoming" className="bg-[var(--bg-color)]">Upcoming</option>
        <option value="Airing" className="bg-[var(--bg-color)]">Airing</option>
      </select>
      <button
        type="button"
        onClick={() => setShowStarredOnly(!showStarredOnly)}
        className={`flex items-center gap-2 px-3 py-[6px] rounded-lg text-sm font-medium transition ${
          showStarredOnly
            ? "bg-[var(--primary-color)] text-white"
            : "bg-[var(--text-color)]/10 text-[var(--text-color)] hover:bg-[var(--text-color)]/20"
        }`}
      >
        {showStarredOnly ? "★ Starred Only" : "☆ Starred Only"}
      </button>

      {/* Clear All Filters Button */}
      {hasActiveFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="flex items-center gap-1 px-3 py-[6px] rounded-lg text-sm font-medium transition bg-[var(--text-color)]/15 hover:bg-[var(--text-color)]/25 text-[var(--text-color)]"
        >
          <X size={14} />
          Clear All
        </button>
      )}
    </div>
  );
};

export default FiltersBar;

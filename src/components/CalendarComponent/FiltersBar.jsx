import React from "react";

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
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap md:ml-auto">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3 py-1 rounded-lg bg-gray-800 text-white w-40 focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
      />
      <select
        value={selectedGenre}
        onChange={(e) => setSelectedGenre(e.target.value)}
        className="px-3 py-1 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-[var(--primary-color)]"
      >
        {genres.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="px-3 py-1 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-[var(--primary-color)]"
      >
        <option value="All">All</option>
        <option value="Upcoming">Upcoming</option>
        <option value="Airing">Airing</option>
      </select>
      <button
        onClick={() => setShowStarredOnly(!showStarredOnly)}
        className={`flex items-center gap-2 px-3 py-[6px] rounded-lg text-sm font-medium transition ${
          showStarredOnly
            ? "bg-[var(--primary-color)] text-white"
            : "bg-gray-800 text-gray-200"
        }`}
      >
        {showStarredOnly ? "★ Starred Only" : "☆ Starred Only"}
      </button>
    </div>
  );
};

export default FiltersBar;

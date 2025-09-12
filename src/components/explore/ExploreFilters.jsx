import React from "react";
import { X } from "lucide-react";
import { RANKING_FILTER_CONFIG, COMMON_CLASS } from "../../utils/constants";

const ExploreFilters = ({
  isMobile,
  showSidebar,
  onClose,
  type,
  setType,
  filter,
  setFilter,
  rating,
  setRating,
  sfw,
  setSfw,
}) => {
  const FILTER_CLASSES = COMMON_CLASS.FILTERS;
  return (
    <aside
      className={`w-64 flex-shrink-0 transform transition-transform duration-300 rounded-xl
        ${COMMON_CLASS.DARK_BACKGROUNDS}
        ${isMobile ? "top-0 left-0 h-screen w-full" : "relative h-screen"} 
        ${isMobile ? (showSidebar ? "animate-slideIn" : "-translate-x-full hidden") : "translate-x-0"}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 top-0 z-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          Filters
        </h2>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[var(--hover-color)] transition"
          >
            <X size={20} className="text-[var(--text-color)]" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-6 p-4 overflow-y-auto h-[calc(100%-56px)]">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={FILTER_CLASSES}
            >
              <option value="">All Types</option>
              <option value="tv">TV</option>
              <option value="movie">Movie</option>
              <option value="ova">OVA</option>
              <option value="special">Special</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▾</span>
          </div>
        </div>

        {/* Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Filter</label>
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={FILTER_CLASSES}
            >
              {RANKING_FILTER_CONFIG.filter.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▾</span>
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-1">Rating</label>
          <div className="relative">
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className={FILTER_CLASSES}>
              <option value="">All Ratings</option>
              <option value="g">G - All Ages</option>
              <option value="pg">PG - Children</option>
              <option value="pg13">PG13 - Teens 13+</option>
              <option value="r17">R - 17+ (Violence & Profanity)</option>
              <option value="r">R+ - Mild Nudity</option>
              <option value="rx">Rx - Hentai</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▾</span>
          </div>
        </div>

        {/* SFW Toggle */}
        <div>
          <label className="block text-sm font-medium mb-2">Content Mode</label>
          <button
            onClick={() => setSfw((prev) => !prev)}
            className={`w-full flex items-center justify-between rounded-full px-4 py-2 text-sm font-medium transition 
              ${sfw ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
          >
            {sfw ? "SFW Only" : "NSFW Allowed"}
            <span
              className={`ml-2 inline-block w-10 h-5 rounded-full transition-all relative 
                ${sfw ? "bg-white/40" : "bg-black/30"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform 
                ${sfw ? "translate-x-5" : "translate-x-0"}`}
              />
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ExploreFilters;

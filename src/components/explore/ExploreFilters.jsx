import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Filter, RotateCcw, Check, ChevronDown } from "lucide-react";
import { RANKING_FILTER_CONFIG } from "../../utils/constants";

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
  embedded,
}) => {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = () => {
    setIsResetting(true);
    setTimeout(() => {
      setType("");
      setFilter("bypopularity");
      setRating("");
      setSfw(true);
      setIsResetting(false);
    }, 200);
  };

  const hasActiveFilters = type || filter !== "bypopularity" || rating || !sfw;

  // --- Embedded version (inline inside sidebar wrapper) ---
  if (embedded) {
    return (
      <div className="flex flex-col gap-6">
        <FilterSelect
          label="Anime Type"
          value={type}
          onChange={setType}
          options={[
            { value: "", label: "All Types" },
            { value: "tv", label: "TV Series" },
            { value: "movie", label: "Movie" },
            { value: "ova", label: "OVA" },
            { value: "special", label: "Special" },
          ]}
        />

        <FilterSelect
          label="Sort By"
          value={filter}
          onChange={setFilter}
          options={RANKING_FILTER_CONFIG.filter}
        />

        <FilterSelect
          label="Age Rating"
          value={rating}
          onChange={setRating}
          options={[
            { value: "", label: "All Ratings" },
            { value: "g", label: "G - All Ages" },
            { value: "pg", label: "PG - Children" },
            { value: "pg13", label: "PG13 - Teens 13+" },
            { value: "r17", label: "R - 17+ (Violence & Profanity)" },
            { value: "r", label: "R+ - Mild Nudity" },
            { value: "rx", label: "Rx - Hentai" },
          ]}
        />

        <SfwToggle sfw={sfw} setSfw={setSfw} />
      </div>
    );
  }

  // --- Sidebar Drawer (rendered in a portal) ---
  const sidebar = (
    <>
      {/* Overlay */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-[79]"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-full flex-shrink-0 transform transition-all duration-300 
          bg-[var(--bg-color)] shadow-lg rounded-r-xl z-[80]
          ${isMobile ? "fixed top-0 left-0 h-screen w-72" : "relative h-screen"} 
          ${isMobile ? (showSidebar ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--primary-color)]/10 rounded-lg">
              <Filter className="w-5 h-5 text-[var(--primary-color)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-color)]">Filters</h2>
              <p className="text-xs text-gray-500">Customize discovery</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
                title="Reset all filters"
              >
                <RotateCcw
                  className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${
                    isResetting ? "animate-spin" : ""
                  }`}
                />
              </button>
            )}
            {isMobile && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 p-6 overflow-y-auto h-[calc(100%-70px)]">
          <FilterSelect
            label="Anime Type"
            value={type}
            onChange={setType}
            options={[
              { value: "", label: "All Types" },
              { value: "tv", label: "TV Series" },
              { value: "movie", label: "Movie" },
              { value: "ova", label: "OVA" },
              { value: "special", label: "Special" },
            ]}
          />

          <FilterSelect
            label="Sort By"
            value={filter}
            onChange={setFilter}
            options={RANKING_FILTER_CONFIG.filter}
          />

          <FilterSelect
            label="Age Rating"
            value={rating}
            onChange={setRating}
            options={[
              { value: "", label: "All Ratings" },
              { value: "g", label: "G - All Ages" },
              { value: "pg", label: "PG - Children" },
              { value: "pg13", label: "PG13 - Teens 13+" },
              { value: "r17", label: "R - 17+ (Violence & Profanity)" },
              { value: "r", label: "R+ - Mild Nudity" },
              { value: "rx", label: "Rx - Hentai" },
            ]}
          />

          <SfwToggle sfw={sfw} setSfw={setSfw} />

          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {type && <Chip label={`Type: ${type}`} />}
              {filter !== "bypopularity" && (
                <Chip
                  label={`Sort: ${
                    RANKING_FILTER_CONFIG.filter.find((f) => f.value === filter)?.label
                  }`}
                />
              )}
              {rating && <Chip label={`Rating: ${rating}`} />}
              {!sfw && <Chip label="All Content" />}
            </div>
          )}
        </div>
      </aside>
    </>
  );

  return createPortal(sidebar, document.body);
};

// --- Reusable Components ---
const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-[var(--text-color)]">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-surface-dark/70 border border-gray-200 
        shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40 
        transition-all appearance-none cursor-pointer text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const SfwToggle = ({ sfw, setSfw }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-[var(--text-color)]">Content Safety</label>
    <button
      onClick={() => setSfw((prev) => !prev)}
      className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition 
        ${sfw ? "bg-green-500 text-white hover:shadow-lg" : "bg-red-500 text-white hover:shadow-lg"}`}
    >
      <span className="flex items-center gap-2">
        {sfw ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        {sfw ? "Safe Content Only" : "All Content Allowed"}
      </span>
      <div className="relative">
        <div className={`w-12 h-6 rounded-full ${sfw ? "bg-white/30" : "bg-black/30"} transition`}>
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform 
            ${sfw ? "translate-x-6" : "translate-x-0.5"}`}
          />
        </div>
      </div>
    </button>
  </div>
);

const Chip = ({ label }) => (
  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary-color)]/10 text-[var(--primary-color)] shadow-sm">
    {label}
  </span>
);

export default ExploreFilters;

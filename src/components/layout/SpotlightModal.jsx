import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { Search, X, Star, Play, Sparkles, TrendingUp, Clock, ArrowRight, CornerDownLeft } from "lucide-react";
import { useAnimeSearch } from "../../queries/useAnimeSearch";
import { useDebounce } from "../../utils/utils";
import storageManager from "../../utils/storageManager";

const TRENDING_SEARCHES = [
  "Solo Leveling",
  "Frieren: Beyond Journey's End",
  "Jujutsu Kaisen",
  "Demon Slayer",
  "Bleach: Thousand-Year Blood War",
  "One Piece",
  "Attack on Titan",
];

const SpotlightModal = ({ isOpen, onClose, onSelectAnime }) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState(() => storageManager.getRecentSearches());
  const inputRef = useRef(null);

  const { data: searchResults = [], isLoading } = useAnimeSearch(debouncedQuery);

  // Auto-focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setRecentSearches(storageManager.getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keydown (Escape, ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          searchResults.length > 0 ? (prev + 1) % searchResults.length : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          searchResults.length > 0
            ? (prev - 1 + searchResults.length) % searchResults.length
            : 0
        );
      } else if (e.key === "Enter") {
        if (searchResults.length > 0 && searchResults[selectedIndex]) {
          e.preventDefault();
          const selected = searchResults[selectedIndex];
          storageManager.addRecentSearch(selected.title || query);
          onSelectAnime?.(selected);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, query, onClose, onSelectAnime]);

  const handleSelect = useCallback(
    (anime) => {
      storageManager.addRecentSearch(anime.title);
      onSelectAnime?.(anime);
      onClose();
    },
    [onSelectAnime, onClose]
  );

  const handleChipClick = useCallback((term) => {
    setQuery(term);
    storageManager.addRecentSearch(term);
    inputRef.current?.focus();
  }, []);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Spotlight Window */}
      <div className="relative w-full max-w-2xl bg-[#12141f]/95 border border-white/20 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_40px_-5px_var(--glow-color)] overflow-hidden z-10 animate-scaleUp">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-white/10 bg-white/[0.04]">
          <Search size={20} className="text-white/60 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search anime by title, studio, genre (e.g. Frieren, MAPPA)..."
            className="w-full bg-transparent text-white placeholder:text-white/40 text-base sm:text-lg focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 ml-2"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-white/40 border border-white/15 rounded-md bg-white/5 ml-3">
            ESC
          </kbd>
        </div>

        {/* Results / Default State Area */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin p-3 space-y-1">
          {isLoading && query ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            </div>
          ) : query && searchResults.length > 0 ? (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40">
                Top Matches ({searchResults.length})
              </div>
              {searchResults.slice(0, 8).map((anime, idx) => {
                const isSelected = idx === selectedIndex;
                const img =
                  anime.images?.webp?.small_image_url ||
                  anime.images?.jpg?.small_image_url ||
                  anime.images?.webp?.image_url;

                return (
                  <div
                    key={anime.mal_id || idx}
                    onClick={() => handleSelect(anime)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-3.5 p-2.5 rounded-2xl cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "bg-white/15 shadow-md scale-[1.01]"
                        : "hover:bg-white/[0.06]"
                    }`}
                  >
                    <img
                      src={img}
                      alt={anime.title}
                      className="w-12 h-16 rounded-xl object-cover flex-shrink-0 bg-black/40 border border-white/10"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/80">
                          {anime.type || "TV"}
                        </span>
                        {anime.score && (
                          <span className="flex items-center gap-0.5 text-[11px] font-bold text-yellow-400">
                            <Star size={10} fill="currentColor" /> {anime.score}
                          </span>
                        )}
                        {anime.episodes && (
                          <span className="text-[11px] text-white/40">
                            {anime.episodes} eps
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-white truncate">
                        {anime.title}
                      </h4>
                      {anime.genres && (
                        <p className="text-xs text-white/40 truncate mt-0.5">
                          {anime.genres.slice(0, 3).map((g) => g.name).join(" · ")}
                        </p>
                      )}
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1 text-xs text-white/70 pr-2">
                        <span className="hidden sm:inline">Open</span>
                        <CornerDownLeft size={13} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : query && !isLoading ? (
            <div className="text-center py-12 text-white/50 text-sm">
              No anime found for "{query}".
            </div>
          ) : (
            /* Default Empty State with Trending & Recent */
            <div className="p-3 space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/40 mb-2.5">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        storageManager.clearRecentSearches();
                        setRecentSearches([]);
                      }}
                      className="text-[10px] text-white/40 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleChipClick(term)}
                        className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/15 text-xs text-white/80 hover:text-white border border-white/10 transition-all flex items-center gap-1.5"
                      >
                        <span>{term}</span>
                        <ArrowRight size={11} className="opacity-50" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/40 mb-2.5">
                  <TrendingUp size={12} />
                  Trending Anime
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleChipClick(term)}
                      className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/15 text-xs text-white/80 hover:text-white border border-white/10 transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] text-white/40">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="flex items-center gap-1 text-[var(--primary-color)]">
            <Sparkles size={12} /> Apple Spotlight
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SpotlightModal;

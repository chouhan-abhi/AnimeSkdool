import React, { useEffect, useState, useMemo } from 'react';
import AnimeCard from './AnimeCard';
import PageLoader from './PageLoader';

const WATCHLIST_KEY = 'watchlist';
const globalFilters = ['all', 'started', 'bookmarked', 'upcoming'];

const WatchlistPage = () => {
  const [filter, setFilter] = useState('all');
  const [isKids, setIsKids] = useState(false);
  const [isSFW, setIsSFW] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
      setWatchlist(saved);
    } catch (err) {
      console.error('Failed to load watchlist', err);
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredAnime = useMemo(() => {
    return watchlist.filter(anime => {
      if (isKids && !anime.isKids) return false;
      if (isSFW && !anime.isSFW) return false;
      if (filter === 'started') return anime.status === 'watching';
      if (filter === 'bookmarked') return anime.isBookmarked;
      if (filter === 'upcoming') return new Date(anime.airDate) > new Date();
      return true;
    });
  }, [watchlist, filter, isKids, isSFW]);

  return (
    <div className="flex h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans">
      {/* Sidebar */}
      {(isSidebarOpen || !isMobile) && (
        <aside
          className={`bg-[var(--secondary-color)] p-4 w-64 flex-shrink-0 rounded-r-xl transition-all ${
            isMobile ? 'fixed top-0 left-0 h-full z-50 shadow-lg' : 'h-full'
          }`}
        >
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 text-xl font-bold text-[var(--text-color)]"
            >
              ✕
            </button>
          )}
          <h2 className="text-lg font-semibold mb-4 text-[var(--primary-color)]">
            Filters
          </h2>
          <ul className="flex flex-col gap-2">
            {globalFilters.map(f => (
              <li key={f}>
                <button
                  onClick={() => {
                    setFilter(f);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded transition text-sm ${
                    filter === f
                      ? 'bg-[var(--primary-color)] text-[var(--bg-color)]'
                      : 'hover:bg-[var(--accent-color)] text-[var(--text-color)]'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full">
        <header className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h1 className="text-2xl font-bold">🎬 My Watchlist</h1>
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-[var(--text-color)] text-xl"
              >
                ☰
              </button>
            )}
            <div className="flex gap-3 text-sm">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={isKids}
                  onChange={() => setIsKids(!isKids)}
                  className="accent-[var(--primary-color)]"
                />
                Kids
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={isSFW}
                  onChange={() => setIsSFW(!isSFW)}
                  className="accent-[var(--primary-color)]"
                />
                SFW
              </label>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-10">
              <PageLoader />
            </div>
          ) : filteredAnime.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {filteredAnime.map(anime => (
                <AnimeCard key={anime.mal_id} anime={anime} showStatusBadge />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-20 text-lg">
              😴 No anime found
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default WatchlistPage;

import React, { useEffect, useState, useMemo } from 'react';
import AnimeCard from '../helperComponent/AnimeCard';
import PageLoader from '../helperComponent/PageLoader';

const WATCHLIST_KEY = 'watchlist';
const STARRED_KEY = 'starredAnime';
const CACHE_KEY = 'animeScheduleCache';
const globalFilters = ['all', 'started', 'bookmarked', 'upcoming'];

const WatchlistPage = () => {
  const [filter, setFilter] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [watchlist, setWatchlist] = useState([]);
  const [starredList, setStarredList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try {
      // ✅ load saved watchlist
      const savedWatchlist = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
      setWatchlist(savedWatchlist);

      // ✅ load starred ids + anime cache
      const starredIds = JSON.parse(localStorage.getItem(STARRED_KEY) || '[]');
      const animeCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
      const animeCacheMap = new Map(animeCache.map(a => [a.mal_id, a]));

      // build starred list separately
      const starredAnime = starredIds
        .map(id => animeCacheMap.get(id))
        .filter(Boolean)
        .map(anime => ({ ...anime, starred: true }));

      setStarredList(starredAnime);
    } catch (err) {
      console.error('Failed to load lists', err);
      setWatchlist([]);
      setStarredList([]);
    } finally {
      setLoading(false);
    }
  }, []);

const filteredAnime = useMemo(() => {
  if (filter === 'all') {
    // ✅ show everything: watchlist + starred (avoid duplicates by mal_id)
    const allMap = new Map();
    [...watchlist, ...starredList].forEach(anime => allMap.set(anime.mal_id, anime));
    return Array.from(allMap.values());
  }

  if (filter === 'started') {
    return starredList;
  }

  if (filter === 'bookmarked') {
    return watchlist.filter(anime => anime.isBookmarked);
  }

  if (filter === 'upcoming') {
    return watchlist.filter(anime => anime.status?.toLowerCase() === 'not yet aired');
  }

  return watchlist;
}, [watchlist, starredList, filter]);


  return (
    <div className="flex h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans">
      {/* Sidebar */}
      {(isSidebarOpen || !isMobile) && (
        <aside
          className={`bg-[var(--bg-color)] p-4 flex-shrink-0 rounded-r-xl transition-all ${
            isMobile ? 'fixed top-0 left-0 h-full w-full z-50 shadow-lg' : 'h-48 w-48'
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

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col h-full">
        <header className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h1 className="text-2xl font-bold">My Watchlist</h1>
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-[var(--text-color)] text-xl"
            >
              ☰
            </button>
          )}
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

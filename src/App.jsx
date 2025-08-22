import React, { useMemo, useState, useEffect } from 'react';
import AnimeCard from './components/AnimeCard';
import { useAnimeSchedule } from './queries/useAnimeSchedule';
import AnimeDayTimeline from './components/AnimeDayTimeLine';

// Get current weekday
const getCurrentDay = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

const daysOfWeek = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const App = () => {
  const [day, setDay] = useState(getCurrentDay());
  const [isKids, setIsKids] = useState(false);
  const [isSFW, setIsSFW] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (day) params.append('filter', day);
    params.append('kids', isKids);
    params.append('sfw', isSFW);
    return `?${params.toString()}`;
  }, [day, isKids, isSFW]);

  const { data, isLoading } = useAnimeSchedule(query); // Add isLoading from your hook
  const animeData = data || [];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className='bg-[#121212] text-white font-sans min-h-screen '>
      <h2 className='text-4xl font-bold pl-4'>Skdool</h2>
      <div className="flex relative">
        {isMobile && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-3 right-3 bg-transparent text-white border-none text-2xl cursor-pointer z-50"
            aria-label="Open sidebar"
          >
            ☰
          </button>
        )}
        {(isSidebarOpen || !isMobile) && (
          <>
            <aside
              className={`z-40 bg-[#1e1e1e] border-r border-[#333] p-6 w-[250px] ${isMobile ? 'fixed top-0 left-0 h-full max-w-[80vw] shadow-lg' : ''}`}
            >
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="absolute top-2 right-4 text-2xl bg-transparent border-none text-white cursor-pointer"
                  aria-label="Close sidebar"
                >
                  ✕
                </button>
              )}
              <h2 className="text-lg mb-4 text-[#eee] font-semibold">Filters</h2>

              {/* Day Buttons */}
              <div className="flex flex-col gap-2 mb-6">
                {daysOfWeek.map(d => (
                  <button
                    key={d}
                    onClick={() => {
                      setDay(d);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={`py-2 px-4 rounded-md bg-[#2c2c2c] text-[#ccc] border border-[#333] text-left text-base transition-all duration-200 ${day === d ? 'bg-[#3f51b5] text-white border-[#3f51b5]' : ''}`}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>

              {/* Filters */}
              <div className="mb-4">
                <label className="block mb-2 font-medium text-base text-[#aaa]">Kids</label>
                <select
                  value={isKids}
                  onChange={(e) => setIsKids(e.target.value === 'true')}
                  className="w-full p-2 rounded bg-[#2c2c2c] border border-[#444] text-[#eee] text-base"
                >
                  <option value="false">False</option>
                  <option value="true">True</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium text-base text-[#aaa]">SFW</label>
                <select
                  value={isSFW}
                  onChange={(e) => setIsSFW(e.target.value === 'true')}
                  className="w-full p-2 rounded bg-[#2c2c2c] border border-[#444] text-[#eee] text-base"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
            </aside>

            {/* Overlay */}
            {isMobile && (
              <div
                className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 z-30"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close sidebar overlay"
              />
            )}
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          <h1 className="text-2xl mb-4 font-bold">📅 Anime Schedule — {day.charAt(0).toUpperCase() + day.slice(1)}</h1>
          <AnimeGrid animeList={animeData} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
};

const AnimeGrid = ({ animeList, isLoading }) => (
  <>
    {isLoading ? (
      <div className="text-center py-5">
        <div className="loader mx-auto mb-2" />
        <p>Loading anime schedule...</p>
      </div>
    ) : (
      <>
        {animeList?.length ? <AnimeDayTimeline animeList={animeList} /> : null}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
          {animeList?.length > 0 ? (
            animeList.map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)
          ) : (
            <div className="text-center text-lg text-[#888] py-8">😴 No anime found</div>
          )}
        </div>
      </>
    )}
  </>
);

export default App;

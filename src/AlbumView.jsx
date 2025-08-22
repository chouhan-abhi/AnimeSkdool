import React, { useMemo, useState, useEffect } from 'react';
import AnimeCard from './components/AnimeCard';
import { useAnimeSchedule } from './queries/useAnimeSchedule';
import AnimeDayTimeline from './components/AnimeDayTimeLine';
import PageLoader from './components/PageLoader';

const getCurrentDay = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

const daysOfWeek = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const AlbumView = () => {
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

  const { data, isLoading } = useAnimeSchedule(query);
  const animeData = data || [];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-[#121212] text-white font-sans h-screen flex">
      {/* Sidebar */}
      {(isSidebarOpen || !isMobile) && (
        <>
          <aside
            className={`bg-[#1e1e1e] p-6 w-[250px] flex-shrink-0 ${
              isMobile
                ? 'fixed top-0 left-0 h-full max-w-[80vw] shadow-lg z-50'
                : 'h-full'
            }`}
          >
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-2 right-4 text-2xl text-white"
              >
                ✕
              </button>
            )}
            <h2 className="text-lg mb-4 font-semibold">Filters</h2>

            {/* Day Buttons */}
            <div className="flex flex-col gap-2 mb-6">
              {daysOfWeek.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDay(d);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={`py-2 px-4 rounded-md bg-[#2c2c2c] text-[#ccc] border border-[#333] text-left text-base ${
                    day === d ? 'bg-[#3f51b5] text-white' : ''
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="mb-4">
              <label className="block mb-2">Kids</label>
              <select
                value={isKids}
                onChange={(e) => setIsKids(e.target.value === 'true')}
                className="w-full p-2 rounded bg-[#2c2c2c] border border-[#444]"
              >
                <option value="false">False</option>
                <option value="true">True</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">SFW</label>
              <select
                value={isSFW}
                onChange={(e) => setIsSFW(e.target.value === 'true')}
                className="w-full p-2 rounded bg-[#2c2c2c] border border-[#444]"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </aside>

          {/* Overlay for Mobile */}
          {isMobile && (
            <div
              className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 z-30"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="p-4 border-b border-[#333] flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            📅 Viewing {day.charAt(0).toUpperCase() + day.slice(1)}
          </h1>
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-white text-2xl"
            >
              ☰
            </button>
          )}
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4">
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
        <PageLoader />
      </div>
    ) : (
      <>
        {animeList?.length ? <AnimeDayTimeline animeList={animeList} /> : null}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
          {animeList?.length > 0 ? (
            animeList.map((anime) => <AnimeCard key={anime.mal_id} anime={anime} />)
          ) : (
            <div className="text-center text-lg text-[#888] py-8">😴 No anime found</div>
          )}
        </div>
      </>
    )}
  </>
);

export default AlbumView;

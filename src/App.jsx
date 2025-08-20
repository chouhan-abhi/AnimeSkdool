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

  const { data } = useAnimeSchedule(query);
  const animeData = data || [];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.app}>
      {/* Hamburger for Mobile */}
      {isMobile && (
        <button onClick={() => setIsSidebarOpen(true)} style={styles.hamburger}>
          ☰
        </button>
      )}

      {/* Sidebar */}
      {(isSidebarOpen || !isMobile) && (
        <>
          <div style={{ ...styles.sidebar, ...(isMobile ? styles.sidebarMobile : {}) }}>
            {isMobile && (
              <button onClick={() => setIsSidebarOpen(false)} style={styles.closeButton}>
                ✕
              </button>
            )}
            <h2 style={styles.sidebarTitle}>Filters</h2>

            {/* Day Buttons */}
            <div style={styles.dayList}>
              {daysOfWeek.map(d => (
                <button
                  key={d}
                  onClick={() => {
                    setDay(d);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  style={{
                    ...styles.dayButton,
                    ...(day === d ? styles.dayButtonActive : {})
                  }}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div style={styles.filterGroup}>
              <label style={styles.label}>Kids</label>
              <select
                value={isKids}
                onChange={(e) => setIsKids(e.target.value === 'true')}
                style={styles.select}
              >
                <option value="false">False</option>
                <option value="true">True</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.label}>SFW</label>
              <select
                value={isSFW}
                onChange={(e) => setIsSFW(e.target.value === 'true')}
                style={styles.select}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>

          {/* Overlay */}
          {isMobile && (
            <div style={styles.overlay} onClick={() => setIsSidebarOpen(false)} />
          )}
        </>
      )}

      {/* Main Content */}
      <div style={styles.main}>
        <h1 style={styles.header}>📅 Anime Schedule — {day.charAt(0).toUpperCase() + day.slice(1)}</h1>
        <AnimeGrid animeList={animeData} />
      </div>
    </div>
  );
};

const AnimeGrid = ({ animeList }) => (
  <>
    {animeList?.length ? <AnimeDayTimeline animeList={animeList} /> : null}
    <div style={styles.grid}>
      {animeList?.length > 0
        ? animeList.map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)
        : <div style={styles.noData}>😴 No anime found</div>}
    </div>
  </>
);

export default App;

const styles = {
  app: {
    display: 'flex',
    background: '#121212',
    color: '#fff',
    minHeight: '100vh',
    fontFamily: `'Segoe UI', Roboto, sans-serif`,
    position: 'relative',
  },

  // Sidebar
  sidebar: {
    width: '250px',
    padding: '1.5rem',
    backgroundColor: '#1e1e1e',
    borderRight: '1px solid #333',
    zIndex: 1001,
  },
  sidebarMobile: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    maxWidth: '80%',
    backgroundColor: '#1e1e1e',
    boxShadow: '2px 0 8px rgba(0,0,0,0.6)',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    fontSize: '1.5rem',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
  },
  sidebarTitle: {
    fontSize: '1.2rem',
    marginBottom: '1rem',
    color: '#eee',
  },
  dayList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  dayButton: {
    padding: '0.6rem 1rem',
    borderRadius: '6px',
    background: '#2c2c2c',
    color: '#ccc',
    border: '1px solid #333',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
  },
  dayButtonActive: {
    background: '#3f51b5',
    color: '#fff',
    borderColor: '#3f51b5',
  },
  filterGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.4rem',
    fontWeight: 500,
    fontSize: '0.95rem',
    color: '#aaa',
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid #444',
    background: '#2c2c2c',
    color: '#eee',
    fontSize: '0.95rem',
  },

  // Hamburger
  hamburger: {
    display: 'none',
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    zIndex: 1100,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '2rem',
    cursor: 'pointer',
  },

  // Overlay
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },

  // Main content
  main: {
    flex: 1,
    padding: '2rem',
    paddingLeft: 'clamp(2rem, 4vw, 4rem)',
    overflowY: 'auto',
    position: 'relative',
  },
  header: {
    fontSize: '1.8rem',
    marginBottom: '1.5rem',
    textShadow: '0 0 4px rgba(0,255,255,0.2)',
  },

  // Anime grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  noData: {
    textAlign: 'center',
    color: '#888',
    padding: '2rem',
  },
};

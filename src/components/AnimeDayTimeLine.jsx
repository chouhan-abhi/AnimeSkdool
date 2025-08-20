import React, { useMemo, useState } from 'react';

// Utility functions
const getTimeInHours = (timeStr = "00:00") => {
  const [h, m] = timeStr.split(':');
  return parseInt(h) + parseInt(m) / 60;
};

const getDurationInMin = (durationStr = "24 min") => {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 24;
};

// Segments: 0–6, 6–12, 12–18, 18–24
const segments = [
  { label: 'Midnight - 6 AM', start: 0, end: 6 },
  { label: '6 AM - Noon', start: 6, end: 12 },
  { label: 'Noon - 6 PM', start: 12, end: 18 },
  { label: '6 PM - Midnight', start: 18, end: 24 }
];

const AnimeDayTimeline = ({ animeList }) => {
  const currentHour = new Date().getHours();
  const defaultSegmentIndex = Math.floor(currentHour / 6);

  const [activeSegment, setActiveSegment] = useState(defaultSegmentIndex);

  const visibleSegment = segments[activeSegment];

  const filteredAnime = useMemo(() => {
    return animeList
      .map(anime => {
        const timeStr = anime.broadcast?.time;
        const durationStr = anime.duration;
        if (!timeStr) return null;

        const start = getTimeInHours(timeStr);
        const duration = getDurationInMin(durationStr || '24 min');
        const end = start + duration / 60;

        return {
          title: anime.title,
          start,
          end,
          duration,
          color: anime.color || '#3f51b5',
        };
      })
      .filter(a => a && a.start < visibleSegment.end && a.end > visibleSegment.start)
      .sort((a, b) => a.start - b.start);
  }, [animeList, visibleSegment]);

  // Handle overlaps by stacking
  const rows = [[]];
  for (const item of filteredAnime) {
    let placed = false;
    for (const row of rows) {
      if (!row.some(e => !(e.end <= item.start || e.start >= item.end))) {
        row.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) rows.push([item]);
  }

  return (
    <div style={timelineStyles.wrapper}>
      <div style={timelineStyles.navRow}>
        <button
          onClick={() => setActiveSegment((prev) => Math.max(prev - 1, 0))}
          disabled={activeSegment === 0}
          style={timelineStyles.navButton}
        >
          ◀
        </button>

        <span style={timelineStyles.segmentLabel}>
          {visibleSegment.label}
        </span>

        <button
          onClick={() => setActiveSegment((prev) => Math.min(prev + 1, segments.length - 1))}
          disabled={activeSegment === segments.length - 1}
          style={timelineStyles.navButton}
        >
          ▶
        </button>
      </div>

      <div style={timelineStyles.timeLabels}>
        {Array.from({ length: visibleSegment.end - visibleSegment.start + 1 }, (_, i) => {
          const h = visibleSegment.start + i;
          return (
            <span key={h} style={timelineStyles.label}>
              {h}:00
            </span>
          );
        })}
      </div>

      {rows.map((row, rowIndex) => (
        <div key={rowIndex} style={timelineStyles.track}>
          {row.map((item, index) => {
            const visibleStart = visibleSegment.start;
            const visibleEnd = visibleSegment.end;

            const effectiveStart = Math.max(item.start, visibleStart);
            const effectiveEnd = Math.min(item.end, visibleEnd);

            const left = ((effectiveStart - visibleStart) / 6) * 100;
            const width = ((effectiveEnd - effectiveStart) / 6) * 100;

            return (
              <div
                key={index}
                title={`${item.title} — ${item.duration} min`}
                style={{
                  ...timelineStyles.segment,
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: item.color,
                }}
              >
                <span style={timelineStyles.segmentLabelInner}>
                  {item.title.length > 16 ? item.title.slice(0, 14) + '…' : item.title}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default AnimeDayTimeline;

const timelineStyles = {
  wrapper: {
    margin: '2rem 0',
    padding: '1rem',
    background: '#121212',
    borderRadius: '8px',
    color: '#ccc',
    overflowX: 'auto',
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  navButton: {
    padding: '0.3rem 0.75rem',
    fontSize: '1.2rem',
    background: '#1e1e1e',
    color: '#ccc',
    border: '1px solid #333',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  segmentLabel: {
    fontSize: '0.9rem',
    fontWeight: '500',
    textAlign: 'center',
  },
  timeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    marginBottom: '0.5rem',
  },
  label: {
    width: '100%',
    textAlign: 'center',
    color: '#666',
  },
  track: {
    position: 'relative',
    height: '32px',
    background: '#2b2b2b',
    borderRadius: '4px',
    marginBottom: '6px',
  },
  segment: {
    position: 'absolute',
    height: '100%',
    borderRadius: '4px',
    padding: '0 6px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.7rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    color: '#fff',
    boxShadow: '0 0 4px rgba(0,0,0,0.3)',
  },
  segmentLabelInner: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

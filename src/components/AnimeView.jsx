import React, { useState } from "react";
import UpcomingAnimeList from "./UpcomingAnimeList";
import AnimeRanking from "./AnimeRanking";

const AnimeView = () => {
  const [viewMode, setViewMode] = useState("upcoming");

  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar */}
      <div className="flex justify-center bg-[var(--bg-color)] px-4 py-2">
        <div className="border border-gray-400 rounded-full">
          {["upcoming", "ranking"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1 rounded-full font-medium transition ${
                viewMode === mode
                  ? "bg-[var(--primary-color)] text-[var(--bg-color)]"
                  : "text-[var(--text-color)]"
              }`}
            >
              {mode === "upcoming" ? "Upcoming Anime" : "Anime Ranking"}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Switch */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "upcoming" ? <UpcomingAnimeList /> : <AnimeRanking />}
      </div>
    </div>
  );
};

export default AnimeView;

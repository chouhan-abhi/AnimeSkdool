import React, { useState } from "react";
import UpcomingAnimeList from "./UpcomingAnimeList";
import ExploreAnime from "./ExploreAnime";

const ExploreHome = () => {
  const [viewMode, setViewMode] = useState("upcoming");

  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar */}
      <div className="flex justify-center bg-[var(--bg-color)] px-4 pt-2 sm:py-4">
        <div className="border border-gray-400 rounded-full">
          {["upcoming", "ranking"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1 rounded-full font-medium transition ${
                viewMode === mode
                  ? "bg-[var(--primary-color)]"
                  : "text-[var(--text-color)]"
              }`}
            >
              {mode === "upcoming" ? "Upcoming Anime" : "Explore"}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Switch */}
      <div className="flex-1 overflow-hidden sm:mt-0 mt-2">
        {viewMode === "upcoming" ? <UpcomingAnimeList /> : <ExploreAnime />}
      </div>
    </div>
  );
};

export default ExploreHome;

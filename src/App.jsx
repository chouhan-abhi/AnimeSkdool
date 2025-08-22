import React, { useState } from "react";
import AlbumView from "./AlbumView";
import CalendarView from "./CalendarView";
import AnimeRanking from "./components/AnimeRanking"; // Import the ranking component

const App = () => {
  const [activeView, setActiveView] = useState("calendar"); // 'album', 'calendar', 'ranking'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-50">
        {/* Title */}
        <h1 className="text-3xl font-bold text-indigo-400 mb-3 md:mb-0">
          Skdool
        </h1>

        {/* View Switch Tabs */}
        <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <button
            onClick={() => setActiveView("album")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeView === "album"
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            Album View
          </button>
          <button
            onClick={() => setActiveView("calendar")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeView === "calendar"
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setActiveView("ranking")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeView === "ranking"
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            Ranking
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {activeView === "album" && <AlbumView />}
        {activeView === "calendar" && <CalendarView />}
        {activeView === "ranking" && <AnimeRanking />}
      </main>
    </div>
  );
};

export default App;

import React, { useState, useEffect } from "react";
import { Home, Calendar, Image, Compass, Settings } from "lucide-react";
import WatchlistPage from "./components/WatchlistPage";
import CalendarView from "./components/CalendarComponent/CalendarView";
import AppHome from "./components/AppHome";
import SettingsPage from "./components/SettingsPage";
import ExploreHome from "./components/explore/ExploreHome";

const PRIMARY_COLOR_KEY = "primaryColor";

const App = () => {
  // ✅ Initialize active view from sessionStorage
  const [activeView, setActiveView] = useState(() => {
    return sessionStorage.getItem("activeView") || "home";
  });

  // ✅ Load saved theme color on mount
  useEffect(() => {
    const savedColor = localStorage.getItem(PRIMARY_COLOR_KEY);
    if (savedColor) {
      document.documentElement.style.setProperty("--primary-color", savedColor);
    }
  }, []);

  // ✅ Persist activeView in sessionStorage
  useEffect(() => {
    sessionStorage.setItem("activeView", activeView);
  }, [activeView]);

  const navItems = [
    { key: "home", label: "Home", icon: <Home size={22} className="text-[var(--primary-color)]" /> },
    { key: "watchList", label: "WatchList", icon: <Image size={22} className="text-[var(--primary-color)]" /> },
    { key: "calendar", label: "Calendar", icon: <Calendar size={22} className="text-[var(--primary-color)]" /> },
    { key: "explore", label: "Explore", icon: <Compass size={22} className="text-[var(--primary-color)]" /> },
    { key: "settings", label: "Settings", icon: <Settings size={22} className="text-[var(--primary-color)]" /> },
  ];

  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* Header (Desktop) */}
      <header className="fixed hidden md:flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-50 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--primary-color)]">
          AniSkdool
        </h1>

        {/* Desktop Nav */}
        <div className="flex items-center gap-2 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-inner shadow-xl">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 
                ${activeView === item.key
                  ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
                  : "text-gray-300 hover:bg-gray-700"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Mobile Title Bar */}
      <header className="md:hidden fixed w-full top-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-[var(--primary-color)]">
          AniSkdool
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow md:p-4 sm:mt-0 mt-14 pb-24">
        {activeView === "home" && <AppHome />}
        {activeView === "watchList" && <WatchlistPage />}
        {activeView === "calendar" && <CalendarView />}
        {activeView === "explore" && <ExploreHome />}
        {activeView === "settings" && <SettingsPage />}
      </main>

      {/* Floating Pill Navigation (Mobile) */}
      <nav
        className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 
        bg-gray-900/40 border border-gray-500 
        flex justify-around items-center gap-6 px-6 py-2 rounded-full shadow-xl z-50 shadow-xl"
        style={{ backdropFilter: "blur(6px)" }}
      >
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveView(item.key)}
            className={`relative p-2 rounded-full transition-all duration-200 
              ${activeView === item.key
                ? "text-[var(--primary-color)] scale-110 bg-gray-800/70 shadow-md"
                : "text-gray-400 hover:text-white"
              }`}
          >
            {item.icon}
            {activeView === item.key && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--primary-color)] animate-bounce" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;

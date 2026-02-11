import React, { useState, useEffect, Suspense, lazy } from "react";
import TopNav from "./components/layout/TopNav";
import BottomNav from "./components/layout/BottomNav";
import Footer from "./components/layout/Footer";

const AppHome = lazy(() => import("./components/AppHome"));
const WatchlistPage = lazy(() => import("./components/WatchlistPage"));
const CalendarView = lazy(() => import("./components/CalendarComponent/CalendarView"));
const ExploreHome = lazy(() => import("./components/explore/ExploreHome"));
const SettingsPage = lazy(() => import("./components/SettingsPage"));

const App = () => {
  // ✅ Initialize active view from sessionStorage
  const [activeView, setActiveView] = useState(() => {
    return sessionStorage.getItem("activeView") || "home";
  });

  // Note: Theme and color settings are applied in SettingsPage and main.jsx
  // This component doesn't need to handle theme application

  // ✅ Persist activeView in sessionStorage
  useEffect(() => {
    sessionStorage.setItem("activeView", activeView);
  }, [activeView]);

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen text-white flex flex-col">
      <TopNav
        activeView={activeView}
        onNavigate={setActiveView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <main className="flex-grow pt-4 md:pt-6 pb-24">
        <Suspense
          fallback={
            <div className="px-6 py-10 text-sm text-white/70">
              Loading...
            </div>
          }
        >
          {activeView === "home" && (
            <AppHome
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNavigate={setActiveView}
            />
          )}
          {activeView === "watchList" && <WatchlistPage />}
          {activeView === "calendar" && <CalendarView />}
          {activeView === "explore" && <ExploreHome />}
          {activeView === "settings" && <SettingsPage />}
        </Suspense>
      </main>

      <Footer />
      <BottomNav activeView={activeView} onNavigate={setActiveView} />
    </div>
  );
};

export default App;

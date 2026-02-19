import React, { useState, useEffect, Suspense, lazy } from "react";
import TopNav from "./components/layout/TopNav";
import BottomNav from "./components/layout/BottomNav";
import Footer from "./components/layout/Footer";

const AppHome = lazy(() => import("./components/AppHome"));
const WatchlistPage = lazy(() => import("./components/WatchlistPage"));
const CalendarView = lazy(() => import("./components/CalendarComponent/CalendarView"));
const ExploreHome = lazy(() => import("./components/explore/ExploreHome"));
const SettingsPage = lazy(() => import("./components/SettingsPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-[var(--primary-color)] border-t-transparent animate-spin" />
      <span className="text-sm text-[var(--text-muted)]">Loading...</span>
    </div>
  </div>
);

const App = () => {
  const [activeView, setActiveView] = useState(() => {
    return sessionStorage.getItem("activeView") || "home";
  });

  useEffect(() => {
    sessionStorage.setItem("activeView", activeView);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeView]);

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen text-[var(--text-color)] flex flex-col">
      <TopNav
        activeView={activeView}
        onNavigate={setActiveView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-grow md:pt-[var(--nav-height)] pb-28 md:pb-8">
        <Suspense fallback={<PageLoader />}>
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

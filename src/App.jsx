import React, { useState, useEffect, Suspense, lazy } from "react";
import TopNav from "./components/layout/TopNav";
import BottomNav from "./components/layout/BottomNav";
import Footer from "./components/layout/Footer";
import { DetailsPanelLoader } from "./helperComponent/PageLoader";

const AppHome = lazy(() => import("./components/AppHome"));
const WatchlistPage = lazy(() => import("./components/WatchlistPage"));
const CalendarView = lazy(() => import("./components/CalendarComponent/CalendarView"));
const ExploreHome = lazy(() => import("./components/explore/ExploreHome"));
const SettingsPage = lazy(() => import("./components/SettingsPage"));
const AnimeDetailsPanel = lazy(() => import("./components/AnimeDetailsPanel"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      <span className="text-xs font-semibold tracking-wider text-white/50 uppercase">Loading...</span>
    </div>
  </div>
);

const App = () => {
  const [activeView, setActiveView] = useState(() => {
    return sessionStorage.getItem("activeView") || "home";
  });

  const [selectedAnime, setSelectedAnime] = useState(null);

  useEffect(() => {
    sessionStorage.setItem("activeView", activeView);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeView]);

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-white flex flex-col selection:bg-white selection:text-black">
      <TopNav
        activeView={activeView}
        onNavigate={setActiveView}
        onSelectAnime={setSelectedAnime}
      />

      <main
        className={`flex-grow pb-28 md:pb-12 ${
          activeView === "home" ? "" : "md:pt-[var(--nav-height)]"
        }`}
      >
        <Suspense fallback={<PageLoader />}>
          {activeView === "home" && (
            <AppHome
              onNavigate={setActiveView}
              onSelectAnime={setSelectedAnime}
            />
          )}
          {activeView === "watchList" && (
            <WatchlistPage onSelectAnime={setSelectedAnime} />
          )}
          {activeView === "calendar" && (
            <CalendarView onSelectAnime={setSelectedAnime} />
          )}
          {activeView === "explore" && (
            <ExploreHome onSelectAnime={setSelectedAnime} />
          )}
          {activeView === "settings" && <SettingsPage />}
        </Suspense>
      </main>

      <Footer />
      <BottomNav activeView={activeView} onNavigate={setActiveView} />

      {/* Global Details Sheet Modal */}
      {selectedAnime && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center">
              <DetailsPanelLoader />
            </div>
          }
        >
          <AnimeDetailsPanel
            anime={selectedAnime}
            onClose={() => setSelectedAnime(null)}
            onSelectAnime={setSelectedAnime}
          />
        </Suspense>
      )}
    </div>
  );
};

export default App;

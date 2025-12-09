import React, { useState } from "react";
import ExploreAnime from "./ExploreAnime";
import ExploreSeasons from "./ExploreSeasons";
import { Calendar, TrendingUp } from "lucide-react";

const ExploreHome = () => {
  const [viewMode, setViewMode] = useState("seasons");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleModeChange = (mode) => {
    if (mode === viewMode) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode(mode);
      setIsTransitioning(false);
    }, 150);
  };

  const modes = [
    {
      key: "ranking",
      label: "Explore",
      icon: TrendingUp,
    },
    {
      key: "seasons",
      label: "Seasons",
      icon: Calendar,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[var(--bg-color)] to-[var(--bg-color)]/95">
      {/* Centered Chrome-like Tab Selector */}
      <div className="relative bg-[var(--bg-color)] flex justify-center">
        <div className="flex items-center gap-2 px-4 rounded-t-xl shadow-sm bg-[var(--bg-color)]/60 mt-2">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.key;
            return (
              <button
                key={mode.key}
                type="button"
                onClick={() => handleModeChange(mode.key)}
                className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-t-xl transition-all border-b-4 ${
                  isActive
                    ? "bg-[var(--primary-color)] text-white border-b-transparent"
                    : "bg-[var(--bg-color)]/80 text-[var(--text-color)] border-b-transparent hover:border-b-[var(--primary-color)] hover:text-[var(--primary-color)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Transition overlay */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-[var(--bg-color)]/80 z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 text-[var(--primary-color)]">
              <div className="w-2 h-2 bg-[var(--primary-color)] rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-[var(--primary-color)] rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-[var(--primary-color)] rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </div>
        )}

        {/* Content with fade transition */}
        <div
          className={`h-full transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {viewMode === "seasons" ? <ExploreSeasons /> : <ExploreAnime />}
        </div>
      </div>
    </div>
  );
};

export default ExploreHome;

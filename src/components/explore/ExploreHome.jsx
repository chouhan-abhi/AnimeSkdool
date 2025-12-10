import React, { useState, useCallback } from "react";
import ExploreAnime from "./ExploreAnime";
import ExploreSeasons from "./ExploreSeasons";
import { Calendar, TrendingUp, Sparkles } from "lucide-react";

const ExploreHome = () => {
  const [viewMode, setViewMode] = useState("seasons");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleModeChange = useCallback((mode) => {
    if (mode === viewMode || isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode(mode);
      setIsTransitioning(false);
    }, 200);
  }, [viewMode, isTransitioning]);

  const modes = [
    {
      key: "seasons",
      label: "Seasons",
      icon: Calendar,
      description: "Browse by season",
    },
    {
      key: "ranking",
      label: "Explore",
      icon: TrendingUp,
      description: "Top ranked anime",
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-color)]">
      {/* Header with Tab Selector */}
      <div className="flex-shrink-0 px-3 pt-3 pb-2 md:px-6 md:pt-4">
        {/* Segmented Control Container */}
        <div className="flex justify-start">
          <div className="inline-flex items-center p-1 rounded-xl bg-[var(--text-color)]/5 border border-[var(--text-color)]/10 shadow-inner">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = viewMode === mode.key;
              return (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => handleModeChange(mode.key)}
                  disabled={isTransitioning}
                  className={`
                    relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg
                    transition-all duration-200 ease-out
                    disabled:cursor-not-allowed
                    ${isActive
                      ? "bg-[var(--primary-color)] text-white shadow-lg shadow-[var(--primary-color)]/30"
                      : "text-[var(--text-color)]/70 hover:text-[var(--text-color)] hover:bg-[var(--text-color)]/5"
                    }
                  `}
                  title={mode.description}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Transition overlay */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-[var(--bg-color)]/90 z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              {/* Animated spinner */}
              <div className="relative">
                <Sparkles 
                  className="w-8 h-8 text-[var(--primary-color)] animate-spin" 
                  style={{ animationDuration: '1.5s' }}
                />
                <div className="absolute inset-0 w-8 h-8 rounded-full bg-[var(--primary-color)]/20 animate-ping" />
              </div>
              <span className="text-xs text-[var(--text-color)]/50 font-medium tracking-wide">
                Loading...
              </span>
            </div>
          </div>
        )}

        {/* Content with smooth transition */}
        <div
          className={`
            h-full transition-all duration-300 ease-out
            ${isTransitioning ? "opacity-0 scale-[0.99]" : "opacity-100 scale-100"}
          `}
        >
          {viewMode === "seasons" ? <ExploreSeasons /> : <ExploreAnime />}
        </div>
      </div>
    </div>
  );
};

export default ExploreHome;

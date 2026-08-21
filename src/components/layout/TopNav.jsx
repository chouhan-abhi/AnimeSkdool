import React, { useState, useEffect } from "react";
import { Bookmark, Search, Settings, Play } from "lucide-react";
import IconButton from "../ui/IconButton";
import SpotlightModal from "./SpotlightModal";

const TopNav = ({ activeView, onNavigate, onSelectAnime }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navItems = [
    { key: "home", label: "Home" },
    { key: "calendar", label: "Schedule" },
    { key: "explore", label: "Browse" },
    { key: "watchList", label: "Up Next" },
  ];

  return (
    <>
      {/* Mobile Top App Bar */}
      <header
        className={`md:hidden sticky top-0 left-0 right-0 z-40 px-4 py-3 transition-all duration-300 ${
          scrolled
            ? "bg-[#060608]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-lg"
            : "bg-gradient-to-b from-black/90 to-transparent"
        }`}
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate?.("home")}
            className="flex items-center gap-2 text-white focus:outline-none"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--primary-color)] to-white/30 text-white shadow-[0_0_16px_var(--glow-color)]">
              <Play size={14} className="fill-white translate-x-0.5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              Anime<span className="text-[var(--primary-color)] font-black">Skdool</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsSpotlightOpen(true)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] py-1.5 px-3.5 text-xs text-white/80 active:scale-95 transition-transform"
          >
            <Search size={14} />
            <span>Search</span>
          </button>
        </div>
      </header>

      {/* Desktop Navigation Header */}
      <header
        className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          scrolled
            ? "bg-[var(--bg-color)]/80 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        }`}
      >
        <div className="mx-auto w-full max-w-[1800px] px-6 lg:px-12">
          <div className="flex items-center justify-between h-[var(--nav-height)]">
            {/* Logo & Main Nav Pill Group */}
            <div className="flex items-center gap-8 lg:gap-12">
              <button
                type="button"
                onClick={() => onNavigate?.("home")}
                className="flex items-center gap-2.5 text-white group focus:outline-none"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--primary-color)] to-white/30 text-white shadow-[0_0_24px_var(--glow-color)] transition-transform duration-300 group-hover:scale-105">
                  <Play size={16} className="fill-white translate-x-0.5" />
                </span>
                <span className="text-xl font-bold tracking-tight text-white flex items-center">
                  Anime<span className="text-[var(--primary-color)] font-black">Skdool</span>
                </span>
              </button>

              {/* Segmented Nav Pill Container */}
              <nav className="flex items-center p-1 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-inner">
                {navItems.map((item) => {
                  const active = activeView === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onNavigate?.(item.key)}
                      className={`relative px-4 lg:px-5 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all duration-300 ${
                        active
                          ? "text-white bg-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] scale-[1.02]"
                          : "text-[var(--text-muted)] hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right Action Icons & Spotlight Search Button */}
            <div className="flex items-center gap-3">
              {/* Spotlight Search Trigger Button */}
              <button
                type="button"
                onClick={() => setIsSpotlightOpen(true)}
                className="flex items-center gap-3 rounded-full border border-white/[0.1] bg-white/[0.07] hover:bg-white/[0.12] backdrop-blur-2xl py-2 pl-3.5 pr-3 text-xs lg:text-sm text-[var(--text-muted)] hover:text-white transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] group"
              >
                <Search size={15} className="group-hover:text-white transition-colors" />
                <span className="pr-4 hidden sm:inline">Search anime, cast, studios...</span>
                <span className="pr-2 sm:hidden">Search</span>
                <kbd className="text-[10px] font-semibold text-white/50 border border-white/15 rounded-md px-1.5 py-0.5 bg-white/10 group-hover:border-white/30">
                  ⌘K
                </kbd>
              </button>

              <IconButton
                label="Up Next Watchlist"
                active={activeView === "watchList"}
                onClick={() => onNavigate?.("watchList")}
              >
                <Bookmark size={17} />
              </IconButton>

              <IconButton
                label="Settings"
                active={activeView === "settings"}
                onClick={() => onNavigate?.("settings")}
              >
                <Settings size={17} />
              </IconButton>
            </div>
          </div>
        </div>
      </header>

      {/* Spotlight Command Palette Modal */}
      <SpotlightModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onSelectAnime={onSelectAnime}
      />
    </>
  );
};

export default TopNav;

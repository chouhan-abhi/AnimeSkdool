import React, { useState, useEffect, useRef } from "react";
import { Bell, Bookmark, Search, Settings, Play, X } from "lucide-react";
import IconButton from "../ui/IconButton";

const TopNav = ({ activeView, onNavigate, searchQuery, onSearchChange }) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef(null);

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
        inputRef.current?.focus();
        onNavigate?.("home");
      }
      if (e.key === "Escape" && searchFocused) {
        inputRef.current?.blur();
        onSearchChange?.("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchFocused, onNavigate, onSearchChange]);

  const navItems = [
    { key: "home", label: "Home" },
    { key: "calendar", label: "Schedule" },
    { key: "explore", label: "Browse" },
    { key: "watchList", label: "Watchlist" },
  ];

  return (
    <header
      className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--panel-bg)]/90 glass shadow-[0_1px_0_var(--border-color),0_8px_32px_-12px_var(--shadow-color)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto w-full max-w-[1800px] px-6 lg:px-10">
        <div className="flex items-center justify-between h-[var(--nav-height)]">
          <div className="flex items-center gap-10">
            <button
              type="button"
              onClick={() => onNavigate?.("home")}
              className="flex items-center gap-2.5 text-[var(--text-color)] group"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-color)] text-white shadow-[0_0_20px_var(--glow-color)] transition-transform duration-200 group-hover:scale-105">
                <Play size={18} />
              </span>
              <span className="text-lg font-bold tracking-wide">AniSkdool</span>
            </button>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = activeView === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onNavigate?.(item.key)}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? "text-[var(--primary-color)] bg-[var(--primary-color)]/10"
                        : "text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[var(--primary-color)]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`relative hidden lg:flex items-center transition-all duration-300 ${
                searchFocused ? "w-80" : "w-64"
              }`}
            >
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
              />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onFocus={() => {
                  setSearchFocused(true);
                  onNavigate?.("home");
                }}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search anime..."
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-1)]/60 py-2 pl-9 pr-16 text-sm text-[var(--text-color)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40 focus:border-[var(--primary-color)]/40 transition-all"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange?.("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-color)]"
                >
                  <X size={14} />
                </button>
              ) : (
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)] border border-[var(--border-color)] rounded px-1.5 py-0.5 bg-[var(--surface-1)]/80 pointer-events-none">
                  ⌘K
                </kbd>
              )}
            </div>

            <IconButton label="Notifications">
              <Bell size={18} />
            </IconButton>
            <IconButton label="Settings" onClick={() => onNavigate?.("settings")}>
              <Settings size={18} />
            </IconButton>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;

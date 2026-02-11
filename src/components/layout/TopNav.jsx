import React from "react";
import { Bell, Bookmark, Search, Settings, Play } from "lucide-react";
import IconButton from "../ui/IconButton";

const TopNav = ({
  activeView,
  onNavigate,
  searchQuery,
  onSearchChange,
}) => {
  const navItems = [
    { key: "home", label: "Home" },
    { key: "calendar", label: "Schedule" },
    { key: "explore", label: "Browse" },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-50">
      <div className="mx-auto w-full px-6">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--panel-bg)]/80 px-6 py-4 shadow-[0_18px_60px_-40px_var(--shadow-color)] backdrop-blur">
          <button
            type="button"
            onClick={() => onNavigate?.("home")}
            className="flex items-center gap-3 text-[var(--text-color)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-color)] text-white shadow-[0_0_18px_var(--glow-color)]">
              <Play size={20} />
            </span>
            <span className="text-lg font-bold tracking-wide">AniSkdool</span>
          </button>

          <nav className="flex items-center gap-6 text-sm text-[var(--text-color)]/70">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate?.(item.key)}
                className={`transition ${
                  activeView === item.key
                    ? "text-[var(--text-color)]"
                    : "hover:text-[var(--text-color)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-color)]/50"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onFocus={() => onNavigate?.("home")}
                placeholder="Search anime..."
                className="w-64 rounded-full border border-[var(--border-color)] bg-white/10 py-2 pl-9 pr-4 text-sm text-[var(--text-color)] placeholder:text-[var(--text-color)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/50"
              />
            </div>

            <IconButton label="Notifications">
              <Bell size={18} />
            </IconButton>
            <IconButton label="Watchlist" onClick={() => onNavigate?.("watchList")}>
              <Bookmark size={18} />
            </IconButton>
            <IconButton label="Settings" onClick={() => onNavigate?.("settings")}>
              <Settings size={18} />
            </IconButton>

            <div className="h-9 w-9 rounded-full border border-[var(--border-color)] bg-white/10" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;

import React from "react";
import { Home, Calendar, Compass, Image, Settings } from "lucide-react";

const BottomNav = ({ activeView, onNavigate }) => {
  const items = [
    { key: "home", label: "Home", icon: Home },
    { key: "calendar", label: "Schedule", icon: Calendar },
    { key: "explore", label: "Browse", icon: Compass },
    { key: "watchList", label: "Watchlist", icon: Image },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 left-1/2 z-50 w-[92%] -translate-x-1/2 rounded-full border border-[var(--border-color)] bg-[var(--panel-bg)]/80 px-3 py-2 shadow-[0_20px_60px_-40px_var(--shadow-color)] backdrop-blur">
      <div className="flex items-center justify-between">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate?.(item.key)}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                active
                  ? "bg-[var(--primary-color)] text-white shadow-[0_0_16px_var(--glow-color)]"
                  : "text-[var(--text-color)]/60 hover:text-[var(--text-color)]"
              }`}
              aria-label={item.label}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

import React from "react";
import { Home, Calendar, Compass, Bookmark, Settings } from "lucide-react";

const BottomNav = ({ activeView, onNavigate }) => {
  const items = [
    { key: "home", label: "Home", icon: Home },
    { key: "calendar", label: "Schedule", icon: Calendar },
    { key: "explore", label: "Browse", icon: Compass },
    { key: "watchList", label: "Watchlist", icon: Bookmark },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-3 mb-3 rounded-2xl border border-[var(--border-color)] bg-[var(--panel-bg)]/85 glass shadow-[0_-4px_30px_-8px_var(--shadow-color)]">
        <div className="flex items-center justify-around py-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate?.(item.key)}
                className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1.5 rounded-xl transition-all duration-200 ${
                  active
                    ? "text-[var(--primary-color)]"
                    : "text-[var(--text-muted)] active:scale-90"
                }`}
                aria-label={item.label}
              >
                <span
                  className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                    active
                      ? "bg-[var(--primary-color)]/15 shadow-[0_0_12px_var(--glow-color)]"
                      : ""
                  }`}
                >
                  <Icon size={active ? 20 : 18} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span
                  className={`text-[10px] font-medium transition-all duration-200 ${
                    active ? "text-[var(--primary-color)]" : "text-[var(--text-muted)]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;

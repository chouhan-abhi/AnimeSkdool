import React from "react";
import { Home, Calendar, Compass, Bookmark, Settings } from "lucide-react";

const BottomNav = ({ activeView, onNavigate }) => {
  const items = [
    { key: "home", label: "Home", icon: Home },
    { key: "calendar", label: "Schedule", icon: Calendar },
    { key: "explore", label: "Browse", icon: Compass },
    { key: "watchList", label: "Up Next", icon: Bookmark },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-1 pointer-events-none">
      <div className="mx-auto max-w-md rounded-full border border-white/[0.12] bg-[#121218]/85 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] pointer-events-auto p-1.5">
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate?.(item.key)}
                className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-full transition-all duration-200 ${
                  active
                    ? "text-white bg-white/15 shadow-[0_2px_8px_rgba(0,0,0,0.3)] scale-[1.05]"
                    : "text-[var(--text-muted)] hover:text-white active:scale-95"
                }`}
                aria-label={item.label}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-[10px] font-semibold tracking-tight mt-0.5">
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

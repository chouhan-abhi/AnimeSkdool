import React from "react";

// Detect mobile once
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// Single day skeleton
const DaySkeleton = ({ showHeader = true }) => (
  <div className="bg-[var(--bg-color)] border border-[var(--text-color)]/10 rounded-xl p-3 animate-pulse">
    {showHeader && (
      <div className="h-5 w-20 bg-[var(--text-color)]/10 rounded mx-auto mb-3" />
    )}
    <div className="space-y-2">
      {Array.from({ length: isMobile ? 2 : 3 }).map((_, idx) => (
        <div key={idx} className="flex gap-2 p-2 bg-[var(--text-color)]/5 rounded-lg">
          <div className="w-10 h-14 md:w-12 md:h-16 bg-[var(--text-color)]/10 rounded flex-shrink-0" />
          <div className="flex-1 space-y-1.5 py-1">
            <div className="h-3 bg-[var(--text-color)]/10 rounded w-3/4" />
            <div className="h-2.5 bg-[var(--text-color)]/10 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Mobile calendar loader - single day view
const MobileCalendarLoader = () => (
  <div className="p-4 space-y-4">
    {/* Day navigation skeleton */}
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 bg-[var(--text-color)]/10 rounded-full" />
      <div className="h-6 w-24 bg-[var(--text-color)]/10 rounded" />
      <div className="w-10 h-10 bg-[var(--text-color)]/10 rounded-full" />
    </div>
    
    {/* Day content */}
    <DaySkeleton showHeader={false} />
    
    {/* More items indicator */}
    <div className="flex justify-center pt-2">
      <div className="h-4 w-32 bg-[var(--text-color)]/10 rounded" />
    </div>
  </div>
);

// Desktop calendar loader - week view
const DesktopCalendarLoader = () => (
  <div className="p-4 md:p-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="h-6 w-24 bg-[var(--text-color)]/10 rounded" />
        <div className="h-5 w-16 bg-[var(--primary-color)]/20 rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-[var(--text-color)]/10 rounded-full" />
        <div className="w-8 h-8 bg-[var(--text-color)]/10 rounded-full" />
      </div>
    </div>
    
    {/* Week grid skeleton */}
    <div className="grid grid-cols-7 gap-3">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
        <div key={day} className="animate-pulse">
          <div className="text-center mb-2">
            <span className="text-xs text-[var(--text-color)]/30 font-medium">{day}</span>
          </div>
          <DaySkeleton showHeader={false} />
        </div>
      ))}
    </div>
  </div>
);

// Main export - auto-detects mobile/desktop
const CalendarLoader = ({ variant }) => {
  if (variant === "mobile" || (variant !== "desktop" && isMobile)) {
    return <MobileCalendarLoader />;
  }
  return <DesktopCalendarLoader />;
};

// Named exports for specific use cases
export { DaySkeleton, MobileCalendarLoader, DesktopCalendarLoader };
export default CalendarLoader;

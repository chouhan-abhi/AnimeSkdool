import React from "react";

const DayCalendarLoader = ({ day }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow-lg relative animate-pulse">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-500 border-gray-700 text-center">
        {day}
      </h3>

      {/* Red line placeholder */}
      <div className="absolute left-0 right-0 flex items-center h-0 z-50" style={{ top: "32%" }}>
        <div className="flex-1 h-[2px] bg-gray-700" />
        <span className="bg-gray-700 text-xs px-2 rounded-xl font-mono text-transparent">
          00:00
        </span>
      </div>

      {/* Fake anime cards */}
      <ul className="space-y-3 mb-20 relative z-20">
        {[1, 2, 3].map((n) => (
          <li
            key={n}
            className="flex items-center gap-2 bg-gray-800 rounded-lg p-1"
          >
            <div className="w-12 h-16 bg-gray-700 rounded-md flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-3 w-24 bg-gray-700 rounded" />
              <div className="h-4 w-34 bg-gray-600 rounded" />
              <div className="h-3 w-28 bg-gray-700 rounded" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DayCalendarLoader;

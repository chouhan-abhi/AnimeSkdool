import React from "react";
import { Ghost } from "lucide-react";

const NoAnimeFound = ({ message = "Oops! Nothing Here" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Funky ghost icon */}
      <Ghost
        size={128}
        className="text-[var(--primary-color)] mt-4 mb-4 animate-bounce"
      />

      {/* Fun heading */}
      <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-2">
        {message}
      </h2>
      {/* Easter egg / retry hint */}
      <div className="mt-4 text-sm text-gray-500">
        <span role="img" aria-label="sparkles">
          ✨
        </span>{" "}
        Try changing filters or check back later!
      </div>
    </div>
  );
};

export default NoAnimeFound;

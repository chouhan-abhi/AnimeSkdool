import React from "react";

const Pill = ({ children, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-[var(--border-color)] bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-color)] ${className}`}
    >
      {children}
    </span>
  );
};

export default Pill;

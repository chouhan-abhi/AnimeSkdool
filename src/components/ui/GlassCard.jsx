import React from "react";

const GlassCard = ({ children, className = "", hover = false }) => {
  return (
    <div
      className={`rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)]/60 glass shadow-[0_8px_32px_-12px_var(--shadow-color)] transition-all duration-300 ${
        hover ? "hover:shadow-[0_16px_48px_-16px_var(--glow-color)] hover:border-[var(--primary-color)]/20" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;

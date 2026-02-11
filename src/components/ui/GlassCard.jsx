import React from "react";

const GlassCard = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)]/70 shadow-[0_16px_50px_-35px_var(--shadow-color)] backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;

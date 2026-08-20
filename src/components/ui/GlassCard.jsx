import React from "react";

const GlassCard = ({ children, className = "", hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)]/70 backdrop-blur-2xl shadow-[0_8px_30px_-10px_var(--shadow-color)] transition-all duration-300 ${
        hover
          ? "hover:scale-[1.01] hover:border-[var(--border-light)] hover:shadow-[0_20px_45px_-12px_var(--shadow-color)] hover:bg-[var(--surface-1)]/85"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;

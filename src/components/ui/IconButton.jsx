import React from "react";

const IconButton = ({ children, onClick, className = "", label }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center h-9 w-9 rounded-xl border border-[var(--border-color)] bg-[var(--surface-1)]/60 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--surface-1)] hover:border-[var(--primary-color)]/30 active:scale-90 transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
};

export default IconButton;

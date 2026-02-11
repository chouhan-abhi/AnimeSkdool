import React from "react";

const IconButton = ({ children, onClick, className = "", label }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`h-9 w-9 rounded-full border border-[var(--border-color)] bg-[var(--surface-1)]/80 text-[var(--text-color)]/80 hover:text-[var(--text-color)] hover:shadow-[0_0_12px_var(--glow-color)] transition ${className}`}
    >
      <span className="flex items-center justify-center">{children}</span>
    </button>
  );
};

export default IconButton;

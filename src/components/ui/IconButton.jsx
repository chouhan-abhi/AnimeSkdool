import React from "react";

const IconButton = ({ children, onClick, className = "", label, active = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex items-center justify-center h-10 w-10 rounded-full border backdrop-blur-xl transition-all duration-200 active:scale-90 ${
        active
          ? "border-[var(--primary-color)]/40 bg-[var(--primary-color)]/20 text-[var(--primary-color)] shadow-[0_0_16px_var(--glow-color)]"
          : "border-white/10 bg-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/12 hover:border-white/20 hover:scale-105"
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default IconButton;

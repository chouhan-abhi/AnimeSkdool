import React from "react";

const Pill = ({ children, className = "", variant = "default" }) => {
  const styles = variant === "accent"
    ? "bg-[var(--primary-color)]/20 text-[var(--primary-color)] border-[var(--primary-color)]/30"
    : "bg-white/8 text-[var(--text-color)] border-[var(--border-color)]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles} ${className}`}
    >
      {children}
    </span>
  );
};

export default Pill;

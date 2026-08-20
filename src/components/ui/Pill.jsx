import React from "react";

const Pill = ({ children, className = "", variant = "default" }) => {
  const styles =
    variant === "accent"
      ? "bg-[var(--primary-color)]/20 text-[var(--primary-color)] border-[var(--primary-color)]/30 font-medium"
      : variant === "spec"
      ? "bg-white/10 text-white/90 border-white/20 font-bold tracking-widest text-[9px] uppercase px-2 py-0.5 rounded-[4px]"
      : variant === "solid"
      ? "bg-white text-black font-semibold border-transparent"
      : "bg-white/8 text-[var(--text-color)]/90 border-[var(--border-color)] font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] tracking-wide backdrop-blur-md ${styles} ${className}`}
    >
      {children}
    </span>
  );
};

export default Pill;

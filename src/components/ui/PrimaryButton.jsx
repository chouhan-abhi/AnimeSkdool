import React from "react";

const PrimaryButton = ({ children, onClick, className = "", variant = "primary", size = "md" }) => {
  const sizeClass = size === "sm"
    ? "px-3.5 py-1.5 text-xs gap-1.5"
    : "px-5 py-2.5 text-sm gap-2";

  const base = `inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 active:scale-95 ${sizeClass}`;

  const styles =
    variant === "secondary"
      ? "border border-[var(--border-color)] bg-white/8 text-white hover:bg-white/15 hover:border-white/20"
      : variant === "ghost"
        ? "text-[var(--text-color)] hover:bg-white/10"
        : "bg-[var(--primary-color)] text-white shadow-[0_4px_20px_-4px_var(--glow-color)] hover:shadow-[0_8px_28px_-4px_var(--glow-color)] hover:brightness-110";

  return (
    <button type="button" onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
};

export default PrimaryButton;

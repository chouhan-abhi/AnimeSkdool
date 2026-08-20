import React from "react";

const PrimaryButton = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  ...props
}) => {
  const sizeClass =
    size === "sm"
      ? "px-4 py-2 text-xs gap-1.5 font-medium"
      : size === "lg"
      ? "px-7 py-3.5 text-base gap-2.5 font-semibold"
      : "px-5 py-2.5 text-sm gap-2 font-semibold";

  const base = `inline-flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${sizeClass}`;

  const styles =
    variant === "white"
      ? "bg-white text-black hover:bg-white/90 shadow-[0_4px_24px_rgba(255,255,255,0.25)] hover:scale-[1.02]"
      : variant === "secondary" || variant === "glass"
      ? "backdrop-blur-xl bg-white/12 text-white border border-white/15 hover:bg-white/20 hover:border-white/30 hover:scale-[1.02]"
      : variant === "ghost"
      ? "text-[var(--text-color)] hover:bg-white/10"
      : "bg-[var(--primary-color)] text-white shadow-[0_4px_24px_-4px_var(--glow-color)] hover:shadow-[0_8px_32px_-4px_var(--glow-color)] hover:brightness-110 hover:scale-[1.02]";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;

import React from "react";

const PrimaryButton = ({ children, onClick, className = "", variant = "primary" }) => {
  const base =
    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition";
  const styles =
    variant === "secondary"
      ? "border border-[var(--border-color)] bg-white/10 text-white hover:bg-white/20"
      : "bg-[var(--primary-color)] text-white shadow-[0_0_22px_var(--glow-color)] hover:opacity-90";

  return (
    <button type="button" onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
};

export default PrimaryButton;

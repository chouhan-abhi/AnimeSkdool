import React from "react";

const SectionHeader = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-color)] tracking-wide">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>
        )}
      </div>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-medium text-[var(--primary-color)] hover:opacity-90 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default SectionHeader;

import React from "react";
import { ChevronRight } from "lucide-react";

const SectionHeader = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="w-1 h-6 rounded-full bg-[var(--primary-color)] shrink-0" />
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-color)] tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--primary-color)] hover:opacity-80 transition group"
        >
          {actionLabel}
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;

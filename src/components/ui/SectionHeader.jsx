import React from "react";
import { ChevronRight } from "lucide-react";

const SectionHeader = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  className = "",
  badge,
}) => {
  return (
    <div className={`flex items-end justify-between gap-4 ${className}`}>
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-color)]">
            {title}
          </h2>
          {badge && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/30">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 font-normal tracking-normal">
            {subtitle}
          </p>
        )}
      </div>

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="flex items-center gap-1 text-xs sm:text-sm font-medium text-[var(--primary-color)] hover:text-white transition-colors group pb-0.5"
        >
          <span>{actionLabel}</span>
          <ChevronRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;

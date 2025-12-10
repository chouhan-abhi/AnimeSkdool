import React from "react";

// Detect mobile once
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// Simple spinner for inline loading
export const Spinner = ({ size = 24, className = "" }) => (
  <div 
    className={`animate-spin rounded-full border-2 border-[var(--text-color)]/20 border-t-[var(--primary-color)] ${className}`}
    style={{ width: size, height: size }}
  />
);

// Minimal loader for small spaces
export const MiniLoader = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center gap-2 py-4">
    <Spinner size={16} />
    <span className="text-sm text-[var(--text-color)]/60">{text}</span>
  </div>
);

// Card skeleton for grid layouts
export const CardSkeleton = ({ className = "" }) => (
  <div className={`bg-[var(--text-color)]/5 rounded-xl overflow-hidden animate-pulse ${className}`}>
    <div className="aspect-[3/4] bg-[var(--text-color)]/10" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-[var(--text-color)]/10 rounded w-3/4" />
      <div className="h-3 bg-[var(--text-color)]/10 rounded w-1/2" />
    </div>
  </div>
);

// List item skeleton
export const ListItemSkeleton = () => (
  <div className="flex gap-3 p-3 bg-[var(--text-color)]/5 rounded-lg animate-pulse">
    <div className="w-16 h-20 md:w-20 md:h-28 bg-[var(--text-color)]/10 rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-4 bg-[var(--text-color)]/10 rounded w-3/4" />
      <div className="h-3 bg-[var(--text-color)]/10 rounded w-1/2" />
      <div className="h-3 bg-[var(--text-color)]/10 rounded w-1/4" />
    </div>
  </div>
);

// Grid skeleton loader
export const GridLoader = ({ count = 6, className = "" }) => {
  const cardCount = isMobile ? Math.min(count, 4) : count;
  
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 ${className}`}>
      {Array.from({ length: cardCount }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
};

// List skeleton loader
export const ListLoader = ({ count = 5 }) => {
  const itemCount = isMobile ? Math.min(count, 3) : count;
  
  return (
    <div className="space-y-3">
      {Array.from({ length: itemCount }).map((_, idx) => (
        <ListItemSkeleton key={idx} />
      ))}
    </div>
  );
};

// Full page centered loader with branding
export const CenteredLoader = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
    <div className="relative">
      <Spinner size={isMobile ? 32 : 40} />
      <div className="absolute inset-0 animate-ping">
        <Spinner size={isMobile ? 32 : 40} className="opacity-30" />
      </div>
    </div>
    <p className="text-sm text-[var(--text-color)]/60 animate-pulse">{text}</p>
  </div>
);

// Details panel loader
export const DetailsPanelLoader = () => (
  <div className="p-4 md:p-6 space-y-4 animate-pulse">
    {/* Title skeleton */}
    <div className="space-y-2">
      <div className="h-6 md:h-8 bg-[var(--text-color)]/10 rounded w-3/4" />
      <div className="h-4 bg-[var(--text-color)]/10 rounded w-1/2" />
    </div>
    
    {/* Badges skeleton */}
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-6 w-16 bg-[var(--text-color)]/10 rounded-full" />
      ))}
    </div>
    
    {/* Stats grid skeleton */}
    <div className="grid grid-cols-4 gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 bg-[var(--text-color)]/10 rounded-lg" />
      ))}
    </div>
    
    {/* Synopsis skeleton */}
    <div className="space-y-2">
      <div className="h-4 bg-[var(--text-color)]/10 rounded w-full" />
      <div className="h-4 bg-[var(--text-color)]/10 rounded w-full" />
      <div className="h-4 bg-[var(--text-color)]/10 rounded w-3/4" />
    </div>
  </div>
);

// Inline loading indicator for buttons/actions
export const InlineLoader = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <Spinner size={14} />
    <span className="text-xs">Loading...</span>
  </div>
);

// Loading more indicator for infinite scroll
export const LoadingMore = () => (
  <div className="flex items-center justify-center py-6 gap-3">
    <Spinner size={20} />
    <span className="text-sm text-[var(--text-color)]/60">Loading more...</span>
  </div>
);

// Skeleton pulse effect wrapper
export const SkeletonPulse = ({ children, className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    {children}
  </div>
);

// Main PageLoader - Default full page skeleton
export default function PageLoader({ variant = "grid", count, text }) {
  switch (variant) {
    case "centered":
      return <CenteredLoader text={text} />;
    case "grid":
      return (
        <div className="p-4 md:p-6">
          <GridLoader count={count || (isMobile ? 4 : 6)} />
        </div>
      );
    case "list":
      return (
        <div className="p-4 md:p-6">
          <ListLoader count={count || (isMobile ? 3 : 5)} />
        </div>
      );
    case "details":
      return <DetailsPanelLoader />;
    case "mini":
      return <MiniLoader text={text} />;
    case "spinner":
      return (
        <div className="flex items-center justify-center p-8">
          <Spinner size={isMobile ? 28 : 36} />
        </div>
      );
    default:
      return (
        <div className="p-4 md:p-6">
          <GridLoader count={count || (isMobile ? 4 : 6)} />
        </div>
      );
  }
}

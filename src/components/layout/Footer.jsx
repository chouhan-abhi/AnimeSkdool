import React from "react";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-[var(--border-color)] bg-[var(--panel-bg)]/70 px-6 py-10 text-sm text-[var(--text-muted)]">
      <div className="mx-auto grid w-full max-w-6xl">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-color)]">AniSkdool</h3>
          <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
            A modern anime hub to stream, schedule, and track your favorite
            series with style.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

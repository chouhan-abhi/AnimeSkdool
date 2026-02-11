import React from "react";
import { Github, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-[var(--border-color)] bg-[var(--panel-bg)]/70 px-6 py-10 text-sm text-[var(--text-muted)]">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-color)]">AniSkdool</h3>
          <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
            A modern anime hub to stream, schedule, and track your favorite
            series with style.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-color)]">
            Navigation
          </h4>
          <ul className="mt-3 space-y-2">
            <li>Popular Anime</li>
            <li>Seasonal Chart</li>
            <li>Manga Library</li>
            <li>Anime Movies</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-color)]">
            Account
          </h4>
          <ul className="mt-3 space-y-2">
            <li>My Profile</li>
            <li>Watchlist</li>
            <li>Settings</li>
            <li>Premium Membership</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-color)]">
            Join The Community
          </h4>
          <div className="mt-3 flex items-center gap-3">
            <button type="button" className="h-9 w-9 rounded-full border border-[var(--border-color)] bg-white/5 text-[var(--text-color)]/80 hover:text-[var(--text-color)] transition">
              <Github size={16} />
            </button>
            <button type="button" className="h-9 w-9 rounded-full border border-[var(--border-color)] bg-white/5 text-[var(--text-color)]/80 hover:text-[var(--text-color)] transition">
              <Twitter size={16} />
            </button>
            <button type="button" className="h-9 w-9 rounded-full border border-[var(--border-color)] bg-white/5 text-[var(--text-color)]/80 hover:text-[var(--text-color)] transition">
              <Youtube size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 flex w-full max-w-6xl items-center justify-between border-t border-[var(--border-color)] pt-6 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
        <span>© 2026 AniSkdool Inc. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Cookies</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

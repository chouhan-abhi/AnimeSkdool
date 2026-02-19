import React from "react";
import { Github, Twitter, Youtube, Play } from "lucide-react";

const SocialLink = ({ children, label }) => (
  <button
    type="button"
    aria-label={label}
    className="flex items-center justify-center h-9 w-9 rounded-xl border border-[var(--border-color)] bg-white/5 text-[var(--text-muted)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)]/30 hover:bg-[var(--primary-color)]/5 transition-all duration-200"
  >
    {children}
  </button>
);

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-[var(--border-color)] bg-[var(--panel-bg)]/50 glass">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-color)] text-white">
                <Play size={16} />
              </span>
              <span className="text-lg font-bold text-[var(--text-color)]">AniSkdool</span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-muted)] max-w-xs">
              Your modern anime companion — discover, track, and schedule your favorite series.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <SocialLink label="GitHub"><Github size={16} /></SocialLink>
              <SocialLink label="Twitter"><Twitter size={16} /></SocialLink>
              <SocialLink label="YouTube"><Youtube size={16} /></SocialLink>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-color)] mb-4">
              Discover
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <li className="hover:text-[var(--text-color)] transition-colors cursor-pointer">Popular Anime</li>
              <li className="hover:text-[var(--text-color)] transition-colors cursor-pointer">Seasonal Chart</li>
              <li className="hover:text-[var(--text-color)] transition-colors cursor-pointer">Top Ranked</li>
              <li className="hover:text-[var(--text-color)] transition-colors cursor-pointer">Upcoming</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-color)] mb-4">
              Account
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <li className="hover:text-[var(--text-color)] transition-colors cursor-pointer">My Watchlist</li>
              <li className="hover:text-[var(--text-color)] transition-colors cursor-pointer">Favorites</li>
              <li className="hover:text-[var(--text-color)] transition-colors cursor-pointer">Settings</li>
              <li className="hover:text-[var(--text-color)] transition-colors cursor-pointer">Calendar</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-color)] mb-4">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <li className="hover:text-[var(--text-color)] transition-colors cursor-pointer">Help Center</li>
              <li className="hover:text-[var(--text-color)] transition-colors cursor-pointer">Report a Bug</li>
              <li className="hover:text-[var(--text-color)] transition-colors cursor-pointer">Feedback</li>
              <li className="hover:text-[var(--text-color)] transition-colors cursor-pointer">API Status</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--border-color)] pt-8 text-xs text-[var(--text-muted)]">
          <span>&copy; 2026 AniSkdool. Powered by Jikan API.</span>
          <div className="flex items-center gap-6">
            <span className="hover:text-[var(--text-color)] transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-[var(--text-color)] transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-[var(--text-color)] transition-colors cursor-pointer">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

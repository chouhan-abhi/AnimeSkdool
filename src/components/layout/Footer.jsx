import React from "react";
import { Play } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-black/40 backdrop-blur-xl px-6 lg:px-12 py-12 text-sm text-[var(--text-muted)]">
      <div className="mx-auto max-w-[1800px] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white border border-white/15">
            <Play size={12} className="fill-white translate-x-0.5" />
          </span>
          <span className="font-semibold text-white tracking-tight">AnimeSkdool</span>
          <span className="text-xs text-[var(--text-dim)]">· Cinematic Anime Experience</span>
        </div>

        <p className="text-xs text-[var(--text-dim)] text-center md:text-right">
          Data powered by Jikan & MyAnimeList. Curated for the finest anime streaming experience.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useEffect, useState } from "react";
import {
  RotateCcw,
  Palette,
  Type,
  Calendar,
  Sparkles,
  Sliders,
  Check,
  Play,
  Star,
  Tv,
} from "lucide-react";
import storageManager from "../utils/storageManager";
import SectionHeader from "./ui/SectionHeader";
import { useToast } from "../utils/toast";

const THEMES = [
  { key: "theme-dark", label: "Apple OLED Dark", desc: "Pure deep blacks & frosted glass" },
  { key: "theme-midnight", label: "Apple Midnight", desc: "Deep indigo & cinematic mood" },
  { key: "theme-saint", label: "Apple Graphite", desc: "Space grey & slate metallic" },
  { key: "theme-light", label: "Apple Frost Light", desc: "Clean macOS translucent white" },
];

const FONTS = [
  { key: "font-basic", label: "Inter / SF Pro", desc: "Apple standard clean sans-serif" },
  { key: "font-modern", label: "Jakarta Display", desc: "Geometric contemporary typography" },
  { key: "font-techy", label: "Orbitron Tech", desc: "Futuristic digital interface" },
  { key: "font-cute", label: "Rajdhani Sharp", desc: "Condensed dynamic anime font" },
];

const ACCENTS = [
  { key: "primary-blue", color: "#0071e3", label: "Apple Blue" },
  { key: "primary-purple", color: "#af52de", label: "Electric Purple" },
  { key: "primary-red", color: "#ff375f", label: "Apple Crimson" },
  { key: "primary-green", color: "#30d158", label: "Neon Emerald" },
  { key: "primary-orange", color: "#ff9f0a", label: "Amber Glow" },
  { key: "primary-pink", color: "#ff2d55", label: "Cyber Pink" },
  { key: "primary-cyan", color: "#5ac8fa", label: "Ice Cyan" },
  { key: "primary-yellow", color: "#ffd60a", label: "Solar Gold" },
];

const SettingsPage = () => {
  const { showToast } = useToast();

  const [theme, setTheme] = useState(() => {
    const saved = storageManager.getSettings();
    return saved?.theme || "theme-dark";
  });

  const [font, setFont] = useState(() => {
    const saved = storageManager.getSettings();
    return saved?.font || "font-basic";
  });

  const [primaryColor, setPrimaryColor] = useState(() => {
    const saved = storageManager.getSettings();
    return saved?.primaryColor || "primary-blue";
  });

  const [calendarView, setCalendarView] = useState(() => {
    const saved = storageManager.getSettings();
    return saved?.calendarView || "week";
  });

  // Apply theme, font, accent to document
  useEffect(() => {
    document.documentElement.classList.remove(
      "theme-light",
      "theme-dark",
      "theme-saint",
      "theme-hub",
      "theme-midnight"
    );
    document.documentElement.classList.add(theme);

    document.documentElement.classList.remove(
      "font-basic",
      "font-modern",
      "font-techy",
      "font-cute",
      "font-retro"
    );
    document.documentElement.classList.add(font);

    document.documentElement.classList.remove(
      "primary-blue",
      "primary-purple",
      "primary-red",
      "primary-green",
      "primary-orange",
      "primary-pink",
      "primary-cyan",
      "primary-yellow"
    );
    document.documentElement.classList.add(primaryColor);

    storageManager.saveSettings({ theme, font, calendarView, primaryColor });
  }, [theme, font, calendarView, primaryColor]);

  const handleReset = () => {
    setTheme("theme-dark");
    setFont("font-basic");
    setPrimaryColor("primary-blue");
    setCalendarView("week");
    showToast?.("Settings reset to Apple TV defaults", "info");
  };

  return (
    <div className="min-h-screen text-white px-6 sm:px-10 md:px-14 lg:px-18 max-w-[1800px] mx-auto pb-28">
      {/* Header */}
      <div className="pt-8 pb-6 flex items-center justify-between">
        <SectionHeader
          title="tvOS Settings"
          subtitle="Customize visual presentation, themes, typography, and display preferences"
          badge="Preferences"
        />

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/15 border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all backdrop-blur-xl"
        >
          <RotateCcw size={13} />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
        {/* Settings Group Controls */}
        <div className="space-y-6">
          {/* Theme Selection */}
          <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Palette size={16} className="text-[var(--primary-color)]" />
              <h3 className="text-base font-bold text-white">Display Theme</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEMES.map((t) => {
                const active = theme === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTheme(t.key)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                      active
                        ? "bg-white/15 border-white/40 shadow-lg scale-[1.02]"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{t.label}</p>
                      <p className="text-xs text-white/50 mt-0.5">{t.desc}</p>
                    </div>
                    {active && (
                      <span className="p-1 rounded-full bg-white text-black">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color Selection */}
          <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-[var(--primary-color)]" />
              <h3 className="text-base font-bold text-white">Apple Accent Tint</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACCENTS.map((c) => {
                const active = primaryColor === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setPrimaryColor(c.key)}
                    className={`p-3 rounded-2xl border flex items-center gap-3 transition-all duration-200 ${
                      active
                        ? "bg-white/15 border-white/40 scale-[1.03]"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07]"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full shadow-sm flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-xs font-semibold text-white truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography Selection */}
          <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Type size={16} className="text-[var(--primary-color)]" />
              <h3 className="text-base font-bold text-white">Typography Style</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FONTS.map((f) => {
                const active = font === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFont(f.key)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                      active
                        ? "bg-white/15 border-white/40 shadow-lg scale-[1.02]"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07]"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{f.label}</p>
                      <p className="text-xs text-white/50 mt-0.5">{f.desc}</p>
                    </div>
                    {active && (
                      <span className="p-1 rounded-full bg-white text-black">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar Display Mode */}
          <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} className="text-[var(--primary-color)]" />
              <h3 className="text-base font-bold text-white">Default Schedule Layout</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "week", label: "Full Week Grid", desc: "All 7 days simultaneously" },
                { key: "day", label: "Daily Carousel", desc: "Focused single day view" },
              ].map((v) => {
                const active = calendarView === v.key;
                return (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setCalendarView(v.key)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                      active
                        ? "bg-white/15 border-white/40 shadow-lg scale-[1.02]"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07]"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{v.label}</p>
                      <p className="text-xs text-white/50 mt-0.5">{v.desc}</p>
                    </div>
                    {active && (
                      <span className="p-1 rounded-full bg-white text-black">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Apple TV UI Specimen Preview */}
        <aside className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/10 backdrop-blur-2xl space-y-6 sticky top-24">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-white/50 mb-1">
                Live Specimen
              </p>
              <h3 className="text-lg font-bold text-white">Apple TV Interface Preview</h3>
            </div>

            {/* Specimen Hero Mini Card */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#14141d] border border-white/10 p-5 flex flex-col justify-end">
              <div className="specular-highlight opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold text-white uppercase">
                    4K HDR
                  </span>
                  <span className="text-xs text-yellow-400 font-bold flex items-center gap-0.5">
                    <Star size={10} fill="currentColor" /> 9.2
                  </span>
                </div>
                <h4 className="text-lg font-black text-white leading-tight">
                  Demon Slayer: Swordsmith
                </h4>
                <div className="flex items-center gap-2 pt-1">
                  <button className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <Play size={12} fill="black" />
                    <span>Play</span>
                  </button>
                  <button className="px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
                    + Up Next
                  </button>
                </div>
              </div>
            </div>

            {/* Specimen Badges & Buttons */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-white/60">Component Styling</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/30 text-xs font-semibold">
                  Airing Radar
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium border border-white/10">
                  Episode 12
                </span>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-semibold border border-green-500/30">
                  Active
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SettingsPage;

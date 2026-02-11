import { useEffect, useState } from "react";
import NoAnimeFound from "../helperComponent/NoAnimeFound";
import storageManager from "../utils/storageManager";

// Dummy data for preview
const dummySchedule = [
  {
    mal_id: 1,
    title: "One Piece",
    score: 8.8,
    type: "TV",
    episodes: "1000+",
    status: "Airing",
    images: { jpg: { image_url: "https://via.placeholder.com/80x100" } },
    broadcast: { day: "Sunday", time: "09:30" },
  },
  {
    mal_id: 2,
    title: "Attack on Titan",
    score: 9.2,
    type: "TV",
    episodes: 75,
    status: "Finished",
    images: { jpg: { image_url: "https://via.placeholder.com/80x100" } },
    broadcast: { day: "Monday", time: "22:00" },
  },
];

// ---------------------- Preview Components ----------------------

const PreviewWeekCalendar = ({ schedule }) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className="grid grid-cols-7 gap-2 text-xs">
      {days.map((day) => (
        <div
          key={day}
          className="flex flex-col items-center p-2 rounded-lg bg-white/10"
        >
          <span className="font-semibold">{day}</span>
          <div className="mt-1 text-center">
            {schedule.find(
              (anime) =>
                anime.broadcast?.day
                  ?.toLowerCase()
                  .startsWith(day.toLowerCase())
            )?.title || "—"}
          </div>
        </div>
      ))}
    </div>
  );
};

const PreviewDayCalendar = ({ schedule }) => {
  const today = new Date().getDay();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDayAnime = schedule.filter(
    (anime) =>
      anime.broadcast?.day?.toLowerCase() === days[today].toLowerCase()
  );

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">{days[today]}</h3>
      {currentDayAnime.length > 0 ? (
        currentDayAnime.map((anime) => (
          <div key={anime.mal_id} className="p-2 border rounded">
            {anime.title}
          </div>
        ))
      ) : (
        <NoAnimeFound message="Live Preview" />
      )}
    </div>
  );
};

// ---------------------- Settings Page ----------------------

const SettingsPage = () => {
  // Theme + Font - using storageManager
  const [theme, setTheme] = useState(() => {
    const saved = storageManager.getSettings();
    return saved?.theme || "theme-light";
  });

  const [font, setFont] = useState(() => {
    const saved = storageManager.getSettings();
    return saved?.font || "font-basic";
  });

  const [primaryColor, setPrimaryColor] = useState(() => {
    const saved = storageManager.getSettings();
    return saved?.primaryColor || "primary-red";
  });

  // Calendar View
  const [calendarView, setCalendarView] = useState(() => {
    const saved = storageManager.getSettings();
    return saved?.calendarView || "week";
  });

  // Persist + apply theme/font/primaryColor
  useEffect(() => {
    document.documentElement.classList.remove(
      "theme-light",
      "theme-dark",
      "theme-saint",
      "theme-hub"
    );
    document.documentElement.classList.add(theme);

    document.documentElement.classList.remove(
      "font-basic",
      "font-funky",
      "font-techy",
      "font-cute",
      "font-retro"
    );
    document.documentElement.classList.add(font);

    document.documentElement.classList.remove(
      "primary-red",
      "primary-blue",
      "primary-green",
      "primary-purple",
      "primary-orange",
      "primary-pink",
      "primary-cyan",
      "primary-yellow"
    );
    document.documentElement.classList.add(primaryColor);

    // Use storageManager to save settings
    storageManager.saveSettings({ theme, font, calendarView, primaryColor });
  }, [theme, font, calendarView, primaryColor]);

  const resetSettings = () => {
    setTheme("theme-hub");
    setFont("font-basic");
    setPrimaryColor("primary-purple");
    setCalendarView("week");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 border-b border-[var(--border-color)] sticky top-0 z-50 flex justify-between items-center bg-[var(--panel-bg)]/80 backdrop-blur">
        <h1 className="text-2xl font-bold text-[var(--primary-color)] tracking-wide">
          Settings
        </h1>
        <button
          onClick={resetSettings}
          className="px-4 py-2 text-sm rounded-full bg-[var(--primary-color)] text-white shadow-[0_0_20px_var(--glow-color)] hover:opacity-90 transition"
        >
          Reset
        </button>
      </header>

      {/* Main Layout */}
      <main className="flex flex-col lg:flex-row flex-grow p-6 gap-6 pb-24">
        {/* Controls */}
        <section className="lg:w-1/3 flex flex-col gap-6">
          {/* Theme Selector */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)]/70 p-4 shadow-[0_10px_40px_-30px_var(--shadow-color)]">
            <h2 className="text-lg font-semibold mb-3">Theme</h2>
            <div className="flex gap-2 flex-wrap">
              {["hub", "dark", "light", "saint"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(`theme-${t}`)}
                  className={`px-3 py-1.5 border rounded-full text-sm transition ${
                    theme === `theme-${t}`
                      ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-[0_0_18px_var(--glow-color)]"
                      : "hover:bg-white/5 border-[var(--border-color)]"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Font Selector */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)]/70 p-4 shadow-[0_10px_40px_-30px_var(--shadow-color)]">
            <h2 className="text-lg font-semibold mb-3">Font</h2>
            <div className="flex gap-2 flex-wrap">
              {["basic", "funky", "techy", "cute", "retro"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFont(`font-${f}`)}
                  className={`px-3 py-1.5 border rounded-full text-sm transition ${
                    font === `font-${f}`
                      ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-[0_0_18px_var(--glow-color)]"
                      : "hover:bg-white/5 border-[var(--border-color)]"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Color Selector */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)]/70 p-4 shadow-[0_10px_40px_-30px_var(--shadow-color)]">
            <h2 className="text-lg font-semibold mb-3">Primary Color</h2>
            <div className="flex gap-2 flex-wrap">
              {[
                "red",
                "blue",
                "green",
                "purple",
                "orange",
                "pink",
                "cyan",
                "yellow",
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => setPrimaryColor(`primary-${c}`)}
                  className={`w-9 h-9 rounded-full border-2 transition ${
                    primaryColor === `primary-${c}`
                      ? "border-[var(--text-color)] scale-110 shadow-[0_0_12px_var(--glow-color)]"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: `var(--primary-${c})` }}
                />
              ))}
            </div>
          </div>

          {/* Calendar View Selector */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)]/70 p-4 shadow-[0_10px_40px_-30px_var(--shadow-color)]">
            <h2 className="text-lg font-semibold mb-3">Calendar View</h2>
            <div className="flex gap-2 flex-wrap">
              {["week", "day"].map((view) => (
                <button
                  key={view}
                  onClick={() => setCalendarView(view)}
                  className={`px-3 py-1.5 border rounded-full text-sm transition ${
                    calendarView === view
                      ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-[0_0_18px_var(--glow-color)]"
                      : "hover:bg-white/5 border-[var(--border-color)]"
                  }`}
                >
                  {view === "week" ? "Week View" : "Day View"}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Live Preview */}
        <section
          className="flex-1 rounded-3xl border border-[var(--border-color)] bg-[var(--surface-2)]/70 p-6 shadow-[0_18px_60px_-40px_var(--shadow-color)] transition-all space-y-4"
        >
          <h3 className="font-semibold text-xl text-[var(--primary-color)]">
            AniSkdool Preview
          </h3>
          <div className="p-3 border border-[var(--border-color)] rounded-2xl flex items-center justify-between bg-[var(--surface-1)]/70">
            <p className="flex items-center gap-2 justify-center">
              Episode 1:{" "}
              <span className="text-[var(--primary-color)]">The Beginning</span>
            </p>
            <p className="text-xs text-[var(--text-muted)]">Aired: 01/01/2024 | ⭐ 8.5</p>
          </div>

          {/* Demo Primary Button */}
          <button className="px-5 text-sm py-2.5 rounded-full font-medium shadow-[0_0_20px_var(--glow-color)] transition bg-[var(--primary-color)] text-white hover:opacity-90">
            Demo Primary Button
          </button>
          {calendarView === "week" ? (
            <PreviewWeekCalendar schedule={dummySchedule} />
          ) : (
            <PreviewDayCalendar schedule={dummySchedule} />
          )}
        </section>
      </main>

    </div>
  );
};

export default SettingsPage;

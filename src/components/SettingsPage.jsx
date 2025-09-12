import { useEffect, useState } from "react";
import NoAnimeFound from "../helperComponent/NoAnimeFound";

const SETTINGS_KEY = "appSettings";

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
          className="flex flex-col items-center p-2 rounded-lg bg-[var(--secondary-color)]"
        >
          <span className="font-semibold">{day}</span>
          <div className="mt-1 text-center">
            {schedule.find(
              (anime) => anime.broadcast?.day?.toLowerCase().startsWith(day.toLowerCase())
            )?.title || "—"}
          </div>
        </div>
      ))}
    </div>
  );
};

const PreviewDayCalendar = ({ schedule }) => {
  const today = new Date().getDay();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayAnime = schedule.filter(
    (anime) =>
      anime.broadcast?.day?.toLowerCase() === days[today].toLowerCase()
  );

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">{days[today]}</h3>
      <NoAnimeFound message="Live Preview" />
    </div>
  );
};

// ---------------------- Settings Page ----------------------

const SettingsPage = () => {
  // Theme + Font
  const [theme, setTheme] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      return saved?.theme || "theme-light";
    } catch {
      return "theme-light";
    }
  });

  const [font, setFont] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      return saved?.font || "font-basic";
    } catch {
      return "font-basic";
    }
  });

  const [primaryColor, setPrimaryColor] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      return saved?.primaryColor || "primary-red";
    } catch {
      return "primary-red";
    }
  });

  // Calendar View
  const [calendarView, setCalendarView] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      return saved?.calendarView || "week";
    } catch {
      return "week";
    }
  });

  // Persist + apply theme/font/primaryColor
  useEffect(() => {
    document.documentElement.classList.remove("theme-light", "theme-dark", "theme-saint");
    document.documentElement.classList.add(theme);

    document.documentElement.classList.remove(
      "font-basic", "font-funky", "font-techy", "font-cute", "font-retro"
    );
    document.documentElement.classList.add(font);

    document.documentElement.classList.remove(
      "primary-red", "primary-blue", "primary-green", "primary-purple",
      "primary-orange", "primary-pink", "primary-cyan", "primary-yellow"
    );
    document.documentElement.classList.add(primaryColor);

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ theme, font, calendarView, primaryColor })
    );
  }, [theme, font, calendarView, primaryColor]);

  const resetSettings = () => {
    setTheme("theme-light");
    setFont("font-basic");
    setPrimaryColor("primary-red");
    setCalendarView("week");
  };

  return (
    <div className="h-full bg-[var(--bg-color)] text-[var(--text-color)] flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-gray-800 sticky top-0 z-50 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--primary-color)]">Settings</h1>
        <button
          onClick={resetSettings}
          className="px-3 py-1 text-sm rounded bg-[var(--primary-color)] hover:opacity-90 transition"
        >
          Reset
        </button>
      </header>

      {/* Main Layout */}
      <main className="flex flex-col md:flex-row flex-grow p-4 gap-6">
        {/* Controls */}
        <section className="md:w-1/3 flex flex-col gap-6">
          {/* Theme Selector */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Theme</h2>
            <div className="flex gap-2 flex-wrap">
              {["light", "dark", "saint"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(`theme-${t}`)}
                  className={`px-3 py-1 border rounded transition ${theme === `theme-${t}`
                      ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
                      : "hover:bg-gray-800 border-gray-600"
                    }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Font Selector */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Font</h2>
            <div className="flex gap-2 flex-wrap">
              {["basic", "funky", "techy", "cute", "retro"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFont(`font-${f}`)}
                  className={`px-3 py-1 border rounded transition ${font === `font-${f}`
                      ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
                      : "hover:bg-gray-800 border-gray-600"
                    }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Color Selector */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Primary Color</h2>
            <div className="flex gap-2 flex-wrap">
              {[
                "red", "blue", "green", "purple",
                "orange", "pink", "cyan", "yellow"
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => setPrimaryColor(`primary-${c}`)}
                  className={`w-8 h-8 rounded-full border-2 transition ${
                    primaryColor === `primary-${c}`
                      ? "border-[var(--text-color)] scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: `var(--primary-${c})` }}
                />
              ))}
            </div>
          </div>

          {/* Calendar View Selector */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Calendar View</h2>
            <div className="flex gap-2 flex-wrap">
              {["week", "day"].map((view) => (
                <button
                  key={view}
                  onClick={() => setCalendarView(view)}
                  className={`px-3 py-1 border rounded transition ${calendarView === view
                      ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
                      : "hover:bg-gray-800 border-gray-600"
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
          className="flex-1 rounded-xl border border-gray-700 p-6 shadow-lg transition-all space-y-4"
          style={{ background: "var(--bg-color)", color: "var(--text-color)" }}
        >
          <h3 className="font-semibold text-xl text-[var(--primary-color)]">AniSkdool Preview</h3>
          <div className="p-2 border border-gray-700 rounded-lg flex items-center justify-between">
            <p className="flex items-center gap-2 justify-center">
              Episode 1:{" "}
              <span className="text-[var(--primary-color)]">The Beginning</span>
            </p>
            <p className="text-xs text-gray-400">Aired: 01/01/2024 | ⭐ 8.5</p>
          </div>

          {/* Demo Primary Button */}
          <button className="px-4 text-sm py-2 rounded font-medium shadow-md transition bg-[var(--primary-color)] text-white hover:opacity-90">
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

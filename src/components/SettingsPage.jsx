import { useEffect, useState } from "react";

const SettingsPage = () => {
  const [theme, setTheme] = useState("theme-light");
  const [font, setFont] = useState("font-basic");

  useEffect(() => {
    // Remove old theme classes
    document.documentElement.classList.remove("theme-light", "theme-dark", "theme-saint");
    document.documentElement.classList.add(theme);

    // Remove old font classes
    document.documentElement.classList.remove("font-basic", "font-funky", "font-techy", "font-cute", "font-retro");
    document.documentElement.classList.add(font);
  }, [theme, font]);

  const resetSettings = () => {
    setTheme("theme-light");
    setFont("font-basic");
  };

  return (
    <div className="h-full bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-50 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-400">⚙️ Settings</h1>
        <button
          onClick={resetSettings}
          className="px-3 py-1 text-sm rounded bg-indigo-600 hover:bg-indigo-500 transition"
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
                  className={`px-3 py-1 border rounded transition ${
                    theme === `theme-${t}`
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
                  className={`px-3 py-1 border rounded transition ${
                    font === `font-${f}`
                      ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
                      : "hover:bg-gray-800 border-gray-600"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Live Preview */}
        <section
          className="flex-1 h-88 rounded-xl border border-gray-700 p-6 shadow-lg transition-all"
          style={{ background: "var(--bg-color)", color: "var(--text-color)" }}
        >
          <h2 className="text-lg font-bold mb-4">Live Preview</h2>
          <div className="p-4 rounded-lg border border-gray-600 bg-black/20 space-y-4">
            <div>
              <h3 className="font-semibold text-xl">AniSkdool Preview</h3>
              <p className="mt-2 text-sm">
                Episode 1:{" "}
                <span className="text-[var(--primary-color)]">The Beginning</span>
              </p>
              <p className="text-xs text-gray-400">Aired: 01/01/2024 | ⭐ 8.5</p>
            </div>

            {/* Demo Primary Button */}
            <button className="px-4 py-2 rounded font-medium shadow-md transition bg-[var(--primary-color)] text-white hover:opacity-90">
              Demo Primary Button
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;

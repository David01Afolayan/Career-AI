"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({
  onThemeChange,
}: {
  onThemeChange: (light: boolean) => void;
}) {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("careerai-theme");
    const isLight = savedTheme === "light";
    setLight(isLight);
    onThemeChange(isLight);
  }, [onThemeChange]);

  function toggleTheme() {
    const nextLight = !light;
    setLight(nextLight);
    window.localStorage.setItem("careerai-theme", nextLight ? "light" : "dark");
    onThemeChange(nextLight);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      title={light ? "Switch to dark theme" : "Switch to light theme"}
      className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-cyan-400 hover:text-white"
    >
      {light ? "☾" : "☀"}
    </button>
  );
}

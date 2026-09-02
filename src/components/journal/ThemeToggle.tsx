import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const KEY = "ty-theme";

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY) as Theme | null;
    const initial: Theme =
      stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    apply(initial);
    setReady(true);
  }, []);

  function set(next: Theme) {
    setTheme(next);
    apply(next);
    localStorage.setItem(KEY, next);
  }

  const dark = ready && theme === "dark";

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-paper">
      <button
        type="button"
        onClick={() => set("light")}
        aria-label="Daylight mode"
        aria-pressed={!dark}
        className={`flex size-8 items-center justify-center rounded-full transition-colors duration-300 ${
          dark ? "text-ink-soft hover:text-ink" : "bg-secondary text-ink"
        }`}
      >
        <svg className="size-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => set("dark")}
        aria-label="Night mode"
        aria-pressed={dark}
        className={`flex size-8 items-center justify-center rounded-full transition-colors duration-300 ${
          dark ? "bg-secondary text-ink" : "text-ink-soft hover:text-ink"
        }`}
      >
        <svg className="size-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </button>
    </div>
  );
}

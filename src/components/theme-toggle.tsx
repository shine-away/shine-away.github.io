"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True only after hydration. Uses useSyncExternalStore rather than an effect so
 * the server snapshot stays false without calling setState during render.
 */
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      aria-pressed={mounted ? isDark : undefined}
      className="rounded-md p-2 text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {/* Decorative: the accessible name comes from aria-label. */}
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
    </button>
  );
}

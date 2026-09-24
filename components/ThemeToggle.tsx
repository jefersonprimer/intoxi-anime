"use client";

import { Moon, Sun } from "lucide-react";
import { useCallback, useLayoutEffect, useSyncExternalStore } from "react";

export const THEME_EVENT = "intoxi-theme-change";
export const THEME_STORAGE_KEY = "theme";

export function getTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function subscribeTheme(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

export function setTheme(theme: "dark" | "light") {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage indisponivel (modo privado etc.)
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function useTheme() {
  return useSyncExternalStore(subscribeTheme, getTheme, () => "dark");
}

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const theme = useTheme();

  useLayoutEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // localStorage indisponivel
    }
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    }
  }, []);

  const isDark = theme === "dark";
  const toggle = useCallback(
    () => setTheme(isDark ? "light" : "dark"),
    [isDark],
  );

  const label = isDark ? "Tema claro" : "Tema escuro";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={isDark ? "Tema claro" : "Tema escuro"}
      className={
        showLabel
          ? "flex w-full items-center gap-2 rounded-md justify-between px-3 py-2 text-left text-sm font-semibold text-header-fg transition hover:bg-header-border"
          : "inline-flex h-10 w-10 items-center justify-center rounded-full text-header-muted transition hover:text-header-fg"
      }
    >
      {showLabel ? <span>{label}</span> : null}
      {isDark ? (
        <Sun size={24} aria-hidden="true" />
      ) : (
        <Moon size={24} aria-hidden="true" />
      )}
    </button>
  );
}

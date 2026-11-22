"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Settings and bookmarks live only on this phone (localStorage). No accounts.
export type Theme = "system" | "light" | "dark";
export type Settings = {
  textSize: number; // 0..4
  theme: Theme;
  showTamil: boolean;
  showTranslit: boolean;
  showCommentary: boolean;
};
export type Bookmark = { book: string; id: string; ref: string; text: string; at: number };

const SETTINGS_KEY = "pocket_settings_v1";
const BOOKMARKS_KEY = "pocket_bookmarks_v1";
export const TEXT_SIZES = [0.95, 1.05, 1.125, 1.3, 1.5]; // rem
export const DEFAULT_SETTINGS: Settings = {
  textSize: 2,
  theme: "system",
  showTamil: false,
  showTranslit: false,
  showCommentary: true,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or full storage: settings simply do not persist */
  }
}

type Ctx = {
  settings: Settings;
  set: (patch: Partial<Settings>) => void;
  bookmarks: Bookmark[];
  isBookmarked: (book: string, id: string) => boolean;
  toggleBookmark: (b: Omit<Bookmark, "at">) => void;
  removeBookmark: (book: string, id: string) => void;
  ready: boolean;
};

const PrefsContext = createContext<Ctx | null>(null);

export function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#14141a" : "#faf6ec");
}

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSettings(read(SETTINGS_KEY, DEFAULT_SETTINGS));
    setBookmarks(readList<Bookmark>(BOOKMARKS_KEY));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    write(SETTINGS_KEY, settings);
    document.documentElement.style.setProperty("--reading-size", `${TEXT_SIZES[settings.textSize] ?? 1.125}rem`);
    applyTheme(settings.theme);
    if (settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => applyTheme("system");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [settings, ready]);

  const set = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), []);

  const saveBookmarks = useCallback((next: Bookmark[]) => {
    setBookmarks(next);
    write(BOOKMARKS_KEY, next);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      settings,
      set,
      bookmarks,
      ready,
      isBookmarked: (book, id) => bookmarks.some((b) => b.book === book && b.id === id),
      toggleBookmark: (b) => {
        const exists = bookmarks.some((x) => x.book === b.book && x.id === b.id);
        saveBookmarks(exists ? bookmarks.filter((x) => !(x.book === b.book && x.id === b.id)) : [{ ...b, at: Date.now() }, ...bookmarks]);
      },
      removeBookmark: (book, id) => saveBookmarks(bookmarks.filter((x) => !(x.book === book && x.id === id))),
    }),
    [settings, set, bookmarks, ready, saveBookmarks],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs outside PrefsProvider");
  return ctx;
}

/** Runs before React, so the page never flashes light in dark mode or at the wrong text size. */
export const noFlashScript = `(function(){try{var s=JSON.parse(localStorage.getItem('${SETTINGS_KEY}')||'{}');var t=s.theme||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');var z=[${TEXT_SIZES.join(",")}][s.textSize==null?2:s.textSize];if(z)document.documentElement.style.setProperty('--reading-size',z+'rem');}catch(e){}})();`;

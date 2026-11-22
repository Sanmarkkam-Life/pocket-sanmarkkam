"use client";

import { usePrefs } from "@/lib/prefs";

/** The three switches: Tamil, Transliteration, Commentary. The translation is always shown. */
export default function LayerToggles({ compact = false }: { compact?: boolean }) {
  const { settings, set } = usePrefs();
  const items = [
    { key: "showTamil", label: "Tamil", tamil: "தமிழ்" },
    { key: "showTranslit", label: compact ? "Translit." : "Transliteration" },
    { key: "showCommentary", label: "Commentary" },
  ] as const;
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="What to show">
      {items.map((it) => {
        const on = settings[it.key];
        return (
          <button
            key={it.key}
            onClick={() => set({ [it.key]: !on })}
            aria-pressed={on}
            className={`chip ${compact ? "px-2.5 text-xs" : ""} ${on ? "border-gold bg-gold text-white dark:text-[#1c160c]" : "border-line bg-card text-muted"}`}
          >
            {on ? "✓ " : ""}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

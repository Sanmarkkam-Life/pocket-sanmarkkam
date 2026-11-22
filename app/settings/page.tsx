"use client";

import { useState } from "react";
import Header from "@/components/Header";
import LayerToggles from "@/components/LayerToggles";
import { bookUrl, catalog, catalogGenerated } from "@/lib/data";
import { FEEDBACK_URL } from "@/lib/links";
import { TEXT_SIZES, type Theme, usePrefs } from "@/lib/prefs";

export default function Settings() {
  const { settings, set } = usePrefs();
  const [save, setSave] = useState<{ done: number; state: "idle" | "saving" | "done" | "failed" }>({ done: 0, state: "idle" });

  // Fetch every book (and search) once; the service worker keeps them, so they read offline.
  const saveAll = async () => {
    setSave({ done: 0, state: "saving" });
    const files = [...catalog.map((b) => bookUrl(b.id)), "/data/search.json", "/data/daily.json"];
    let done = 0;
    try {
      for (const f of files) {
        const r = await fetch(f, { cache: "reload" });
        if (!r.ok) throw new Error(f);
        await r.arrayBuffer();
        done++;
        setSave({ done, state: "saving" });
      }
      setSave({ done, state: "done" });
    } catch {
      setSave({ done, state: "failed" });
    }
  };

  const themes: { v: Theme; label: string }[] = [
    { v: "system", label: "Like my phone" },
    { v: "light", label: "Light" },
    { v: "dark", label: "Dark" },
  ];

  return (
    <>
      <Header title="Settings" back={true} />
      <main className="mx-auto max-w-2xl space-y-4 px-4 pb-8 pt-4">
        <section className="card p-5">
          <h2 className="font-extrabold">Text size</h2>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm">A</span>
            <input type="range" min={0} max={TEXT_SIZES.length - 1} step={1} value={settings.textSize} onChange={(e) => set({ textSize: Number(e.target.value) })} className="flex-1 accent-[rgb(var(--gold))]" aria-label="Text size" />
            <span className="text-2xl">A</span>
          </div>
          <p className="reading mt-3 font-read">Compassion for every living being is the key to the Grace-Light.</p>
        </section>

        <section className="card p-5">
          <h2 className="font-extrabold">Appearance</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {themes.map((t) => (
              <button key={t.v} onClick={() => set({ theme: t.v })} aria-pressed={settings.theme === t.v} className={`chip ${settings.theme === t.v ? "border-gold bg-gold text-white dark:text-[#1c160c]" : "border-line bg-card text-muted"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-extrabold">What the reader shows</h2>
          <p className="mb-3 mt-1 text-sm text-muted">The translation is always shown. Switch the other layers on or off; the reader remembers.</p>
          <LayerToggles />
        </section>

        <section className="card p-5">
          <h2 className="font-extrabold">Read offline</h2>
          <p className="mt-1 text-sm text-muted">Each book is saved on your phone when you first open it. To save all {catalog.length} books and search at once (a few megabytes, best on Wi-Fi):</p>
          <button onClick={saveAll} disabled={save.state === "saving"} className="btn-gold mt-3">
            {save.state === "saving" ? `Saving… ${save.done}/${catalog.length + 2}` : save.state === "done" ? "✓ All saved" : "Save all books"}
          </button>
          {save.state === "failed" && <p className="mt-2 text-sm text-muted">Stopped: check the internet connection and try again.</p>}
          <p className="mt-3 text-xs text-muted">Offline reading works in the installed app (Add to Home Screen) and in the browser after the first visit.</p>
        </section>

        <section className="card p-5">
          <h2 className="font-extrabold">💬 Feedback</h2>
          <p className="mt-1 text-sm text-muted">
            Tell us what helped you, what was hard, or a mistake you found in a book. Every answer is read by the team. Four short questions, all optional.
          </p>
          <a href={FEEDBACK_URL} target="_blank" rel="noopener" className="btn-gold mt-3 no-underline">
            Share an idea or report a mistake
          </a>
        </section>

        <section className="card p-5 text-sm text-muted">
          <h2 className="mb-1 font-extrabold text-ink">About Pocket Sanmarkkam</h2>
          <p>
            Vallalar&apos;s writings as published by Sanmarkkam Life: the Tamil of Ramalinga Adigal (public domain), with transliteration,
            translation and commentary under CC BY 4.0. Only approved editions appear here.
          </p>
          <p className="mt-2">No account, no tracking. Your settings and bookmarks stay on this phone.</p>
          <p className="mt-2">
            Found a mistake, or have an idea?{" "}
            <a href={FEEDBACK_URL} target="_blank" rel="noopener">
              Tell the team
            </a>
            , with the book and verse number if you can.
          </p>
          <p className="mt-2">Books exported {catalogGenerated} · app version 0.1 (preview)</p>
        </section>
      </main>
    </>
  );
}

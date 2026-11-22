"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { catalog, loadDaily, passageHref, verseOfTheDay } from "@/lib/data";
import { usePrefs } from "@/lib/prefs";
import { shareText } from "@/lib/share";
import { type LastRead, lastReadHref, loadLastRead } from "@/lib/lastRead";
import { FEEDBACK_URL } from "@/lib/links";
import JourneyCard from "@/components/JourneyCard";
import type { DailyVerse } from "@/lib/types";

export default function Home() {
  const { settings, bookmarks } = usePrefs();
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [failed, setFailed] = useState(false);
  const [toast, setToast] = useState("");
  const [last, setLast] = useState<LastRead | null>(null);

  useEffect(() => {
    setLast(loadLastRead());
    loadDaily().then((pool) => setVerse(verseOfTheDay(pool))).catch(() => setFailed(true));
  }, []);

  const share = async () => {
    if (!verse) return;
    const r = await shareText("Verse of the day", `“${verse.translation}”\n— Vallalar (Ramalinga Adigal), ${verse.ref}`, `${window.location.origin}${passageHref(verse.book, verse.id)}`);
    if (r === "copied") {
      setToast("Copied to share");
      setTimeout(() => setToast(""), 1800);
    }
  };

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <main className="mx-auto max-w-2xl px-4" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="flex items-center gap-3 pt-5">
        {/* eslint-disable-next-line @next/next/no-img-element -- a 300 px local logo; no optimisation needed */}
        <img src="/brand/sanmarkkam-life.png" alt="" className="h-11 w-11 rounded-full" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-muted">{today}</p>
          <h1 className="text-xl font-extrabold">Pocket Sanmarkkam</h1>
        </div>
        <Link href="/settings" className="rounded-full p-2 text-muted" aria-label="Settings">
          <Icon name="gear" />
        </Link>
      </div>

      <section className="card mt-5 overflow-hidden" aria-labelledby="votd">
        <div className="flex items-center gap-2 bg-gold-soft px-5 py-3">
          <Icon name="flame" className="h-5 w-5 text-gold" filled />
          <h2 id="votd" className="label">Verse of the day</h2>
        </div>
        <div className="px-5 pb-5 pt-4">
          {!verse && !failed && <p className="text-muted">Opening the books…</p>}
          {failed && <p className="text-muted">The verse could not load. Connect once to the internet, then it stays on your phone.</p>}
          {verse && (
            <>
              {settings.showTamil && (
                <div className="tamil-text mb-2" lang="ta">
                  {verse.tamil.map((t, i) => (
                    <div key={i} dangerouslySetInnerHTML={{ __html: t }} />
                  ))}
                </div>
              )}
              {settings.showTranslit && verse.translit.length > 0 && (
                <div className="reading mb-3 font-read italic text-muted">
                  {verse.translit.map((t, i) => (
                    <p key={i} dangerouslySetInnerHTML={{ __html: t }} />
                  ))}
                </div>
              )}
              <blockquote className="reading font-read text-[1.15em] leading-relaxed">“{verse.translation}”</blockquote>
              <p className="mt-3 text-sm text-muted">Vallalar (Ramalinga Adigal), {verse.ref}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button onClick={share} className="btn-gold">
                  <Icon name="share" className="h-4 w-4" /> Share
                </button>
                <Link href={passageHref(verse.book, verse.id)} className="btn-line no-underline">
                  Read with commentary <Icon name="next" className="h-4 w-4" />
                </Link>
                {toast && <span className="text-sm font-semibold text-gold">{toast}</span>}
              </div>
            </>
          )}
        </div>
      </section>

      <JourneyCard />

      {last && (
        <Link href={lastReadHref(last)} className="card mt-4 flex items-center gap-4 p-4 text-ink no-underline">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold">
            <Icon name="book" className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold uppercase tracking-wider text-gold">Continue reading</span>
            <span className="block truncate font-bold">{last.label}</span>
          </span>
          <Icon name="next" className="h-5 w-5 shrink-0 text-muted" />
        </Link>
      )}

      <Link href="/karunai" className="card mt-4 flex items-center gap-4 p-4 text-ink no-underline">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-white dark:text-[#1c160c]">
          <Icon name="flame" className="h-5 w-5" filled />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">Ask KarunAI</span>
          <span className="block text-sm text-muted">Questions about Vallalar&apos;s teachings, answered from the books</span>
        </span>
        <Icon name="next" className="h-5 w-5 shrink-0 text-muted" />
      </Link>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <Link href="/books" className="card flex flex-col gap-1 p-4 text-ink no-underline">
          <Icon name="book" className="h-6 w-6 text-gold" />
          <span className="font-bold">The books</span>
          <span className="text-xs text-muted">{catalog.length} books, with the original Tamil</span>
        </Link>
        <Link href="/search" className="card flex flex-col gap-1 p-4 text-ink no-underline">
          <Icon name="search" className="h-6 w-6 text-gold" />
          <span className="font-bold">Search</span>
          <span className="text-xs text-muted">Every verse and passage</span>
        </Link>
        <Link href="/audio" className="card flex flex-col gap-1 p-4 text-ink no-underline">
          <Icon name="audio" className="h-6 w-6 text-gold" />
          <span className="font-bold">Listen</span>
          <span className="text-xs text-muted">Audiobooks</span>
        </Link>
        <Link href="/bookmarks" className="card flex flex-col gap-1 p-4 text-ink no-underline">
          <Icon name="bookmark" className="h-6 w-6 text-gold" />
          <span className="font-bold">Bookmarks</span>
          <span className="text-xs text-muted">{bookmarks.length ? `${bookmarks.length} saved` : "Tap the ribbon on any verse"}</span>
        </Link>
      </section>

      <section className="card mt-6 p-5">
        <h2 className="font-extrabold">The path in one breath</h2>
        <p className="reading mt-2 font-read">
          Vallalar taught one God, Arut Perum Jothi, the Vast Grace-Light, open to every human being. The way to that Light is
          Jeevakarunyam, compassion for every living being. Its fruit is Anma Neya Orumaipadu, the oneness of all souls.
        </p>
        <Link href="/book?b=perupadesam" className="mt-3 inline-flex items-center gap-1 font-semibold no-underline">
          Begin with The Great Teaching <Icon name="next" className="h-4 w-4" />
        </Link>
      </section>

      <p className="py-8 text-center text-xs text-muted">
        Offered freely by Sanmarkkam Life ·{" "}
        <Link href="/support" className="no-underline">
          Support the work
        </Link>{" "}
        ·{" "}
        <a href={FEEDBACK_URL} target="_blank" rel="noopener" className="no-underline">
          Share an idea or report a mistake
        </a>
      </p>
    </main>
  );
}

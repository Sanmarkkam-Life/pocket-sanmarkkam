"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import { catalogBook } from "@/lib/data";
import { audiobooks, chantSections, type Chant } from "@/lib/links";

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M7 4.5v15l12-7.5z" />
  </svg>
);

function ChantRow({ c, open, toggle }: { c: Chant; open: boolean; toggle: () => void }) {
  const watch = `https://www.youtube.com/watch?v=${c.youtube}${c.start ? `&t=${c.start}s` : ""}`;
  return (
    <li className="card p-4">
      <div className="flex items-start gap-3">
        {c.embed ? (
          <button onClick={toggle} className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${open ? "bg-gold text-white dark:text-[#1c160c]" : "bg-gold-soft text-gold"}`} aria-label={open ? `Close: ${c.title}` : `Play ${c.title}`}>
            {open ? <Icon name="close" className="h-5 w-5" /> : <PlayIcon />}
          </button>
        ) : (
          <a href={watch} target="_blank" rel="noopener" className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold" aria-label={`Play ${c.title} on YouTube`}>
            <PlayIcon />
          </a>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-bold leading-snug">{c.title}</div>
          <div className="text-sm text-muted">
            {c.by}
            {!c.start && ` · ${c.minutes} min`}
          </div>
          {c.note && <div className="text-xs text-muted">{c.note}</div>}
        </div>
      </div>
      {open && c.embed && (
        // youtube-nocookie, loaded only when tapped: nothing reaches YouTube until the reader chooses to play
        <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${c.youtube}?autoplay=1&rel=0${c.start ? `&start=${c.start}` : ""}`}
            title={c.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )}
    </li>
  );
}

export default function Audio() {
  const [tab, setTab] = useState<"chants" | "books">("chants");
  const [playing, setPlaying] = useState<string | null>(null);
  const toggle = (key: string) => setPlaying((p) => (p === key ? null : key));

  return (
    <>
      <Header title="Audio" sub="Chants, songs and audiobooks" />
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-4">
        <div className="mb-4 grid grid-cols-2 gap-2" role="tablist">
          {(["chants", "books"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`chip py-2 ${tab === t ? "border-gold bg-gold text-white dark:text-[#1c160c]" : "border-line bg-card text-muted"}`}>
              {t === "chants" ? "Chants and songs" : "Audiobooks"}
            </button>
          ))}
        </div>

        {tab === "chants" && (
          <>
            {chantSections.map((s) => (
              <section key={s.id} className="mb-6">
                <h2 className="font-extrabold">{s.title}</h2>
                <p className="font-tamil text-sm text-muted" lang="ta">
                  {s.tamil}
                </p>
                <p className="mb-3 mt-1 text-sm text-muted">{s.text}</p>
                {s.items.length === 0 ? (
                  <p className="card p-4 text-sm text-muted">More versions are coming soon.</p>
                ) : (
                  <ul className="space-y-3">
                    {s.items.map((c) => (
                      <ChantRow key={c.youtube} c={c} open={playing === c.youtube} toggle={() => toggle(c.youtube)} />
                    ))}
                  </ul>
                )}
              </section>
            ))}
            <p className="text-center text-xs text-muted">These recordings play from YouTube and need the internet. Shared with the singers&apos; permission.</p>
          </>
        )}

        {tab === "books" && (
          <>
            <p className="mb-4 text-sm text-muted">The English translation, read aloud. Audio plays from sanmarkkamlife.org, so it needs the internet.</p>
            <ul className="space-y-3">
              {audiobooks.map((a) => {
                const book = catalogBook(a.book);
                const open = playing === a.src;
                return (
                  <li key={a.src} className="card p-4">
                    <div className="flex items-start gap-3">
                      <button onClick={() => toggle(a.src)} className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${open ? "bg-gold text-white dark:text-[#1c160c]" : "bg-gold-soft text-gold"}`} aria-label={open ? `Close player: ${a.title}` : `Play ${a.title}`}>
                        {open ? <Icon name="close" className="h-5 w-5" /> : <PlayIcon />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold leading-snug">{a.title}</div>
                        {a.note && <div className="text-xs text-muted">{a.note}</div>}
                        {book && (
                          <Link href={`/book?b=${book.id}`} className="text-sm no-underline">
                            Read the book
                          </Link>
                        )}
                      </div>
                    </div>
                    {open && <audio src={a.src} controls autoPlay preload="none" className="mt-3 w-full" />}
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-center text-xs text-muted">Books I and V have no audiobook yet.</p>
          </>
        )}
      </main>
    </>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import { catalogBook } from "@/lib/data";
import { audiobooks } from "@/lib/links";

export default function Audio() {
  const [playing, setPlaying] = useState<string | null>(null);
  return (
    <>
      <Header title="Audio" sub="Audiobooks of the published books" />
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-4">
        <p className="mb-4 text-sm text-muted">
          The English translation, read aloud. Audio plays from sanmarkkamlife.org, so it needs the internet. Mantras and chants come later.
        </p>
        <ul className="space-y-3">
          {audiobooks.map((a) => {
            const book = catalogBook(a.book);
            const open = playing === a.src;
            return (
              <li key={a.src} className="card p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => setPlaying(open ? null : a.src)}
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${open ? "bg-gold text-white dark:text-[#1c160c]" : "bg-gold-soft text-gold"}`}
                    aria-label={open ? `Close player: ${a.title}` : `Play ${a.title}`}
                  >
                    {open ? <Icon name="close" className="h-5 w-5" /> : <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" /></svg>}
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
                {open && (
                  <audio src={a.src} controls autoPlay preload="none" className="mt-3 w-full" />
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-center text-xs text-muted">Books I and V have no audiobook yet.</p>
      </main>
    </>
  );
}

"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import { passageHref } from "@/lib/data";
import { usePrefs } from "@/lib/prefs";

export default function Bookmarks() {
  const { bookmarks, removeBookmark, ready } = usePrefs();
  return (
    <>
      <Header title="Bookmarks" back="/books" sub="Saved on this phone only" />
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-4">
        {ready && bookmarks.length === 0 && (
          <div className="card p-6 text-center text-muted">
            <Icon name="bookmark" className="mx-auto mb-2 h-8 w-8" />
            <p>Tap the ribbon beside any verse to keep it here.</p>
          </div>
        )}
        <ul className="space-y-2">
          {bookmarks.map((b) => (
            <li key={b.book + b.id} className="card flex items-start gap-2 p-4">
              <Link href={passageHref(b.book, b.id)} className="min-w-0 flex-1 text-ink no-underline">
                <div className="text-xs font-bold text-gold">{b.ref}</div>
                <p className="mt-1 font-read leading-relaxed">{b.text}{b.text.length >= 160 ? "…" : ""}</p>
              </Link>
              <button onClick={() => removeBookmark(b.book, b.id)} className="rounded-full p-1.5 text-muted" aria-label="Remove bookmark">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

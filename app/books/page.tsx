"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import { catalog, collections } from "@/lib/data";

const blurbs: Record<string, string> = {
  "Thiru Arutpa": "The Songs of Grace: Vallalar's poems, from the early temple songs to the Hymn of the Vast Grace-Light.",
  "Urainaidai Paguthi": "The prose: his teachings, petitions, letters, commands and notes.",
};

export default function Books() {
  return (
    <>
      <Header title="Books" sub="Only approved editions" />
      <main className="mx-auto max-w-2xl px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/search" className="btn-line no-underline">
            <Icon name="search" className="h-4 w-4" /> Search
          </Link>
          <Link href="/bookmarks" className="btn-line no-underline">
            <Icon name="bookmark" className="h-4 w-4" /> Bookmarks
          </Link>
        </div>

        {collections.map((c) => (
          <section key={c} className="mt-6">
            <h2 className="text-lg font-extrabold">{c}</h2>
            <p className="mb-3 text-sm text-muted">{blurbs[c]}</p>
            <ul className="space-y-2">
              {catalog
                .filter((b) => b.collection === c)
                .map((b) => (
                  <li key={b.id}>
                    <Link href={`/book?b=${b.id}`} className="card flex items-center gap-3 p-4 text-ink no-underline">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold leading-snug">{b.title}</div>
                        <div className="font-tamil text-sm text-muted" lang="ta">
                          {b.tamilTitle}
                        </div>
                        <div className="mt-1 text-xs text-muted">
                          {b.romanTitle} · {b.edition.replace(/, .*/, "")} · {b.passages.toLocaleString()} {c === "Thiru Arutpa" ? "verses" : "passages"}
                        </div>
                      </div>
                      <Icon name="next" className="h-5 w-5 shrink-0 text-muted" />
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
        <p className="py-6 text-center text-xs text-muted">
          More books join as each is approved: Book VI and the remaining prose are being translated.
        </p>
      </main>
    </>
  );
}

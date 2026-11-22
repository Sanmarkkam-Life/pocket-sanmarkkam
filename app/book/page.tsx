"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import { catalogBook, loadBook, sectionHref } from "@/lib/data";

function BookContents() {
  const id = useSearchParams().get("b");
  const book = catalogBook(id);
  const [offline, setOffline] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  // Opening the contents starts the download, so the whole book is on the phone before the first page.
  useEffect(() => {
    if (!book) return;
    setOffline("saving");
    loadBook(book.id).then(() => setOffline("saved")).catch(() => setOffline("failed"));
  }, [book]);

  if (!book) {
    return (
      <>
        <Header title="Book not found" back="/books" />
        <p className="p-6 text-muted">This book is not in the app.</p>
      </>
    );
  }
  const many = book.toc.length > 1;

  return (
    <>
      <Header title={book.short} back="/books" sub={book.edition} />
      <main className="mx-auto max-w-2xl px-4 pt-4">
        <h2 className="text-2xl font-extrabold leading-tight">{book.title}</h2>
        <p className="font-tamil text-lg text-muted" lang="ta">
          {book.tamilTitle}
        </p>
        <p className="text-sm text-muted">{book.romanTitle} · Vallalar (Ramalinga Adigal)</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {book.hasIntro && (
            <Link href={`/intro?b=${book.id}`} className="btn-line no-underline">
              Introduction
            </Link>
          )}
          {book.glossary > 0 && (
            <Link href={`/glossary?b=${book.id}`} className="btn-line no-underline">
              Glossary ({book.glossary})
            </Link>
          )}
          <a href={book.page} target="_blank" rel="noopener" className="btn-line no-underline">
            PDF and print <Icon name="external" className="h-4 w-4" />
          </a>
        </div>
        <p className="mt-2 text-xs text-muted">
          {offline === "saving" && "Saving this book on your phone…"}
          {offline === "saved" && "✓ Saved on this phone: readable offline."}
          {offline === "failed" && "Not saved yet: connect to the internet to read this book."}
        </p>

        {book.toc.map((w) => (
          <section key={w.id} className="mt-6">
            {many && (
              <h3 className="mb-2 font-extrabold">
                {w.title}
                {w.tamil && (
                  <span className="block font-tamil text-sm font-normal text-muted" lang="ta">
                    {w.tamil}
                  </span>
                )}
              </h3>
            )}
            <ol className="card divide-y divide-line">
              {w.sections.map((s) => (
                <li key={s.id}>
                  <Link href={sectionHref(book.id, w.id, s.id)} className="flex items-center gap-3 px-4 py-3 text-ink no-underline">
                    {s.number && <span className="w-9 shrink-0 text-right text-sm font-bold text-gold">{s.number.replace(/^0+/, "")}</span>}
                    <span className="min-w-0 flex-1">
                      <span className="block leading-snug">{s.title}</span>
                      {s.tamil && (
                        <span className="block truncate font-tamil text-xs text-muted" lang="ta">
                          {s.tamil}
                        </span>
                      )}
                    </span>
                    {s.count > 1 && <span className="shrink-0 text-xs text-muted">{s.count}</span>}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
        <div className="h-6" />
      </main>
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <BookContents />
    </Suspense>
  );
}

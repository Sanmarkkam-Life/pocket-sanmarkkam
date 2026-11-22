"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { catalogBook, loadBook } from "@/lib/data";
import type { Book } from "@/lib/types";

function Glossary() {
  const meta = catalogBook(useSearchParams().get("b"));
  const [book, setBook] = useState<Book | null>(null);
  const [q, setQ] = useState("");
  useEffect(() => {
    if (meta) loadBook(meta.id).then(setBook).catch(() => {});
  }, [meta]);
  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (book?.glossary ?? []).filter((g) => !needle || `${g.term} ${g.tamil} ${g.def}`.toLowerCase().includes(needle));
  }, [book, q]);
  if (!meta) return <Header title="Book not found" back="/books" />;
  return (
    <>
      <Header title="Glossary" back={`/book?b=${meta.id}`} sub={meta.title} />
      <main className="mx-auto max-w-2xl px-4 pb-8">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a word" className="mt-4 w-full rounded-full border border-line bg-card px-4 py-2 text-ink outline-none focus:border-gold" />
        <dl className="mt-4 divide-y divide-line">
          {items.map((g, i) => (
            <div key={i} className="py-3">
              <dt className="font-bold">
                {g.term}{" "}
                {g.tamil && (
                  <span className="font-tamil font-normal text-muted" lang="ta">
                    {g.tamil}
                  </span>
                )}
              </dt>
              <dd className="reading font-read text-[0.95em]">{g.def}</dd>
            </div>
          ))}
        </dl>
      </main>
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Glossary />
    </Suspense>
  );
}

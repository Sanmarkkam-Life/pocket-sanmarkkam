"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Header from "@/components/Header";
import { catalogBook, loadBook } from "@/lib/data";
import type { Book } from "@/lib/types";

function Intro() {
  const meta = catalogBook(useSearchParams().get("b"));
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (meta) loadBook(meta.id).then(setBook).catch(() => setError(true));
  }, [meta]);
  if (!meta) return <Header title="Book not found" back="/books" />;
  return (
    <>
      <Header title="Introduction" back={`/book?b=${meta.id}`} sub={meta.title} />
      <main className="mx-auto max-w-2xl px-4 pb-8">
        {error && <p className="py-8 text-muted">Connect to the internet once to save this book.</p>}
        {book?.intro.map((e, i) => (
          <section key={i} className="pt-6">
            <h2 className="mb-3 text-xl font-extrabold">{e.title}</h2>
            <div className="reading space-y-4 font-read">
              {e.paras.map((p, k) => (p.startsWith("<h3>") ? <div key={k} className="pt-2 font-ui font-extrabold" dangerouslySetInnerHTML={{ __html: p }} /> : <p key={k} dangerouslySetInnerHTML={{ __html: p }} />))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Intro />
    </Suspense>
  );
}

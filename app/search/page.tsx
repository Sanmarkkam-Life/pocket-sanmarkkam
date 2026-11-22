"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { catalog, loadSearch, passageHref } from "@/lib/data";
import type { SearchRow } from "@/lib/types";

// Search ignores case and accents, so "jothi", "Jōti" and "JOTHI" all match.
// Character by character, so the folded text keeps the same length (Tamil is left untouched).
const fold = (s: string) =>
  Array.from(s, (ch) => {
    const c = ch.charCodeAt(0);
    return c > 0x7f && c < 0x2000 && (c < 0x0b80 || c > 0x0bff) ? ch.normalize("NFD")[0] : ch;
  })
    .join("")
    .toLowerCase();
const LIMIT = 150;

function snippet(text: string, terms: string[]) {
  const f = fold(text);
  const at = Math.max(0, Math.min(...terms.map((t) => f.indexOf(t)).filter((x) => x >= 0)));
  const start = Math.max(0, at - 70);
  const piece = (start > 0 ? "…" : "") + text.slice(start, start + 240) + (start + 240 < text.length ? "…" : "");
  // highlight on the original text, by position in the folded copy (folding keeps length for these scripts)
  const parts: { t: string; m: boolean }[] = [];
  const fp = fold(piece);
  let i = 0;
  while (i < piece.length) {
    let hit = 0;
    for (const t of terms) if (t && fp.startsWith(t, i)) hit = Math.max(hit, t.length);
    if (hit) {
      parts.push({ t: piece.slice(i, i + hit), m: true });
      i += hit;
    } else {
      const last = parts[parts.length - 1];
      if (last && !last.m) last.t += piece[i];
      else parts.push({ t: piece[i], m: false });
      i++;
    }
  }
  return parts;
}

function Search() {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [book, setBook] = useState(params.get("in") ?? "");
  const [rows, setRows] = useState<SearchRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadSearch().then(setRows).catch(() => setError(true));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const u = new URLSearchParams();
      if (q) u.set("q", q);
      if (book) u.set("in", book);
      router.replace(`/search${u.toString() ? "?" + u : ""}`, { scroll: false });
    }, 400);
    return () => clearTimeout(t);
  }, [q, book, router]);

  const terms = useMemo(() => fold(q).split(/\s+/).filter((t) => t.length > 1 || /[஀-௿]/.test(t)), [q]);
  const results = useMemo(() => {
    if (!rows || terms.length === 0) return { list: [] as SearchRow[], total: 0 };
    const list: SearchRow[] = [];
    let total = 0;
    for (const r of rows) {
      if (book && r[0] !== book) continue;
      const hay = fold(r[3] + " " + r[4]);
      if (terms.every((t) => hay.includes(t))) {
        total++;
        if (list.length < LIMIT) list.push(r);
      }
    }
    return { list, total };
  }, [rows, terms, book]);

  return (
    <>
      <Header title="Search" back="/books" />
      <main className="mx-auto max-w-2xl px-4 pb-8">
        <div className="sticky top-[57px] z-10 -mx-4 space-y-2 bg-page/95 px-4 py-3 backdrop-blur">
          <input
            autoFocus
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the translation or the Tamil: compassion, light, கருணை…"
            className="w-full rounded-full border border-line bg-card px-4 py-2.5 text-ink outline-none focus:border-gold"
            aria-label="Search the books"
          />
          <select value={book} onChange={(e) => setBook(e.target.value)} className="w-full rounded-full border border-line bg-card px-4 py-2 text-sm text-ink" aria-label="Search in">
            <option value="">All books</option>
            {catalog.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="py-6 text-muted">Search needs the internet the first time; after that it works offline.</p>}
        {!rows && !error && q && <p className="py-6 text-muted">Preparing search…</p>}
        {rows && terms.length > 0 && (
          <p className="py-2 text-sm text-muted">
            {results.total === 0 ? "Nothing found. Try another word." : `${results.total.toLocaleString()} passage${results.total === 1 ? "" : "s"}${results.total > LIMIT ? `, the first ${LIMIT} shown` : ""}`}
          </p>
        )}
        <ul className="space-y-2">
          {results.list.map((r) => {
            const inTranslation = terms.some((t) => fold(r[3]).includes(t));
            return (
              <li key={r[0] + r[1]}>
                <Link href={passageHref(r[0], r[1])} className="card block p-4 text-ink no-underline">
                  <div className="mb-1 text-xs font-bold text-gold">{r[2]}</div>
                  <p className={`text-[0.95rem] leading-relaxed ${inTranslation ? "font-read" : "font-tamil"}`}>
                    {snippet(inTranslation ? r[3] : r[4], terms).map((p, i) => (p.m ? <mark key={i}>{p.t}</mark> : <span key={i}>{p.t}</span>))}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Search />
    </Suspense>
  );
}

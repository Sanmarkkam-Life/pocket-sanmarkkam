"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import LayerToggles from "@/components/LayerToggles";
import PassageView from "@/components/PassageView";
import { catalogBook, loadBook, sectionHref } from "@/lib/data";
import { saveLastRead } from "@/lib/lastRead";
import type { Book } from "@/lib/types";

function Reader() {
  const q = useSearchParams();
  const id = q.get("b") ?? "";
  const w = q.get("w") ?? "1";
  const s = q.get("s") ?? "1";
  const meta = catalogBook(id);
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!meta) return;
    setError(false);
    loadBook(meta.id).then(setBook).catch(() => setError(true));
  }, [meta]);

  const flat = useMemo(() => (book ? book.works.flatMap((wk) => wk.sections.map((sec) => ({ wk, sec }))) : []), [book]);
  const index = flat.findIndex((x) => x.wk.id === w && x.sec.id === s);
  const here = index >= 0 ? flat[index] : null;
  const prev = index > 0 ? flat[index - 1] : null;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : null;

  // jump to the passage named in the address (#p-1.2.3), or to the top of a new section
  useEffect(() => {
    if (!here) return;
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const el = hash ? document.getElementById(hash) : null;
    if (el) {
      el.scrollIntoView({ block: "start" });
      el.classList.add("ring-2", "ring-gold/50", "rounded-xl");
      setTimeout(() => el.classList.remove("ring-2", "ring-gold/50", "rounded-xl"), 2500);
    } else {
      window.scrollTo(0, 0);
    }
  }, [here]);

  // remember where the reader is, for "Continue reading" on Home: the section, then the passage at the top of the screen
  useEffect(() => {
    if (!here || !meta) return;
    const label = `${meta.short}, ${here.sec.number ? here.sec.number.replace(/^0+/, "") + ". " : ""}${here.sec.title}`;
    const hash = decodeURIComponent(window.location.hash.slice(1)).replace(/^p-/, "");
    saveLastRead({ book: meta.id, w, s, p: hash || undefined, label });
    let t: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const top = Array.from(document.querySelectorAll<HTMLElement>("article[id^='p-']")).find((el) => el.getBoundingClientRect().bottom > 140);
        saveLastRead({ book: meta.id, w, s, p: top ? top.id.slice(2) : undefined, label });
      }, 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, [here, meta, w, s]);

  if (!meta) return <Header title="Book not found" back="/books" />;

  const many = (book?.works.length ?? 1) > 1;
  const title = here ? `${here.sec.number ? here.sec.number.replace(/^0+/, "") + ". " : ""}${here.sec.title}` : meta.short;
  const refFor = (n: string) =>
    `${meta.short}, ${many && here ? here.wk.title + " · " : ""}${here?.sec.title ?? ""}${n ? " " + n : ""}`;

  return (
    <>
      <Header title={meta.short} back={`/book?b=${meta.id}`} sub={here ? (many ? `${here.wk.title}${here.wk.translit ? " · " + here.wk.translit : ""}` : meta.romanTitle) : undefined} />
      <div className="sticky top-[57px] z-10 border-b border-line bg-page/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-2">
          <LayerToggles compact />
        </div>
      </div>
      <main className="mx-auto max-w-2xl px-4">
        {error && <p className="py-8 text-muted">This book is not on your phone yet. Connect to the internet once and open it again.</p>}
        {!book && !error && <p className="py-8 text-muted">Opening the book…</p>}
        {book && !here && <p className="py-8 text-muted">This part of the book was not found.</p>}
        {here && (
          <>
            <div className="pb-2 pt-5">
              <h2 className="text-xl font-extrabold leading-snug">{title}</h2>
              {here.sec.translit && <p className="font-read italic text-muted">{here.sec.translit}</p>}
              {here.sec.tamil && (
                <p className="font-tamil text-muted" lang="ta">
                  {here.sec.tamil}
                </p>
              )}
            </div>
            {here.sec.blocks.map((b, i) => {
              if (b.type === "passage") return <PassageView key={b.id} p={b} bookId={meta.id} refLabel={refFor(b.n)} />;
              if (b.type === "heading") return <h3 key={i} className="pt-4 font-extrabold" dangerouslySetInnerHTML={{ __html: b.html }} />;
              if (b.type === "para") return <p key={i} className="reading py-2 font-read" dangerouslySetInnerHTML={{ __html: b.html }} />;
              return (
                <div key={i} className="my-4 overflow-x-auto rounded-xl border border-line">
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {b.rows.map((row, r) => (
                        <tr key={r} className={r === 0 ? "bg-gold-soft font-bold" : "border-t border-line"}>
                          {row.map((c, k) => (
                            <td key={k} className="px-3 py-2 align-top font-read [&:nth-child(2)]:font-tamil" dangerouslySetInnerHTML={{ __html: c }} />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
            <nav className="my-8 grid grid-cols-2 gap-3" aria-label="Sections">
              {prev ? (
                <Link href={sectionHref(meta.id, prev.wk.id, prev.sec.id)} className="card flex items-center gap-2 p-3 text-sm text-ink no-underline">
                  <Icon name="back" className="h-4 w-4 shrink-0" />
                  <span className="line-clamp-2">{prev.sec.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={sectionHref(meta.id, next.wk.id, next.sec.id)} className="card flex items-center justify-end gap-2 p-3 text-right text-sm text-ink no-underline">
                  <span className="line-clamp-2">{next.sec.title}</span>
                  <Icon name="next" className="h-4 w-4 shrink-0" />
                </Link>
              ) : (
                <Link href={`/book?b=${meta.id}`} className="card p-3 text-right text-sm text-ink no-underline">
                  End of the book · Contents
                </Link>
              )}
            </nav>
          </>
        )}
      </main>
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Reader />
    </Suspense>
  );
}

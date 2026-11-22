"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "./Icon";
import { usePrefs } from "@/lib/prefs";
import { passageHref, stripTags } from "@/lib/data";
import { shareText } from "@/lib/share";
import type { Passage } from "@/lib/types";

/** One verse or prose passage, with the layers the reader has switched on. */
export default function PassageView({ p, bookId, refLabel }: { p: Passage; bookId: string; refLabel: string }) {
  const { settings, isBookmarked, toggleBookmark } = usePrefs();
  const [toast, setToast] = useState("");
  const translation = p.translation ?? [];
  const headerOnly = translation.length === 0 && !p.commentary; // e.g. a metre heading such as வேறு
  const marked = isBookmarked(bookId, p.id);
  const plainTranslation = stripTags(translation.join(" "));

  if (headerOnly && !p.note) {
    return (
      <div id={`p-${p.id}`} className="scroll-mt-28 py-2 text-center font-tamil text-sm text-muted">
        {p.tamil.map((t, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: t }} />
        ))}
      </div>
    );
  }

  const share = async () => {
    const r = await shareText(refLabel, `“${plainTranslation}”\n— Vallalar (Ramalinga Adigal), ${refLabel}`, `${window.location.origin}${passageHref(bookId, p.id)}`);
    if (r === "copied") {
      setToast("Copied");
      setTimeout(() => setToast(""), 1600);
    }
  };

  return (
    <article id={`p-${p.id}`} className="scroll-mt-28 border-b border-line py-5 last:border-b-0">
      {p.note?.map((n, i) => (
        <p key={i} className="mb-3 text-sm text-muted" dangerouslySetInnerHTML={{ __html: n }} />
      ))}

      <div className="mb-2 flex items-center gap-2">
        {p.n && <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-sm font-bold text-gold">{p.n}</span>}
        <span className="flex-1" />
        <Link
          href={`/karunai?about=${encodeURIComponent(`${refLabel}: “${plainTranslation.slice(0, 600)}${plainTranslation.length > 600 ? "…" : ""}”`)}`}
          className="rounded-full p-1.5 text-muted"
          aria-label="Ask KarunAI about this passage"
          title="Ask KarunAI about this passage"
        >
          <Icon name="flame" className="h-[18px] w-[18px]" />
        </Link>
        <button onClick={share} className="rounded-full p-1.5 text-muted" aria-label="Share this passage">
          <Icon name="share" className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={() => toggleBookmark({ book: bookId, id: p.id, ref: refLabel, text: plainTranslation.slice(0, 160) })}
          className={`rounded-full p-1.5 ${marked ? "text-gold" : "text-muted"}`}
          aria-label={marked ? "Remove bookmark" : "Bookmark this passage"}
          aria-pressed={marked}
        >
          <Icon name="bookmark" className="h-[18px] w-[18px]" filled={marked} />
        </button>
        {toast && <span className="text-xs font-semibold text-gold">{toast}</span>}
      </div>

      {settings.showTamil && p.tamil.length > 0 && (
        <div className="tamil-text mb-2" lang="ta">
          {p.tamil.map((t, i) => (
            <div key={i} dangerouslySetInnerHTML={{ __html: t }} />
          ))}
        </div>
      )}
      {settings.showTranslit && p.translit && p.translit.length > 0 && (
        <div className="reading mb-3 font-read italic text-muted">
          {p.translit.map((t, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: t }} />
          ))}
        </div>
      )}
      {headerOnly && !settings.showTamil && (
        <div className="mb-2 font-tamil text-sm text-muted">{p.tamil.map((t) => stripTags(t)).join(" ")}</div>
      )}

      <div className="reading space-y-3 font-read">
        {translation.map((t, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: t }} />
        ))}
      </div>

      {settings.showCommentary && p.commentary && (
        <div className="mt-4 rounded-xl border-l-4 border-gold/60 bg-gold-soft/60 px-4 py-3">
          <div className="label mb-1">Commentary</div>
          <div className="reading space-y-3 font-read text-[0.95em]">
            {p.commentary.map((t, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: t }} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

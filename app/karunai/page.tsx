"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import { DAILY_LIMIT, ask, loadChat, renderAnswer, saveChat, usedToday, type Msg } from "@/lib/karunai";

const starters = [
  "Who was Vallalar?",
  "What is Jeevakarunyam?",
  "How do I begin on the path of Sanmarkkam?",
  "What is Arut Perum Jothi?",
];

export default function KarunAI() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [used, setUsed] = useState(0);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs(loadChat());
    setUsed(usedToday());
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy]);

  const left = Math.max(0, DAILY_LIMIT - used);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy || left === 0) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    const r = await ask(next);
    const done: Msg[] = [...next, { role: "assistant", content: r.text, sources: r.sources }];
    // a failed answer is shown but not kept in the conversation sent next time
    setMsgs(done);
    saveChat(r.ok ? done : next);
    setUsed(usedToday());
    setBusy(false);
  };

  const reset = () => {
    setMsgs([]);
    saveChat([]);
  };

  return (
    <>
      <Header
        title="KarunAI"
        sub="A guide to Vallalar's teachings"
        right={
          msgs.length > 0 ? (
            <button onClick={reset} className="rounded-full px-3 py-1 text-sm font-semibold text-muted" aria-label="Start a new conversation">
              New
            </button>
          ) : undefined
        }
      />
      <main className="mx-auto flex max-w-2xl flex-col px-4 pb-40 pt-4">
        {msgs.length === 0 && (
          <section className="card p-5">
            <div className="flex items-center gap-2">
              <Icon name="flame" className="h-6 w-6 text-gold" filled />
              <h2 className="text-lg font-extrabold">Ask KarunAI</h2>
            </div>
            <p className="reading mt-2 font-read">
              KarunAI answers from our own translations of Vallalar&apos;s writings, and names the book it draws from. Ask in any language.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {starters.map((s) => (
                <button key={s} onClick={() => send(s)} className="btn-line justify-start text-left font-normal">
                  {s}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="space-y-4">
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-10 rounded-2xl rounded-br-md bg-gold-soft px-4 py-3 font-read">
                {m.content}
              </div>
            ) : (
              <div key={i} className="mr-4">
                <div className="mb-1 flex items-center gap-1 text-xs font-bold text-gold">
                  <Icon name="flame" className="h-3.5 w-3.5" filled /> KarunAI
                </div>
                <div className="reading space-y-3 font-read [&_li]:ml-5 [&_li]:list-disc" dangerouslySetInnerHTML={{ __html: renderAnswer(m.content) }} />
                {m.sources && m.sources.length > 0 && (
                  <details className="mt-2 text-xs text-muted">
                    <summary className="cursor-pointer">Passages searched ({m.sources.length})</summary>
                    <ul className="mt-1 space-y-0.5">
                      {Array.from(new Set(m.sources)).map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ),
          )}
          {busy && <p className="text-sm text-muted">KarunAI is reading the books… (about 10 seconds)</p>}
          <div ref={end} />
        </div>
      </main>

      <div className="fixed inset-x-0 z-20 border-t border-line bg-page/95 backdrop-blur" style={{ bottom: "calc(3.9rem + env(safe-area-inset-bottom))" }}>
        <form
          className="mx-auto flex max-w-2xl items-end gap-2 px-4 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            maxLength={1500}
            disabled={left === 0}
            placeholder={left === 0 ? "That is all for today. Come back tomorrow. 🙏" : "Ask about Vallalar's teachings…"}
            className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-2xl border border-line bg-card px-4 py-2.5 text-ink outline-none focus:border-gold"
            aria-label="Your question"
          />
          <button type="submit" disabled={busy || !input.trim() || left === 0} className="btn-gold h-11 w-11 shrink-0 !p-0 disabled:opacity-40" aria-label="Send">
            <Icon name="next" className="h-5 w-5" />
          </button>
        </form>
        <p className="pb-1.5 text-center text-[0.7rem] text-muted">
          {left} of {DAILY_LIMIT} questions left today · Answers can be wrong: check them in the books · Questions go to sanmarkkamlife.org
        </p>
      </div>
    </>
  );
}

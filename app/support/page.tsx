"use client";

import { useState } from "react";
import DonatePanel from "@/components/DonatePanel";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import { support } from "@/lib/links";

export default function Support() {
  const [give, setGive] = useState(false);
  return (
    <>
      <Header title="Support" sub="Keep the teachings free for everyone" />
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-5">
        <p className="reading font-read">
          This app, the books and the recordings are offered freely, to anyone, anywhere. They are made by volunteers and carried by
          gifts. If they have helped you, you can help the next reader.
        </p>
        <ul className="mt-5 space-y-3">
          {support.map((s) => {
            const body = (
              <>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${s.primary ? "bg-gold text-white dark:text-[#1c160c]" : "bg-gold-soft text-gold"}`}>
                  <Icon name={s.icon} className="h-5 w-5" filled={s.icon === "heart"} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{s.title}</span>
                  <span className="block text-sm text-muted">{s.text}</span>
                </span>
                <Icon name={s.primary ? "next" : "external"} className="h-4 w-4 shrink-0 text-muted" />
              </>
            );
            return (
              <li key={s.href}>
                {s.primary ? (
                  <button onClick={() => setGive(true)} className="card flex w-full items-center gap-4 border-gold p-4 text-left text-ink">
                    {body}
                  </button>
                ) : (
                  <a href={s.href} target="_blank" rel="noopener" className="card flex items-center gap-4 p-4 text-ink no-underline">
                    {body}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-center text-xs text-muted">
          Gifts go through Sanmarkkam Life&apos;s secure Donorbox form, the same one as on the website. The app itself stores no payment details and no personal data.
        </p>
      </main>
      <DonatePanel open={give} placement="support-tab" onClose={() => setGive(false)} />
    </>
  );
}

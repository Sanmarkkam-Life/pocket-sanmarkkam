"use client";

import { useEffect, useId, useState } from "react";
import { AMOUNT_OPTIONS, DEFAULT_AMOUNT, DEFAULT_INTERVAL, donorboxUrl, parseCustomAmount, type Interval } from "@/lib/giving";

/**
 * A sheet over the current screen. Step 1: monthly or once, and an amount.
 * Step 2: the Donorbox form inside the app, pre-filled. No payment details touch the app.
 */
export default function DonatePanel({ open, placement, onClose }: { open: boolean; placement: string; onClose: () => void }) {
  const [step, setStep] = useState<"choose" | "pay">("choose");
  const [interval, setInterval] = useState<Interval>(DEFAULT_INTERVAL);
  const [preset, setPreset] = useState<number | null>(DEFAULT_AMOUNT);
  const [custom, setCustom] = useState("");
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    setStep("choose");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const customAmount = parseCustomAmount(custom);
  const amount = preset ?? customAmount;
  const customInvalid = preset === null && custom.trim() !== "" && customAmount === null;
  const selected = AMOUNT_OPTIONS.find((o) => o.amount === preset);
  const monthly = interval === "monthly";
  const on = "border-gold bg-gold text-white dark:text-[#1c160c]";
  const off = "border-line bg-card text-ink";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className={`flex w-full max-w-md flex-col rounded-t-3xl bg-page shadow-xl sm:rounded-3xl ${step === "pay" ? "h-[92dvh]" : "max-h-[92dvh]"}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center gap-3 px-5 pb-2 pt-4">
          {step === "pay" && (
            <button type="button" onClick={() => setStep("choose")} className="text-sm font-bold text-gold">
              ← Back
            </button>
          )}
          <h2 id={titleId} className="flex-1 text-lg font-extrabold">
            {step === "choose" ? "Donate to Sanmarkkam Life" : `Donate €${amount}${monthly ? " a month" : ""}`}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-xl font-bold">
            ×
          </button>
        </div>

        {step === "choose" ? (
          <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-5">
            <p className="text-sm leading-relaxed text-muted">
              Pocket Sanmarkkam is free for everyone, offered in compassion. Your gift keeps it free and carries Vallalar&apos;s compassion further.
            </p>
            <div className="flex gap-3" role="group" aria-label="How often">
              {(["monthly", "once"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={interval === v} onClick={() => setInterval(v)} className={`flex flex-1 flex-col items-center rounded-2xl border-2 px-3 py-2.5 ${interval === v ? on : off}`}>
                  <span className="font-extrabold">{v === "monthly" ? "Monthly" : "Once"}</span>
                  {v === "monthly" && <span className="text-xs font-bold opacity-80">Helps us most</span>}
                </button>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-3 gap-3" role="group" aria-label="Amount">
              {AMOUNT_OPTIONS.map((o) => (
                <button key={o.amount} type="button" aria-pressed={preset === o.amount} onClick={() => setPreset(o.amount)} className={`relative rounded-2xl border-2 pb-2.5 pt-4 text-xl font-extrabold ${preset === o.amount ? on : off}`}>
                  €{o.amount}
                  {o.amount === DEFAULT_AMOUNT && <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white dark:text-[#14141a]">Suggested</span>}
                </button>
              ))}
            </div>
            <label className="text-sm font-bold">
              Or your own amount
              <span className={`mt-1 flex items-center rounded-2xl border-2 bg-card px-3 ${preset === null ? "border-gold" : "border-line"}`}>
                <span className="text-lg font-bold text-muted">€</span>
                <input
                  inputMode="decimal"
                  placeholder="Any amount"
                  value={custom}
                  onFocus={() => setPreset(null)}
                  onChange={(e) => {
                    setPreset(null);
                    setCustom(e.target.value);
                  }}
                  className="w-full bg-transparent px-2 py-2.5 text-lg font-bold text-ink outline-none"
                />
              </span>
            </label>
            {customInvalid && <p className="-mt-2 text-xs font-semibold text-gold">Enter a whole amount from €1 to €10,000.</p>}
            <p className="min-h-[2.5rem] rounded-2xl bg-gold-soft px-4 py-2.5 text-sm leading-snug">
              {selected ? `${selected.label}: ${selected.impact}` : "Every gift counts, even €1, and is received with the same gratitude."}
            </p>
            <button type="button" disabled={amount === null} onClick={() => setStep("pay")} className="btn-gold min-h-[52px] w-full text-lg disabled:opacity-50">
              {amount === null ? "Choose an amount" : `Donate €${amount}${monthly ? " monthly" : ""}`}
            </button>
            <p className="text-center text-xs leading-relaxed text-muted">
              Card · Apple Pay · Google Pay · PayPal. Secure form by Donorbox, official receipt by email.{monthly ? " Cancel monthly giving anytime." : ""}
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-3">
            <iframe title="Secure donation form" src={donorboxUrl({ amount: amount ?? DEFAULT_AMOUNT, interval, placement, embed: true })} allow="payment" className="min-h-0 w-full flex-1 rounded-2xl border-0 bg-white" />
            <a href={donorboxUrl({ amount: amount ?? DEFAULT_AMOUNT, interval, placement, embed: false })} target="_blank" rel="noopener noreferrer" className="text-center text-xs font-bold text-muted underline underline-offset-4">
              Form not loading? Open it in a new tab
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

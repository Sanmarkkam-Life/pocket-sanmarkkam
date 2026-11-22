// Giving, the same way TamiLearn does it (13 TamiLearn App/lib/giving.ts): the app holds no
// payment code. Gifts go through the organisation's existing Donorbox form (card, Apple Pay,
// Google Pay, PayPal; monthly or once; email receipt), opened inside the app, pre-filled.
export const DONORBOX_CAMPAIGN = "sanmarkkam-en-monthly"; // the campaign the website's donate page uses

export type Interval = "monthly" | "once";

export const AMOUNT_OPTIONS = [
  { amount: 5, label: "Feed a Soul", impact: "Places an Emporium product, herbs or wholesome food, in hands that need it." },
  { amount: 20, label: "Keep the Light", impact: "Keeps our free publications, satsangs and food service alive." },
  { amount: 50, label: "Open a Path", impact: "Helps open new centres and carry the mission to new countries." },
] as const;

export const DEFAULT_AMOUNT = 20;
export const DEFAULT_INTERVAL: Interval = "monthly";

/** "25", "25.00", "25,5", " €30 " → whole euros from 1 to 10,000, or null. */
export function parseCustomAmount(raw: string): number | null {
  const cleaned = raw.replace(/[€\s]/g, "").replace(",", ".");
  if (cleaned === "" || !/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const value = Math.round(Number(cleaned));
  return Number.isFinite(value) && value >= 1 && value <= 10000 ? value : null;
}

/** Donorbox reads `amount` and `default_interval` (m = monthly, o = once). */
export function donorboxUrl(o: { amount: number; interval: Interval; placement: string; embed: boolean }) {
  const base = `https://donorbox.org/${o.embed ? "embed/" : ""}${DONORBOX_CAMPAIGN}`;
  const params = new URLSearchParams({
    amount: String(o.amount),
    default_interval: o.interval === "monthly" ? "m" : "o",
    utm_source: "pocket-sanmarkkam",
    utm_medium: "app",
    utm_campaign: o.placement,
  });
  return `${base}?${params}`;
}

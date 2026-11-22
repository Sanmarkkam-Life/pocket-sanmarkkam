"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import { JOURNEY_URL } from "@/lib/links";

// The Sanmarkkam Journey invitation: shown on Home only from the third day the app is opened,
// never as a pop-up, and hidden for good with ×. Sign-up happens on the website (Kit), so the
// app itself collects no email address.
const DAYS_KEY = "pocket_open_days_v1";
const HIDE_KEY = "pocket_journey_hidden_v1";
const SHOW_FROM_DAY = 3;

export default function JourneyCard() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(HIDE_KEY)) return;
      const today = new Date().toISOString().slice(0, 10);
      const days: string[] = JSON.parse(localStorage.getItem(DAYS_KEY) || "[]");
      if (!days.includes(today)) days.push(today);
      localStorage.setItem(DAYS_KEY, JSON.stringify(days.slice(-10)));
      setShow(days.length >= SHOW_FROM_DAY);
    } catch {
      /* storage blocked: simply never show it */
    }
  }, []);

  if (!show) return null;

  const hide = () => {
    try {
      localStorage.setItem(HIDE_KEY, "1");
    } catch {}
    setShow(false);
  };

  return (
    <section className="card relative mt-4 overflow-hidden border-gold/60 p-5" aria-label="The Sanmarkkam Journey">
      <button onClick={hide} className="absolute right-2 top-2 rounded-full p-2 text-muted" aria-label="Hide this invitation">
        <Icon name="close" className="h-4 w-4" />
      </button>
      <div className="text-2xl" aria-hidden="true">
        🛣️
      </div>
      <h2 className="mt-1 pr-8 font-extrabold">Walk the path with us</h2>
      <p className="reading mt-1 font-read text-[0.95em]">
        The Sanmarkkam Journey: free letters on Vallalar&apos;s teachings, one step at a time, with a free ebook to begin.
      </p>
      <a href={JOURNEY_URL} target="_blank" rel="noopener" className="btn-gold mt-3 no-underline">
        Join the Journey <Icon name="external" className="h-4 w-4" />
      </a>
      <p className="mt-2 text-xs text-muted">Free · Unsubscribe in one click · Opens sanmarkkamlife.org</p>
    </section>
  );
}

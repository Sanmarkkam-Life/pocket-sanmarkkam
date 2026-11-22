"use client";

import Header from "@/components/Header";
import { FEEDBACK_URL } from "@/lib/links";

// The feedback form (Google Form "Pocket Sanmarkkam feedback") shown inside the app.
export default function Feedback() {
  return (
    <>
      <Header title="Feedback" sub="Share an idea or report a mistake" />
      <main className="mx-auto flex max-w-2xl flex-col px-3 pt-3" style={{ height: "calc(100dvh - 9.5rem)" }}>
        <p className="mb-2 px-1 text-sm text-muted">
          Suggest a feature, tell us what was hard, or report a mistake in a book. Every answer is read by the team.
        </p>
        <iframe title="Feedback form" src={`${FEEDBACK_URL}?embedded=true`} className="min-h-0 w-full flex-1 rounded-2xl border border-line bg-white" />
        <a href={FEEDBACK_URL} target="_blank" rel="noopener" className="py-2 text-center text-xs font-bold text-muted underline underline-offset-4">
          Form not loading? Open it in the browser
        </a>
      </main>
    </>
  );
}

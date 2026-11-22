"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icon";

/** Top bar: optional back button, a title, and the settings gear. */
export default function Header({ title, back, sub, right }: { title: string; back?: string | true; sub?: string; right?: React.ReactNode }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-page/95 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-3 py-2">
        {back &&
          (back === true ? (
            <button onClick={() => router.back()} className="rounded-full p-2 text-ink" aria-label="Back">
              <Icon name="back" />
            </button>
          ) : (
            <Link href={back} className="rounded-full p-2 text-ink" aria-label="Back">
              <Icon name="back" />
            </Link>
          ))}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-extrabold leading-tight">{title}</h1>
          {sub && <p className="truncate text-xs text-muted">{sub}</p>}
        </div>
        {right}
        <Link href="/settings" className="rounded-full p-2 text-muted" aria-label="Settings">
          <Icon name="gear" />
        </Link>
      </div>
    </header>
  );
}

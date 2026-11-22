"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const tabs = [
  { href: "/", label: "Home", icon: "home", match: (p: string) => p === "/" },
  { href: "/books", label: "Books", icon: "book", match: (p: string) => ["/books", "/book", "/read", "/intro", "/glossary", "/search", "/bookmarks"].some((x) => p.startsWith(x)) },
  { href: "/audio", label: "Audio", icon: "audio", match: (p: string) => p.startsWith("/audio") },
  { href: "/resources", label: "Resources", icon: "links", match: (p: string) => p.startsWith("/resources") },
  { href: "/support", label: "Support", icon: "heart", match: (p: string) => p.startsWith("/support") },
];

export default function BottomNav() {
  const path = usePathname() || "/";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} aria-label="Main">
      <ul className="mx-auto flex max-w-2xl">
        {tabs.map((t) => {
          const active = t.match(path);
          return (
            <li key={t.href} className="flex-1">
              <Link href={t.href} className={`flex flex-col items-center gap-0.5 py-2 text-[0.7rem] font-semibold no-underline ${active ? "text-gold" : "text-muted"}`} aria-current={active ? "page" : undefined}>
                <Icon name={t.icon} className="h-6 w-6" filled={active && t.icon === "heart"} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

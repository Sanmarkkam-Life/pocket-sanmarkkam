import catalogJson from "@/public/data/catalog.json";
import type { Book, CatalogBook, DailyVerse, SearchRow } from "./types";

// The catalog is small, so it is bundled into the app. Whole books, the
// daily-verse pool and the search index are fetched when needed; the service
// worker keeps every fetched file, so a book opened once reads offline.
export const catalog = (catalogJson as { books: CatalogBook[] }).books;
export const catalogGenerated = (catalogJson as { generated: string }).generated;

export function catalogBook(id: string | null | undefined): CatalogBook | undefined {
  return catalog.find((b) => b.id === id);
}

export const collections = Array.from(new Set(catalog.map((b) => b.collection)));

const cache = new Map<string, Promise<unknown>>();

function getJson<T>(url: string): Promise<T> {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url).then((r) => {
        if (!r.ok) throw new Error(`Could not load ${url} (${r.status})`);
        return r.json();
      }).catch((e) => {
        cache.delete(url);
        throw e;
      }),
    );
  }
  return cache.get(url) as Promise<T>;
}

export const bookUrl = (id: string) => `/data/books/${id}.json`;
export const loadBook = (id: string) => getJson<Book>(bookUrl(id));
export const loadDaily = () => getJson<DailyVerse[]>("/data/daily.json");
export const loadSearch = () => getJson<SearchRow[]>("/data/search.json");

/** The same verse for everyone on the same calendar day. */
export function verseOfTheDay(pool: DailyVerse[], d = new Date()): DailyVerse {
  const start = Date.UTC(2026, 0, 1);
  const day = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - start) / 86400000);
  return pool[((day % pool.length) + pool.length) % pool.length];
}

/** Link to a passage in the reader. */
export function passageHref(bookId: string, passageId: string) {
  const [w, s] = passageId.split(".");
  return `/read?b=${bookId}&w=${w}&s=${s}#p-${passageId}`;
}

export function sectionHref(bookId: string, w: string, s: string) {
  return `/read?b=${bookId}&w=${w}&s=${s}`;
}

export const stripTags = (html: string) =>
  html.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

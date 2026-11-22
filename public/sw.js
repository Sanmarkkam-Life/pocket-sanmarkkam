/* Pocket Sanmarkkam service worker: hand-written, no dependencies.
 *
 * - App pages: network first; offline, the last copy of that page (the reader
 *   is one page, /read, whatever the book, so one visit covers every book).
 * - App code, icons, fonts: cache first.
 * - Book data (/data/...): cache first, refreshed in the background, so a book
 *   opened once reads offline and picks up re-exports quietly.
 * - Audio and other sites: not touched (streamed from sanmarkkamlife.org).
 * Bump VERSION when this file changes.
 */
const VERSION = "v2";
const CACHE = `pocket-sanmarkkam-${VERSION}`;
const PAGES = ["/", "/books", "/book", "/read", "/intro", "/glossary", "/search", "/bookmarks", "/karunai", "/audio", "/resources", "/support", "/settings"];

async function precache() {
  const cache = await caches.open(CACHE);
  for (const path of PAGES) {
    try {
      const res = await fetch(path, { cache: "reload" });
      if (!res.ok) continue;
      const html = await res.clone().text();
      await cache.put(path, res);
      // also keep the scripts and styles each page needs, so it opens offline
      const assets = Array.from(new Set(html.match(/\/_next\/static\/[^"'\s)]+/g) || []));
      await Promise.all(assets.map((a) => cache.match(a).then((hit) => hit || cache.add(a).catch(() => {}))));
    } catch {
      /* offline during install: pages fill in as they are visited */
    }
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("pocket-sanmarkkam-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const ok = (req, res) => res && res.status === 200 && !req.headers.has("range");

async function cacheFirst(req, refresh) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit && !refresh) return hit;
  const net = fetch(req)
    .then((res) => {
      if (ok(req, res)) cache.put(req, res.clone()).catch(() => {});
      return res;
    })
    .catch(() => undefined);
  return hit || (await net) || Response.error();
}

async function page(req, url) {
  const cache = await caches.open(CACHE);
  const key = url.pathname; // one copy per page, whatever the ?query
  try {
    const res = await fetch(req);
    if (ok(req, res)) cache.put(key, res.clone()).catch(() => {});
    return res;
  } catch {
    return (await cache.match(key)) || (await cache.match("/")) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(page(req, url));
  } else if (url.pathname.startsWith("/data/")) {
    event.respondWith(cacheFirst(req, true));
  } else if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/brand/") || url.pathname.endsWith(".woff2")) {
    event.respondWith(cacheFirst(req, false));
  }
  // everything else (RSC requests, manifest): the network as usual
});

// "Continue reading": the last place read, on this phone only.
export type LastRead = { book: string; w: string; s: string; p?: string; label: string; at: number };
const KEY = "pocket_last_read_v1";

export function saveLastRead(v: Omit<LastRead, "at">) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...v, at: Date.now() }));
  } catch {}
}

export function loadLastRead(): LastRead | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v && v.book && v.w && v.s ? v : null;
  } catch {
    return null;
  }
}

export function lastReadHref(v: LastRead) {
  return `/read?b=${v.book}&w=${v.w}&s=${v.s}${v.p ? `#p-${v.p}` : ""}`;
}

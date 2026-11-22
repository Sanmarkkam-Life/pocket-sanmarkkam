// KarunAI runs on sanmarkkamlife.org (14 KarunAI, WPCode snippet 4362). The app only sends the
// conversation; the instructions, the books search, the model and the limits stay on the website.
export const KARUNAI_URL = "https://sanmarkkamlife.org/wp-admin/admin-ajax.php?action=karunai_chat";
export const DAILY_LIMIT = 10; // same as the website page: questions per day on one phone

export type Msg = { role: "user" | "assistant"; content: string; sources?: string[] };

const CHAT_KEY = "pocket_karunai_chat_v1";
const COUNT_KEY = "pocket_karunai_count_v1";
const today = () => new Date().toISOString().slice(0, 10);

export function loadChat(): Msg[] {
  try {
    const v = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
export function saveChat(m: Msg[]) {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(m.slice(-40)));
  } catch {}
}

export function usedToday(): number {
  try {
    const v = JSON.parse(localStorage.getItem(COUNT_KEY) || "{}");
    return v.day === today() ? Number(v.n) || 0 : 0;
  } catch {
    return 0;
  }
}
function countOne() {
  try {
    localStorage.setItem(COUNT_KEY, JSON.stringify({ day: today(), n: usedToday() + 1 }));
  } catch {}
}

/** Ask KarunAI. text/plain keeps it a "simple" request (no preflight); the server reads the JSON body anyway. */
export async function ask(history: Msg[]): Promise<{ text: string; sources: string[]; ok: boolean }> {
  const messages = history.filter((m) => m.content.trim()).slice(-10).map(({ role, content }) => ({ role, content }));
  try {
    const r = await fetch(KARUNAI_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: JSON.stringify({ messages }) });
    const data = await r.json();
    const text = (data?.content ?? []).map((c: { text?: string }) => c.text ?? "").join("").trim();
    if (r.ok) countOne();
    return { text: text || "KarunAI is resting for a moment. Please try again shortly. 🙏", sources: r.ok ? data?.sources ?? [] : [], ok: r.ok };
  } catch {
    return { text: "KarunAI needs the internet. Please check your connection and try again. 🙏", sources: [], ok: false };
  }
}

/** Very small markdown: paragraphs, **bold**, *italic*, and "- " lists. Text is escaped first. */
export function renderAnswer(md: string): string {
  const esc = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) =>
    s
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<i>$2</i>")
      .replace(/^#{1,4}\s*(.+)$/, "<b>$1</b>");
  return esc
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n");
      if (lines.every((l) => /^\s*([-*•]|\d+\.)\s+/.test(l))) {
        return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*([-*•]|\d+\.)\s+/, ""))}</li>`).join("")}</ul>`;
      }
      return `<p>${lines.map(inline).join("<br>")}</p>`;
    })
    .join("");
}

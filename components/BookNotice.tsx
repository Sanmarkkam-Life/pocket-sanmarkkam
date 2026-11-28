// A short notice shown on a book's page, its introduction and at the top of the reader.
// Maruthuva: the user's decision (28 Nov 2026) to include it with a clear "not medical advice" notice.
const NOTICES: Record<string, string> = {
  maruthuva:
    "These are Vallalar’s historical medical and herbal writings, shared for study. They are not health or medical advice. For any health matter, please see a qualified doctor or specialist.",
};

export default function BookNotice({ id }: { id?: string | null }) {
  const text = id ? NOTICES[id] : undefined;
  if (!text) return null;
  return (
    <p role="note" className="my-3 rounded-lg border border-gold/60 bg-gold/10 px-3 py-2 text-sm font-semibold">
      {text}
    </p>
  );
}

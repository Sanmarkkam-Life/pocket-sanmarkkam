import Header from "@/components/Header";
import Icon from "@/components/Icon";
import { support } from "@/lib/links";

export const metadata = { title: "Support" };

export default function Support() {
  return (
    <>
      <Header title="Support" sub="Keep the teachings free for everyone" />
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-5">
        <p className="reading font-read">
          This app, the books and the recordings are offered freely, to anyone, anywhere. They are made by volunteers and carried by
          gifts. If they have helped you, you can help the next reader.
        </p>
        <ul className="mt-5 space-y-3">
          {support.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noopener" className={`card flex items-center gap-4 p-4 text-ink no-underline ${s.primary ? "border-gold" : ""}`}>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${s.primary ? "bg-gold text-white dark:text-[#1c160c]" : "bg-gold-soft text-gold"}`}>
                  <Icon name={s.icon} className="h-5 w-5" filled={s.icon === "heart"} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{s.title}</span>
                  <span className="block text-sm text-muted">{s.text}</span>
                </span>
                <Icon name="external" className="h-4 w-4 shrink-0 text-muted" />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-muted">These open the Sanmarkkam Life website. The app itself collects no payment and no personal data.</p>
      </main>
    </>
  );
}

import Header from "@/components/Header";
import Icon from "@/components/Icon";
import { resources } from "@/lib/links";

export const metadata = { title: "Resources" };

export default function Resources() {
  return (
    <>
      <Header title="Resources" sub="Everything else Sanmarkkam Life offers" />
      <main className="mx-auto max-w-2xl px-4 pb-8">
        {resources.map((g) => (
          <section key={g.group} className="pt-5">
            <h2 className="label mb-2">{g.group}</h2>
            <ul className="card divide-y divide-line">
              {g.items.map((it) => (
                <li key={it.href}>
                  <a href={it.href} target="_blank" rel="noopener" className="flex items-center gap-3 px-4 py-3 text-ink no-underline">
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{it.title}</span>
                      <span className="block text-sm text-muted">{it.text}</span>
                    </span>
                    <Icon name="external" className="h-4 w-4 shrink-0 text-muted" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </>
  );
}

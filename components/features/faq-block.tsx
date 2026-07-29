import type { FaqItem } from "@/lib/faq-content";

/**
 * Collapsed Q&A under a setup step or settings card.
 *
 * Native <details>/<summary> on purpose: keyboard and screen-reader support come
 * free, it works before hydration, and it needs no dependency for what is a
 * disclosure triangle.
 */
export function FaqBlock({
  items,
  title = "Common questions",
}: {
  items: FaqItem[];
  title?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-6 border-t border-gray-100 pt-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        {title}
      </h3>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <details key={item.q} className="group rounded-lg px-2 py-1.5 hover:bg-gray-50">
            <summary className="cursor-pointer list-none text-sm font-medium text-foreground marker:content-['']">
              <span className="mr-1.5 inline-block text-gray-400 transition-transform group-open:rotate-90">
                ›
              </span>
              {item.q}
            </summary>
            <p className="mt-1.5 pl-5 pr-2 text-[13px] leading-relaxed text-gray-600">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

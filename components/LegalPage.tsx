"use client";

import PageHeader from "@/components/PageHeader";
import { useLocale } from "@/components/LocaleProvider";
import { legal } from "@/content/legal";
import { legalTexts } from "@/content/legal-texts";
import { fill } from "@/content/dictionaries";

/**
 * Impaginazione comune alle tre pagine legali (privacy, cookie, termini).
 *
 * I testi arrivano da `content/legal-texts.ts` nella lingua corrente; qui
 * c'è solo la resa tipografica: una colonna di lettura stretta, come un
 * libro, con l'indice delle sezioni a lato su desktop. Le sezioni sono `h2`
 * perché l'unico `h1` della pagina lo mette PageHeader: saltare un livello
 * romperebbe la gerarchia per chi naviga con uno screen reader.
 */
export default function LegalPage({
  doc,
}: {
  doc: "privacy" | "cookies" | "terms";
}) {
  const { dict, locale } = useLocale();
  const document = legalTexts[locale][doc];
  const lastUpdated = fill(dict.legalPage.lastUpdated, { date: legal.privacy.lastUpdated });

  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-12 md:px-10 md:pb-28 md:pt-20">
      <PageHeader section={doc} />

      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        {document.sections.length > 3 && (
          <nav aria-label={dict[doc].title} className="hidden md:col-span-3 md:block">
            <ol className="sticky top-[calc(var(--header-height)+2rem)] flex flex-col gap-2 text-sm text-mid">
              {document.sections.map((section, i) => (
                <li key={section.heading}>
                  <a
                    href={`#sezione-${i + 1}`}
                    className="flex gap-3 rounded-sm py-1 transition-colors hover:text-charcoal focus-visible:outline-2 focus-visible:outline-bordeaux"
                  >
                    <span className="tabular w-5 flex-none font-display italic text-bordeaux">{i + 1}</span>
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <article className="max-w-[40rem] md:col-span-8 md:col-start-5">
          <p className="font-display text-[1.45rem] leading-[1.45] md:text-[1.6rem]">{document.intro}</p>

          {document.sections.map((section, i) => (
            <section key={section.heading} id={`sezione-${i + 1}`} className="mt-12 border-t border-divider pt-8">
              <h2 className="flex items-baseline gap-3 font-display text-[1.6rem] leading-tight md:text-[1.85rem]">
                <span className="tabular text-lg italic text-bordeaux">{i + 1}</span>
                {section.heading}
              </h2>

              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-[1rem] leading-[1.75] text-charcoal/85">
                  {paragraph}
                </p>
              ))}

              {section.items && section.items.length > 0 && (
                <ul className="mt-4 flex flex-col gap-2 text-[1rem] leading-[1.7] text-charcoal/85">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden="true" className="mt-[0.7em] h-1 w-3 flex-none bg-bordeaux" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <p className="mt-16 border-t border-divider pt-5 text-xs text-mid">{lastUpdated}</p>
        </article>
      </div>
    </div>
  );
}

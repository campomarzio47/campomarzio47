"use client";

import PageHeader from "@/components/PageHeader";
import { useLocale } from "@/components/LocaleProvider";
import { legal } from "@/content/legal";
import { legalTexts } from "@/content/legal-texts";

/**
 * Impaginazione comune alle tre pagine legali (privacy, cookie, termini).
 *
 * I testi arrivano da `content/legal-texts.ts` nella lingua corrente; qui
 * c'è solo la resa tipografica. Le sezioni sono `h2` perché l'unico `h1`
 * della pagina lo mette PageHeader: saltare un livello romperebbe la
 * gerarchia per chi naviga con uno screen reader.
 */
export default function LegalPage({
  doc,
}: {
  doc: "privacy" | "cookies" | "terms";
}) {
  const { dict, locale } = useLocale();
  const document = legalTexts[locale][doc];
  const lastUpdated = dict.legalPage.lastUpdated.replace(
    "{date}",
    legal.privacy.lastUpdated,
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
      <PageHeader section={doc} />

      <p className="text-base leading-relaxed text-charcoal/90">{document.intro}</p>

      {document.sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="font-display text-xl md:text-2xl">{section.heading}</h2>

          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-sm leading-relaxed text-charcoal/90">
              {paragraph}
            </p>
          ))}

          {section.items && section.items.length > 0 && (
            <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-charcoal/90 marker:text-bordeaux">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <p className="mt-12 border-t border-divider pt-4 text-xs text-mid">{lastUpdated}</p>
    </div>
  );
}

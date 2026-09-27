"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { property } from "@/content/property";
import { legal, controllerName, controllerAddress } from "@/content/legal";

/**
 * Footer con i dati identificativi dell'attività e i link alle pagine
 * legali, su ogni pagina del sito.
 *
 * Non è decorativo: assolve a due obblighi distinti.
 * - Il CIN (Codice Identificativo Nazionale) va indicato in OGNI annuncio
 *   ovunque pubblicato, sito di prenotazione diretta compreso — art. 13-ter
 *   DL 145/2023. Per questo è in evidenza e non in mezzo agli altri dati.
 * - I dati del prestatore (denominazione, sede, P.IVA, contatti) vanno resi
 *   accessibili in modo facile e permanente — art. 7 D.Lgs. 70/2003.
 *
 * I campi vuoti di `content/legal.ts` vengono semplicemente omessi: meglio
 * una riga in meno che un segnaposto sotto gli occhi di un ospite. L'elenco
 * di cosa compilare è in LEGALE.md.
 *
 * Il padding inferiore abbondante serve a non finire sotto la barra
 * "Verifica disponibilità", che in home è `fixed` in fondo allo schermo.
 */
export default function Footer() {
  const { dict } = useLocale();
  const { business, codes } = legal;

  const legalLines = [
    business.vatNumber && `${dict.footer.vatLabel} ${business.vatNumber}`,
    business.taxCode && `${dict.footer.taxCodeLabel} ${business.taxCode}`,
    business.rea && `${dict.footer.reaLabel} ${business.rea}`,
    business.pec && `PEC ${business.pec}`,
  ].filter(Boolean) as string[];

  const linkClasses =
    "rounded-sm underline underline-offset-4 transition-colors hover:text-bordeaux focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux";

  return (
    <footer className="border-t border-divider px-6 pt-12 pb-28 text-sm md:px-10 md:pb-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="font-display text-base text-charcoal">
              {dict.footer.legalHeading}
            </h2>
            <address className="mt-3 flex flex-col gap-1 text-xs not-italic leading-relaxed text-mid">
              <span className="text-charcoal">{controllerName()}</span>
              <span>{controllerAddress()}</span>
              {legalLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>

            {codes.cin && (
              <p className="mt-4 inline-flex items-baseline gap-2 rounded-md border border-divider px-3 py-1.5">
                <span className="text-[11px] uppercase tracking-wide text-mid">
                  {dict.footer.cinLabel}
                </span>
                <span className="font-medium tracking-wide text-charcoal">{codes.cin}</span>
              </p>
            )}
            {codes.cir && (
              <p className="mt-2 text-xs text-mid">
                {dict.footer.cirLabel} {codes.cir}
              </p>
            )}
          </div>

          <div>
            <h2 className="font-display text-base text-charcoal">
              {dict.footer.contactHeading}
            </h2>
            <ul className="mt-3 flex flex-col gap-1 text-xs text-mid">
              <li>
                <a
                  href={`tel:${property.host.phone.replace(/\s/g, "")}`}
                  className={linkClasses}
                >
                  {property.host.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${business.email}`} className={linkClasses}>
                  {business.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-divider pt-6 text-xs text-mid sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className={linkClasses}>
              {dict.footer.privacyLink}
            </Link>
            <Link href="/cookie-policy" className={linkClasses}>
              {dict.footer.cookiesLink}
            </Link>
            <Link href="/termini" className={linkClasses}>
              {dict.footer.termsLink}
            </Link>
          </nav>
          <p>
            © {new Date().getFullYear()} {controllerName()}
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useLocale } from "@/components/LocaleProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Wordmark } from "@/components/Header";
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
 * In home il padding inferiore è più alto: la barra delle date resta fissa
 * in fondo allo schermo e non deve coprire le ultime righe.
 */
export default function Footer() {
  const { dict } = useLocale();
  const pathname = usePathname();
  const { business, codes } = legal;

  const legalLines = [
    business.vatNumber && `${dict.footer.vatLabel} ${business.vatNumber}`,
    business.taxCode && `${dict.footer.taxCodeLabel} ${business.taxCode}`,
    business.rea && `${dict.footer.reaLabel} ${business.rea}`,
    business.pec && `PEC ${business.pec}`,
  ].filter(Boolean) as string[];

  const linkClasses =
    "rounded-sm transition-colors hover:text-off-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-off-white";

  return (
    <footer className="relative bg-charcoal text-off-white/70">
      <div
        aria-hidden="true"
        className="checker h-3"
        style={{ "--checker-color": "var(--color-bordeaux)" } as CSSProperties}
      />
      <div
        className={`mx-auto max-w-7xl px-5 pt-16 md:px-10 md:pb-14 ${
          pathname === "/" ? "pb-32" : "pb-12"
        }`}
      >
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link
              href="/"
              className="inline-block text-[2.5rem] leading-none text-off-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-off-white md:text-[3.25rem]"
            >
              <Wordmark />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">{property.address.full}</p>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-off-white/45">
              {dict.footer.contactHeading}
            </h2>
            <ul className="mt-4 flex flex-col text-sm">
              <li>
                <a
                  href={`tel:${property.host.phone.replace(/\s/g, "")}`}
                  className={`${linkClasses} inline-flex min-h-11 items-center`}
                >
                  {property.host.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className={`${linkClasses} inline-flex min-h-11 items-center break-all`}
                >
                  {business.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-off-white/45">
              {dict.footer.legalHeading}
            </h2>
            <address className="mt-4 flex flex-col gap-1 text-sm not-italic leading-relaxed">
              <span className="text-off-white/90">{controllerName()}</span>
              <span>{controllerAddress()}</span>
              {legalLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>

            {codes.cin && (
              <p className="mt-5 inline-flex items-baseline gap-3 rounded-full border border-off-white/20 px-4 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-off-white/50">
                  {dict.footer.cinLabel}
                </span>
                <span className="font-medium tracking-wide text-off-white">{codes.cin}</span>
              </p>
            )}
            {codes.cir && (
              <p className="mt-2 text-xs">
                {dict.footer.cirLabel} {codes.cir}
              </p>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-off-white/10 pt-6 text-xs md:flex-row md:items-center md:justify-between">
          <nav aria-label={dict.footer.legalHeading} className="flex flex-wrap gap-x-6">
            <Link href="/privacy" className={`${linkClasses} inline-flex min-h-11 items-center`}>
              {dict.footer.privacyLink}
            </Link>
            <Link href="/cookie-policy" className={`${linkClasses} inline-flex min-h-11 items-center`}>
              {dict.footer.cookiesLink}
            </Link>
            <Link href="/termini" className={`${linkClasses} inline-flex min-h-11 items-center`}>
              {dict.footer.termsLink}
            </Link>
          </nav>
          <LanguageSwitcher tone="light" className="-ml-1.5" />
          <p>
            © {new Date().getFullYear()} {controllerName()}
          </p>
        </div>
      </div>
    </footer>
  );
}

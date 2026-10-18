"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

/**
 * Casella di presa visione dell'informativa privacy, comune ai tre moduli
 * del sito.
 *
 * Volutamente NON è una richiesta di consenso. Per il check-in il
 * trattamento è un obbligo di legge (art. 6.1.c GDPR), per contatti e
 * richiesta di prenotazione è l'esecuzione di misure precontrattuali
 * (art. 6.1.b): in nessuno dei tre casi il consenso è la base giuridica
 * corretta, e chiederlo lascerebbe credere a un diritto di revoca che non
 * esiste. Qui l'utente dichiara di aver letto, non autorizza.
 *
 * Con la prenotazione pagata (`withTerms`) la stessa casella accetta anche
 * le condizioni di prenotazione: quella è un'accettazione contrattuale,
 * non un consenso privacy, e due caselle in fila sarebbero solo un
 * passaggio in più.
 */
export default function PrivacyAck({
  checked,
  onChange,
  id = "privacy-ack",
  withTerms = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  /** Prenotazione pagata: la stessa casella accetta anche i Termini. */
  withTerms?: boolean;
}) {
  const { dict } = useLocale();
  const label = withTerms ? dict.privacyAck.withTerms : dict.privacyAck.label;
  // "{terms}" (se c'è) viene prima di "{link}" in tutte e tre le lingue.
  const [beforeTerms, rest] = label.includes("{terms}") ? label.split("{terms}") : ["", label];
  const [before, after] = rest.split("{link}");
  const linkClass =
    "rounded-sm text-charcoal underline underline-offset-4 hover:text-bordeaux focus-visible:outline-2 focus-visible:outline-bordeaux";

  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[0.8125rem] leading-relaxed text-mid">
      <input
        id={id}
        name={id}
        required
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-bordeaux focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux"
      />
      <span>
        {withTerms && (
          <>
            {beforeTerms}
            <Link href="/termini" onClick={(e) => e.stopPropagation()} className={linkClass}>
              {dict.privacyAck.termsLinkText}
            </Link>
          </>
        )}
        {before}
        <Link
          href="/privacy"
          // Il link sta dentro la label: senza questo, aprirlo
          // spunterebbe anche la casella.
          onClick={(e) => e.stopPropagation()}
          className={linkClass}
        >
          {dict.privacyAck.linkText}
        </Link>
        {after}
      </span>
    </label>
  );
}

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
 */
export default function PrivacyAck({
  checked,
  onChange,
  id = "privacy-ack",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}) {
  const { dict } = useLocale();
  const [before, after] = dict.privacyAck.label.split("{link}");

  return (
    <label htmlFor={id} className="flex items-start gap-3 text-xs leading-relaxed text-mid">
      <input
        id={id}
        name={id}
        required
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-bordeaux focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux focus-visible:ring-offset-2"
      />
      <span>
        {before}
        <Link
          href="/privacy"
          // Il link sta dentro la label: senza questo, aprirlo
          // spunterebbe anche la casella.
          onClick={(e) => e.stopPropagation()}
          className="rounded-sm underline underline-offset-4 hover:text-bordeaux focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux"
        >
          {dict.privacyAck.linkText}
        </Link>
        {after}
      </span>
    </label>
  );
}

import { property } from "@/content/property";
import type { BusyRange } from "@/lib/ical";

/**
 * Numero di notti fra due date in formato YYYY-MM-DD.
 *
 * Le date sono trattate come UTC di proposito: con l'ora locale, il
 * passaggio all'ora legale fra check-in e check-out sposterebbe la
 * differenza di un'ora e l'arrotondamento potrebbe restituire una notte
 * in più o in meno.
 */
export function nightsBetween(checkinIso: string, checkoutIso: string): number {
  const start = new Date(`${checkinIso}T00:00:00Z`);
  const end = new Date(`${checkoutIso}T00:00:00Z`);
  return Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Totale indicativo del soggiorno, in euro interi.
 *
 * È un preventivo, non un importo dovuto: il sito non incassa nulla e il
 * prezzo che fa fede è quello dell'email di conferma dell'host (vedi
 * /termini). Per questo lavoriamo in euro e non in centesimi.
 */
export function computeStayTotal(nights: number): number {
  const { pricePerNight, cleaningFee } = property.pricing;
  return pricePerNight * nights + cleaningFee;
}

function todayUtcMidnightMs(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function isoFromMs(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Prima data di check-in accettata rispettando il preavviso minimo
// (property.pricing.minAdvanceDays). Date trattate come UTC, coerentemente
// con nightsBetween qui sopra.
export function earliestCheckinIso(): string {
  const days = property.pricing.minAdvanceDays || 0;
  return isoFromMs(todayUtcMidnightMs() + days * 24 * 60 * 60 * 1000);
}

// Range "occupato" sintetico da aggiungere ai busy range reali (iCal), per
// nascondere sul calendario le date troppo vicine a oggi anche quando la
// piattaforma di origine (es. Booking.com) non le segnala come tali nel
// proprio export iCal — l'export riporta solo le prenotazioni vere e
// proprie, non il preavviso minimo impostato sulla piattaforma.
export function leadTimeBusyRange(): BusyRange | null {
  const days = property.pricing.minAdvanceDays || 0;
  if (days <= 0) return null;
  return { start: isoFromMs(todayUtcMidnightMs()), end: earliestCheckinIso() };
}

import { property } from "@/content/property";
import type { BusyRange } from "@/lib/ical";

// Prezzo totale del soggiorno in centesimi (per gli importi passati a
// Stripe, che lavora sempre in unità minime della valuta).
export function computeStayTotalCents(nights: number): number {
  const { pricePerNight, cleaningFee } = property.pricing;
  return Math.round((pricePerNight * nights + cleaningFee) * 100);
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
// con lib/booking-metadata.ts.
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

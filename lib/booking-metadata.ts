import { isLocale, defaultLocale, type Locale } from "@/lib/locale";

/**
 * Dati della prenotazione salvati nei metadata del PaymentIntent Stripe.
 *
 * Sono l'unico archivio della prenotazione: il sito non ha una tabella
 * delle prenotazioni, e la dashboard Stripe mostra tutto all'host. I
 * metadata accettano solo stringhe, al massimo 500 caratteri ciascuna:
 * per questo il messaggio dell'ospite è limitato a 500 caratteri anche nel
 * modulo.
 */
export type BookingMetadata = {
  checkin: string; // AAAA-MM-GG
  checkout: string; // AAAA-MM-GG
  guests: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestMessage: string;
  guestLocale: Locale;
};

export const MESSAGE_MAX = 500;

export function toStripeMetadata(data: BookingMetadata): Record<string, string> {
  return { ...data, guestMessage: data.guestMessage.slice(0, MESSAGE_MAX) };
}

export function fromStripeMetadata(metadata: Record<string, string> | null | undefined): BookingMetadata {
  if (!metadata) throw new Error("Metadata prenotazione mancanti.");
  const { checkin, checkout, guests, guestName, guestEmail } = metadata;
  if (!checkin || !checkout || !guests || !guestName || !guestEmail) {
    throw new Error("Metadata prenotazione incompleti.");
  }
  return {
    checkin,
    checkout,
    guests,
    guestName,
    guestEmail,
    guestPhone: metadata.guestPhone || "",
    guestMessage: metadata.guestMessage || "",
    guestLocale: isLocale(metadata.guestLocale) ? metadata.guestLocale : defaultLocale,
  };
}

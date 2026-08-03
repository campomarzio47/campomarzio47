// Forma dei dati della prenotazione salvati nei metadata del PaymentIntent
// Stripe: e' l'unico "archivio" della prenotazione (nessun database, vedi
// il piano). Tutti i valori sono stringhe perche' i metadata Stripe
// accettano solo stringhe.
export type BookingMetadata = {
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  guests: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestLocale: "it" | "en";
};

export function toStripeMetadata(data: BookingMetadata): Record<string, string> {
  return { ...data };
}

export function fromStripeMetadata(
  metadata: Record<string, string> | null | undefined,
): BookingMetadata {
  if (!metadata) {
    throw new Error("Metadata prenotazione mancanti.");
  }
  const { checkin, checkout, guests, guestName, guestEmail, guestPhone, guestLocale } =
    metadata;
  if (!checkin || !checkout || !guests || !guestName || !guestEmail) {
    throw new Error("Metadata prenotazione incompleti.");
  }
  return {
    checkin,
    checkout,
    guests,
    guestName,
    guestEmail,
    guestPhone: guestPhone || "",
    guestLocale: guestLocale === "en" ? "en" : "it",
  };
}

export function nightsBetween(checkinIso: string, checkoutIso: string): number {
  const start = new Date(`${checkinIso}T00:00:00Z`);
  const end = new Date(`${checkoutIso}T00:00:00Z`);
  return Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

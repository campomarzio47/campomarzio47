import { property } from "@/content/property";

// Prezzo totale del soggiorno in centesimi (per gli importi passati a
// Stripe, che lavora sempre in unità minime della valuta).
export function computeStayTotalCents(nights: number): number {
  const { pricePerNight, cleaningFee } = property.pricing;
  return Math.round((pricePerNight * nights + cleaningFee) * 100);
}

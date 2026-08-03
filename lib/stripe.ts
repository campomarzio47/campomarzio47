import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;

  // .trim(): un copia-incolla della chiave nella dashboard Vercel include
  // facilmente uno spazio o un a-capo finale, che manda in errore la
  // richiesta HTTP a Stripe (header Authorization non valido) senza un
  // messaggio ovvio.
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("Pagamenti non configurati: impostare STRIPE_SECRET_KEY.");
  }

  cached = new Stripe(key);
  return cached;
}

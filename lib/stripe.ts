import Stripe from "stripe";

let cached: Stripe | null = null;

// .trim(): un copia-incolla della chiave nella dashboard include facilmente
// uno spazio o un a-capo finale, che manda in errore la richiesta HTTP a
// Stripe (header Authorization non valido) senza un messaggio ovvio.
const env = (name: string) => process.env[name]?.trim() || "";

/**
 * Pagamenti attivi solo con tutte e tre le chiavi: quella segreta di
 * Stripe, il segreto del webhook (senza, l'host non verrebbe mai avvisato
 * di una richiesta pagata) e il segreto che firma i link Conferma/Rifiuta.
 * Se ne manca una il sito torna da solo alla semplice richiesta via email,
 * e Termini e informativa lo dicono: meglio di un bottone "Paga" che poi
 * fallisce.
 */
export function paymentsEnabled(): boolean {
  return Boolean(env("STRIPE_SECRET_KEY") && env("STRIPE_WEBHOOK_SECRET") && env("BOOKING_TOKEN_SECRET"));
}

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = env("STRIPE_SECRET_KEY");
  if (!key) throw new Error("Pagamenti non configurati: impostare STRIPE_SECRET_KEY.");
  // Client basato su fetch: funziona uguale in Node e su Cloudflare
  // Workers, dove il modulo http di Node non è quello che Stripe si aspetta.
  cached = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
  return cached;
}

/** Verifica la firma di un evento webhook con WebCrypto (Node e Workers). */
export async function verifyWebhook(payload: string, signature: string): Promise<Stripe.Event> {
  return getStripe().webhooks.constructEventAsync(
    payload,
    signature,
    env("STRIPE_WEBHOOK_SECRET"),
    undefined,
    Stripe.createSubtleCryptoProvider(),
  );
}

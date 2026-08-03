import { createHmac, timingSafeEqual } from "crypto";

// Stessa finestra dell'autorizzazione automatica di Stripe: oltre questo
// termine il link risulta "scaduto" anche se l'host non ha mai agito.
export const BOOKING_ACTION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.BOOKING_TOKEN_SECRET;
  if (!secret) {
    throw new Error("BOOKING_TOKEN_SECRET non configurato.");
  }
  return secret;
}

// Firma legata a (paymentIntentId, scadenza): non codifica quale azione
// (conferma/rifiuto) verrà scelta — quella è determinata da quale dei due
// bottoni/route l'host sceglie sulla pagina di destinazione, non dal link.
function sign(paymentIntentId: string, exp: number): string {
  return createHmac("sha256", getSecret())
    .update(`${paymentIntentId}.${exp}`)
    .digest("hex");
}

export function signBookingAction(paymentIntentId: string): { exp: number; sig: string } {
  const exp = Date.now() + BOOKING_ACTION_TTL_MS;
  return { exp, sig: sign(paymentIntentId, exp) };
}

export function verifyBookingAction(
  paymentIntentId: string,
  exp: number,
  sig: string,
): boolean {
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  if (!/^[0-9a-f]+$/i.test(sig)) return false;

  const expected = sign(paymentIntentId, exp);
  const expectedBuf = Buffer.from(expected, "hex");
  const sigBuf = Buffer.from(sig, "hex");
  if (expectedBuf.length !== sigBuf.length) return false;

  return timingSafeEqual(expectedBuf, sigBuf);
}

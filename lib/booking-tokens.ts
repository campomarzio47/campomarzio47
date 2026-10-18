import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Firma dei link "Conferma / Rifiuta" che l'host riceve via email.
 *
 * Non c'è un pannello con login: chi ha il link può decidere, quindi il
 * link è firmato (HMAC) e scade. Stessa durata massima dell'autorizzazione
 * sulla carta: oltre, non ci sarebbe più nulla da incassare.
 */
export const BOOKING_ACTION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.BOOKING_TOKEN_SECRET?.trim();
  if (!secret) throw new Error("BOOKING_TOKEN_SECRET non configurato.");
  return secret;
}

// Firma legata a (paymentIntentId, scadenza): non dice quale azione verrà
// scelta, quella la decide il bottone che l'host preme sulla pagina.
function sign(paymentIntentId: string, exp: number): string {
  return createHmac("sha256", getSecret()).update(`${paymentIntentId}.${exp}`).digest("hex");
}

export function signBookingAction(paymentIntentId: string): { exp: number; sig: string } {
  const exp = Date.now() + BOOKING_ACTION_TTL_MS;
  return { exp, sig: sign(paymentIntentId, exp) };
}

export function verifyBookingAction(paymentIntentId: string, exp: number, sig: string): boolean {
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  if (!/^[0-9a-f]{64}$/i.test(sig)) return false;
  return timingSafeEqual(Buffer.from(sign(paymentIntentId, exp), "hex"), Buffer.from(sig, "hex"));
}

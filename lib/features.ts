import { getDb } from "@/lib/db";
import { paymentsEnabled } from "@/lib/stripe";
import type { SiteFeatures } from "@/content/legal-texts";

/**
 * Cosa è attivo su questo sito, deciso a ogni richiesta lato server:
 * pagamenti se ci sono le chiavi Stripe, offerte via email se c'è il
 * database. Pagine e testi legali si adattano: il sito non promette mai
 * qualcosa che in quel momento non fa.
 */
export function siteFeatures(): SiteFeatures {
  return { payments: paymentsEnabled(), newsletter: getDb() !== null };
}

import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Accesso al database D1 di Cloudflare (binding `DB` in wrangler.jsonc).
 *
 * Il database è facoltativo: su Vercel, in `next build` o in un sito
 * senza il binding non esiste, e `getDb()` restituisce null. Le funzioni
 * che lo usano (oggi solo l'elenco delle offerte via email) devono
 * semplicemente spegnersi, mai far fallire il resto della pagina.
 *
 * Modalità sincrona di proposito: quella asincrona, fuori da Workers,
 * proverebbe ad avviare wrangler — su Vercel, a ogni richiesta.
 */

// Il minimo dell'API D1 che usiamo, per non dipendere dai tipi globali di
// Workers.
export type D1Result<T = unknown> = { results?: T[]; meta: { changes: number } };
export type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  run<T = unknown>(): Promise<D1Result<T>>;
  first<T = unknown>(): Promise<T | null>;
};
export type D1 = {
  prepare(query: string): D1Statement;
  batch<T = unknown>(statements: D1Statement[]): Promise<D1Result<T>[]>;
};

export function getDb(): D1 | null {
  try {
    const { env } = getCloudflareContext();
    return ((env as unknown as Record<string, unknown>).DB as D1 | undefined) ?? null;
  } catch {
    return null;
  }
}

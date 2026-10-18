import { getDb } from "@/lib/db";
import type { Locale } from "@/lib/locale";

/**
 * Elenco di chi, alla fine del check-in, sceglie di ricevere le offerte
 * (al massimo tre email l'anno, spedite da scripts/offerte.mjs).
 *
 * Il minimo indispensabile: email, nome per il saluto, lingua, data
 * dell'ultimo soggiorno (dopo 24 mesi l'indirizzo si cancella, vedi
 * /privacy), il testo esatto del consenso con la sua data — è la prova di
 * cosa ha accettato — e un token casuale per disiscriversi senza login.
 * Disiscriversi cancella la riga: non resta nulla da conservare.
 *
 * La tabella si crea da sola al primo uso, così un sito nuovo non ha
 * migrazioni da lanciare.
 */
const SCHEMA = `CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  name TEXT NOT NULL,
  locale TEXT NOT NULL,
  last_stay TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  consented_at TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE
)`;

export async function subscribe(entry: {
  email: string;
  name: string;
  locale: Locale;
  stay: string;
  consentText: string;
}): Promise<void> {
  const db = getDb();
  if (!db) return;
  const token = crypto.randomUUID().replaceAll("-", "");
  await db.batch([
    db.prepare(SCHEMA),
    // Chi torna e si iscrive di nuovo aggiorna consenso e soggiorno, ma
    // tiene il suo token: i link nelle email già ricevute restano validi.
    db
      .prepare(
        `INSERT INTO subscribers (email, name, locale, last_stay, consent_text, consented_at, token)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(email) DO UPDATE SET
           name = excluded.name,
           locale = excluded.locale,
           last_stay = MAX(last_stay, excluded.last_stay),
           consent_text = excluded.consent_text,
           consented_at = excluded.consented_at`,
      )
      .bind(entry.email.trim(), entry.name, entry.locale, entry.stay, entry.consentText, new Date().toISOString(), token),
  ]);
}

/** L'indirizzo legato al token, o null se non c'è (più). */
export async function findSubscriber(token: string): Promise<string | null> {
  const db = getDb();
  if (!db || !/^[0-9a-f]{32}$/.test(token)) return null;
  try {
    const row = await db.prepare("SELECT email FROM subscribers WHERE token = ?").bind(token).first<{ email: string }>();
    return row?.email ?? null;
  } catch {
    // Tabella non ancora creata: nessuno si è mai iscritto.
    return null;
  }
}

export async function unsubscribe(token: string): Promise<boolean> {
  const db = getDb();
  if (!db || !/^[0-9a-f]{32}$/.test(token)) return false;
  try {
    const result = await db.prepare("DELETE FROM subscribers WHERE token = ?").bind(token).run();
    return result.meta.changes > 0;
  } catch {
    return false;
  }
}

import type { CheckInData, Guest } from "@/lib/checkin-types";
import { toItalianDate } from "@/lib/checkin-types";

/**
 * Generatore del tracciato "Alloggiati Web" (Polizia di Stato).
 *
 * ATTENZIONE: comune/stato di nascita, cittadinanza e luogo di rilascio del
 * documento richiedono un codice numerico ufficiale ISTAT a 9 cifre che
 * questo generatore NON conosce (va scaricato dal portale Alloggiati Web
 * dopo il login). Questi 3 campi vengono quindi lasciati come placeholder
 * "?????????" — il testo leggibile inserito dall'ospite resta comunque
 * disponibile nel riepilogo via email, per completarli in pochi secondi
 * prima del caricamento sul portale.
 */

const CODE_PLACEHOLDER = "?".repeat(9);

function padRight(value: string, length: number): string {
  return value.slice(0, length).padEnd(length, " ");
}

function padZero(value: number, length: number): string {
  return String(Math.max(0, value)).padStart(length, "0").slice(-length);
}

function tipoAlloggiato(index: number, total: number): "16" | "17" | "19" {
  if (total === 1) return "16";
  return index === 0 ? "17" : "19";
}

function buildLine(guest: Guest, index: number, total: number, data: CheckInData): string {
  const tipo = tipoAlloggiato(index, total);
  const permanenza = tipo === "19" ? "  " : padZero(data.notti, 2);

  return [
    tipo, // 2
    toItalianDate(data.dataArrivo), // 10
    permanenza, // 2
    padRight(guest.cognome.toUpperCase(), 50), // 50
    padRight(guest.nome.toUpperCase(), 30), // 30
    guest.sesso, // 1
    toItalianDate(guest.dataNascita), // 10
    CODE_PLACEHOLDER, // 9 — comune/stato nascita (da completare)
    padRight(guest.provinciaNascita.toUpperCase() || "EE", 2), // 2
    CODE_PLACEHOLDER, // 9 — cittadinanza (da completare)
    padRight(guest.tipoDocumento, 5), // 5
    padRight(guest.numeroDocumento, 20), // 20
    CODE_PLACEHOLDER, // 9 — luogo rilascio documento (da completare)
  ].join("");
}

export function buildAlloggiatiFile(data: CheckInData): {
  filename: string;
  buffer: Buffer;
} {
  const lines = data.guests.map((guest, i) =>
    buildLine(guest, i, data.guests.length, data),
  );
  const text = lines.join("\r\n") + "\r\n";

  return {
    filename: `alloggiati_${data.dataArrivo}.txt`,
    buffer: Buffer.from(text, "latin1"),
  };
}

import type { CheckInData } from "@/lib/checkin-types";
import { toItalianDate } from "@/lib/checkin-types";

/**
 * Generatore per l'Osservatorio Regionale Ross1000 (flussi turistici, Regione
 * Veneto). Tracciato distinto da Alloggiati Web: qui non serve il documento
 * d'identità, servono dati aggregati su cittadinanza/residenza degli ospiti.
 *
 * Colonne e delimitatore verificati sulla documentazione pubblica del
 * tracciato Ross1000, ma vanno confermati dall'utente scaricando il
 * tracciato ufficiale dal portale (sezione Manuali/Tracciati) prima del
 * primo invio reale: se l'ordine delle colonne differisse, la modifica in
 * questo file è di poche righe.
 */

const HEADER = [
  "Cognome",
  "Nome",
  "Sesso",
  "DataNascita",
  "Cittadinanza",
  "ComuneStatoResidenza",
  "ProvinciaResidenza",
  "DataArrivo",
  "Notti",
  "NumeroOspiti",
].join(";");

function escapeCsv(value: string): string {
  return value.replace(/;/g, ",");
}

export function buildRoss1000File(data: CheckInData): {
  filename: string;
  buffer: Buffer;
} {
  const rows = data.guests.map((guest) =>
    [
      escapeCsv(guest.cognome),
      escapeCsv(guest.nome),
      guest.sesso,
      toItalianDate(guest.dataNascita),
      escapeCsv(guest.cittadinanza),
      escapeCsv(guest.comuneStatoResidenza),
      escapeCsv(guest.provinciaResidenza),
      toItalianDate(data.dataArrivo),
      String(data.notti),
      String(data.guests.length),
    ].join(";"),
  );

  const text = [HEADER, ...rows].join("\r\n") + "\r\n";

  return {
    filename: `ross1000_${data.dataArrivo}.csv`,
    buffer: Buffer.from(text, "latin1"),
  };
}

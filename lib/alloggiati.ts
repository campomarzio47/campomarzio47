import type { CheckInData, Guest, PrimaryGuestExtra } from "@/lib/checkin-types";
import { ITALIA_CODE, provinciaByComuneCode } from "@/lib/reference-data";

/**
 * Generatore del file .txt per il portale "Alloggiati Web" (Polizia di
 * Stato) — la comunicazione di pubblica sicurezza, distinta e obbligatoria
 * oltre a quella statistica Ross1000.
 *
 * Perche' lo generiamo noi e non lo si scarica da Ross1000: la funzione
 * "Genera file questura" del portale Ross1000 e' disponibile SOLO per chi
 * inserisce gli ospiti a mano dal check-in del portale stesso. Le FAQ
 * ufficiali GIES sono esplicite: "Tale funzione e' disponibile solo per chi
 * carica da check-in. Chi utilizza un gestionale locale genera gia' con
 * esso il file per la Questura, non ha quindi necessita' di utilizzare
 * questa funzione in Turismo5." Il tracciato XML di movimentazione, del
 * resto, non prevede alcun campo per il documento d'identita', quindi da
 * quei dati il file Questura non sarebbe nemmeno ricostruibile.
 *
 * Tracciato implementato secondo il manuale ufficiale "Invio File"
 * (questure.poliziadistato.it/statics/06/creafile-precompilato-per-gestionale.pdf):
 * una riga per alloggiato, 168 caratteri a larghezza fissa.
 *
 *   Campo                     DA    A   Lung.  Note
 *   Tipo Alloggiato            0    1     2    obbligatorio
 *   Data Arrivo                2   11    10    gg/mm/aaaa
 *   Giorni di Permanenza      12   13     2    massimo 30
 *   Cognome                   14   63    50
 *   Nome                      64   93    30
 *   Sesso                     94   94     1    1 = M, 2 = F
 *   Data Nascita              95  104    10    gg/mm/aaaa
 *   Comune Nascita           105  113     9    solo se nato in Italia
 *   Provincia Nascita        114  115     2    solo se nato in Italia
 *   Stato Nascita            116  124     9    sempre obbligatorio
 *   Cittadinanza             125  133     9    sempre obbligatorio
 *   Tipo Documento           134  138     5    solo per 16/17/18
 *   Numero Documento         139  158    20    solo per 16/17/18
 *   Luogo Rilascio Documento 159  167     9    solo per 16/17/18
 *
 * I primi 11 campi (134 caratteri) sono obbligatori per TUTTI i tipi di
 * alloggiato; gli ultimi 3 (34 caratteri) solo per ospite singolo /
 * capofamiglia / capogruppo, mentre per familiari e membri di gruppo vanno
 * riempiti di spazi. Ogni riga termina con CR+LF tranne l'ultima.
 */

function padRight(value: string, length: number): string {
  return value.slice(0, length).padEnd(length, " ");
}

function blanks(length: number): string {
  return " ".repeat(length);
}

// yyyy-mm-dd -> gg/mm/aaaa
function toItalianDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function tipoAlloggiato(index: number, total: number): "16" | "17" | "19" {
  // 16 = ospite singolo, 17 = capofamiglia, 19 = familiare. Stessa
  // semantica usata nell'XML Ross1000, per coerenza tra i due file.
  if (total === 1) return "16";
  return index === 0 ? "17" : "19";
}

function buildLine(
  guest: Guest,
  index: number,
  total: number,
  data: CheckInData,
  primary: PrimaryGuestExtra,
): string {
  const tipo = tipoAlloggiato(index, total);
  const isCapo = tipo !== "19";

  const nascitaInItalia = guest.statoNascita?.code === ITALIA_CODE;
  const comuneNascita = nascitaInItalia ? (guest.comuneNascita?.code ?? "") : "";
  const provinciaNascita = nascitaInItalia
    ? provinciaByComuneCode(guest.comuneNascita?.code)
    : "";

  // Il luogo di rilascio e' il comune se rilasciato in Italia, altrimenti
  // lo stato: entrambe le tabelle di codici sono ammesse dal tracciato.
  const rilascioInItalia = primary.statoRilascio?.code === ITALIA_CODE;
  const luogoRilascio = rilascioInItalia
    ? (primary.comuneRilascio?.code ?? "")
    : (primary.statoRilascio?.code ?? "");

  // I dati del documento sono raccolti solo per l'ospite principale, che e'
  // sempre il capofamiglia/ospite singolo — esattamente i tipi per cui il
  // tracciato li richiede.
  const documento = isCapo
    ? [
        padRight(primary.tipoDocumento, 5),
        padRight(primary.numeroDocumento.toUpperCase(), 20),
        padRight(luogoRilascio, 9),
      ].join("")
    : blanks(34);

  return [
    tipo, // 2
    toItalianDate(data.dataArrivo), // 10
    String(Math.min(data.notti, 30)).padStart(2, "0"), // 2
    padRight(guest.cognome.toUpperCase(), 50), // 50
    padRight(guest.nome.toUpperCase(), 30), // 30
    guest.sesso === "M" ? "1" : "2", // 1
    toItalianDate(guest.dataNascita), // 10
    padRight(comuneNascita, 9), // 9
    padRight(provinciaNascita.toUpperCase(), 2), // 2
    padRight(guest.statoNascita?.code ?? "", 9), // 9
    padRight(guest.cittadinanza?.code ?? "", 9), // 9
    documento, // 34
  ].join("");
}

export function buildAlloggiatiFile(data: CheckInData): {
  filename: string;
  buffer: Buffer;
} {
  const lines = data.guests.map((guest, i) =>
    buildLine(guest, i, data.guests.length, data, data.primary),
  );

  // CR+LF fra le righe ma non dopo l'ultima, come richiesto dal manuale.
  const text = lines.join("\r\n");

  const capogruppo = data.guests[0]?.cognome || "ospite";

  return {
    filename: `alloggiati_${capogruppo.toLowerCase().replace(/\s+/g, "-")}_${data.dataArrivo}.txt`,
    buffer: Buffer.from(text, "latin1"),
  };
}

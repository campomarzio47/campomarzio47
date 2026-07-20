import type { CheckInData, Guest } from "@/lib/checkin-types";
import { toCompactDate } from "@/lib/checkin-types";
import { ITALIA_CODE } from "@/lib/reference-data";
import { property } from "@/content/property";

/**
 * Generatore XML per la movimentazione turistica formato "GIES/Ross1000".
 *
 * La durata del soggiorno non è un campo: è il risultato di due eventi in
 * due giorni diversi, collegati dallo stesso <idswh>.
 * - Un <movimento> per ogni giorno da arrivo a partenza inclusi.
 * - <arrivi> SOLO nel giorno di arrivo (con tutti i dati anagrafici).
 * - <partenze> SOLO nel giorno di partenza, con <partenza> minimale
 *   (idswh, tipoalloggiato, idcapo se presente, e la data di arrivo
 *   originale per ricollegare il record — non i dati anagrafici, già dati
 *   in arrivo).
 * - Nei giorni intermedi solo <struttura>, senza <arrivi>/<partenze>.
 * - <camereoccupate> = 1 dal giorno di arrivo al giorno prima della
 *   partenza, poi 0 dal giorno di partenza (camera liberata quel giorno).
 *
 * Ricostruito dopo due errori XSD reali sul portale: il primo su un tag
 * "datapartenza" inventato dentro <movimento> (rimosso), il secondo su
 * <partenza> con solo <idswh> ("atteso tipoalloggiato"). Questa versione
 * segue un'analisi più approfondita della struttura standard di questi
 * tracciati "presenze giornaliere"; se il portale segnala ancora un errore
 * XSD, il messaggio indica sempre con precisione il campo da correggere.
 */

const CODICE_STRUTTURA_PLACEHOLDER = "DA_CONFIGURARE";

// Configurazione della struttura (unità unica, non un hotel multi-camera).
const CAMERE_DISPONIBILI = 1;

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function tag(name: string, value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  return `      <${name}>${xmlEscape(String(value))}</${name}>`;
}

function shortId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Elenco delle date (yyyy-mm-dd) da arrivo a partenza inclusi.
function dateRangeIso(startIso: string, endIso: string): string[] {
  const dates: string[] = [];
  let current = startIso;
  while (current <= endIso) {
    dates.push(current);
    current = addDaysIso(current, 1);
  }
  return dates;
}

function tipoAlloggiato(index: number, total: number): "16" | "17" | "19" {
  // Semplificazione: 1 solo ospite = singolo; con piu' ospiti il primo e'
  // trattato come capofamiglia, gli altri come familiari (stesso criterio
  // gia' usato in precedenza per Alloggiati Web).
  if (total === 1) return "16";
  return index === 0 ? "17" : "19";
}

function buildStruttura(camereOccupate: 0 | 1, lettiDisponibili: string): string {
  return [
    "    <struttura>",
    "      <apertura>SI</apertura>",
    `      <camereoccupate>${camereOccupate}</camereoccupate>`,
    `      <cameredisponibili>${CAMERE_DISPONIBILI}</cameredisponibili>`,
    `      <lettidisponibili>${xmlEscape(lettiDisponibili)}</lettidisponibili>`,
    "    </struttura>",
  ].join("\n");
}

function buildArrivo(guest: Guest, index: number, total: number, idswhByIndex: string[]): string {
  const tipo = tipoAlloggiato(index, total);
  const needsIdCapo = tipo === "19";
  const idswh = idswhByIndex[index];

  const residenzaInItalia = guest.statoResidenza?.code === ITALIA_CODE;
  const luogoResidenza = residenzaInItalia
    ? guest.comuneResidenza?.code
    : guest.localitaResidenzaEstera;

  const nascitaInItalia = guest.statoNascita?.code === ITALIA_CODE;

  const lines = [
    "    <arrivo>",
    tag("idswh", idswh),
    tag("tipoalloggiato", tipo),
    needsIdCapo ? tag("idcapo", idswhByIndex[0]) : "",
    tag("cognome", guest.cognome),
    tag("nome", guest.nome),
    tag("sesso", guest.sesso),
    tag("cittadinanza", guest.cittadinanza?.code),
    tag("statoresidenza", guest.statoResidenza?.code),
    tag("luogoresidenza", luogoResidenza),
    tag("datanascita", toCompactDate(guest.dataNascita)),
    guest.statoNascita ? tag("statonascita", guest.statoNascita.code) : "",
    nascitaInItalia ? tag("comunenascita", guest.comuneNascita?.code) : "",
    tag("tipoturismo", guest.tipoTurismo),
    tag("mezzotrasporto", guest.mezzoTrasporto),
    tag("canaleprenotazione", "Diretta web"),
    "    </arrivo>",
  ];

  return lines.filter(Boolean).join("\n");
}

// <partenza> non ripete i dati anagrafici (già dati in <arrivo>): si limita a
// referenziare lo stesso ospite/gruppo e a riportare la data di arrivo
// originale, per permettere al sistema di ricollegare i due eventi.
function buildPartenza(
  index: number,
  total: number,
  idswhByIndex: string[],
  dataArrivoCompact: string,
): string {
  const tipo = tipoAlloggiato(index, total);

  // A differenza di <arrivo>, <partenza> non prevede <idcapo>: l'errore XSD
  // "atteso arrivo" ricevuto dopo <tipoalloggiato> lo conferma — la sequenza
  // corretta e' idswh, tipoalloggiato, arrivo (data), senza idcapo.
  const lines = [
    "    <partenza>",
    tag("idswh", idswhByIndex[index]),
    tag("tipoalloggiato", tipo),
    tag("arrivo", dataArrivoCompact),
    "    </partenza>",
  ];

  return lines.filter(Boolean).join("\n");
}

export function buildRoss1000File(data: CheckInData): {
  filename: string;
  buffer: Buffer;
} {
  const codice = process.env.ROSS1000_CODICE_STRUTTURA || CODICE_STRUTTURA_PLACEHOLDER;
  const prodotto = process.env.ROSS1000_PRODOTTO || "CampoMarzio47Website";
  const lettiDisponibili =
    process.env.ROSS1000_LETTI_DISPONIBILI || String(property.facts.maxGuests);

  const idswhByIndex = data.guests.map((_, i) => {
    const base = `${toCompactDate(data.dataArrivo)}-${shortId()}-${i}`;
    return base.slice(0, 20);
  });

  const dataPartenzaIso = addDaysIso(data.dataArrivo, data.notti);
  const giorni = dateRangeIso(data.dataArrivo, dataPartenzaIso);

  const movimenti = giorni.map((giornoIso) => {
    const isArrivo = giornoIso === data.dataArrivo;
    const isPartenza = giornoIso === dataPartenzaIso;
    // Camera occupata dal giorno di arrivo fino al giorno prima della
    // partenza; il giorno di partenza la camera è già libera.
    const camereOccupate: 0 | 1 = isPartenza ? 0 : 1;

    const sections: string[] = [buildStruttura(camereOccupate, lettiDisponibili)];

    if (isArrivo) {
      const arrivi = data.guests
        .map((guest, i) => buildArrivo(guest, i, data.guests.length, idswhByIndex))
        .join("\n");
      sections.push("    <arrivi>", arrivi, "    </arrivi>");
    }

    if (isPartenza) {
      const partenze = data.guests
        .map((_, i) =>
          buildPartenza(i, data.guests.length, idswhByIndex, toCompactDate(data.dataArrivo)),
        )
        .join("\n");
      sections.push("    <partenze>", partenze, "    </partenze>");
    }

    return [
      "  <movimento>",
      `    <data>${toCompactDate(giornoIso)}</data>`,
      ...sections,
      "  </movimento>",
    ].join("\n");
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<movimenti>",
    `  <codice>${xmlEscape(codice)}</codice>`,
    `  <prodotto>${xmlEscape(prodotto)}</prodotto>`,
    ...movimenti,
    "</movimenti>",
    "",
  ].join("\n");

  const capogruppo = data.guests[0]?.cognome || "ospite";

  return {
    filename: `checkin_${capogruppo.toLowerCase().replace(/\s+/g, "-")}_${data.dataArrivo}.xml`,
    buffer: Buffer.from(xml, "utf-8"),
  };
}

import type { CheckInData, Guest } from "@/lib/checkin-types";
import { toCompactDate } from "@/lib/checkin-types";
import { ITALIA_CODE } from "@/lib/reference-data";
import { property } from "@/content/property";

/**
 * Generatore XML per la movimentazione turistica formato "GIES/Ross1000".
 *
 * Segue ESATTAMENTE la struttura della specifica originale fornita
 * dall'utente: <movimenti><codice/><prodotto/><movimento><data/><struttura/>
 * <arrivi>. Un tentativo precedente aggiungeva campi extra (email,
 * documento, indirizzo, data di partenza) dedotti da un'osservazione del
 * portale web — il caricamento di prova ha dato errore XSD proprio su uno di
 * questi campi (`datapartenza` non è un figlio valido di `movimento`), quindi
 * qui NON li includiamo più: quei dati restano comunque nel form e vengono
 * mandati via email/PDF, semplicemente non nell'XML.
 *
 * Cittadinanza, stato/comune di residenza e di nascita arrivano già come
 * codici ufficiali (tabelle Stati/Comuni della Polizia di Stato, vedi
 * lib/reference-data.ts): non servono più segnaposto da completare a mano.
 *
 * L'unico valore che NON possiamo verificare con certezza è il codice
 * struttura assegnato dall'ente regionale (ROSS1000_CODICE_STRUTTURA):
 * l'utente pensa sia il proprio CIR, ma va confermato sul portale prima
 * del primo invio reale.
 */

const CODICE_STRUTTURA_PLACEHOLDER = "DA_CONFIGURARE";

// Configurazione della struttura (unità unica, non un hotel multi-camera).
const CAMERE_OCCUPATE = 1;
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

function tipoAlloggiato(index: number, total: number): "16" | "17" | "19" {
  // Semplificazione: 1 solo ospite = singolo; con piu' ospiti il primo e'
  // trattato come capofamiglia, gli altri come familiari (stesso criterio
  // gia' usato in precedenza per Alloggiati Web).
  if (total === 1) return "16";
  return index === 0 ? "17" : "19";
}

function buildArrivo(
  guest: Guest,
  index: number,
  total: number,
  idswhByIndex: string[],
): string {
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

  const arrivi = data.guests
    .map((guest, i) => buildArrivo(guest, i, data.guests.length, idswhByIndex))
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<movimenti>",
    `  <codice>${xmlEscape(codice)}</codice>`,
    `  <prodotto>${xmlEscape(prodotto)}</prodotto>`,
    "  <movimento>",
    `    <data>${toCompactDate(data.dataArrivo)}</data>`,
    "    <struttura>",
    "      <apertura>SI</apertura>",
    `      <camereoccupate>${CAMERE_OCCUPATE}</camereoccupate>`,
    `      <cameredisponibili>${CAMERE_DISPONIBILI}</cameredisponibili>`,
    `      <lettidisponibili>${xmlEscape(lettiDisponibili)}</lettidisponibili>`,
    "    </struttura>",
    "    <arrivi>",
    arrivi,
    "    </arrivi>",
    "  </movimento>",
    "</movimenti>",
    "",
  ].join("\n");

  const capogruppo = data.guests[0]?.cognome || "ospite";

  return {
    filename: `checkin_${capogruppo.toLowerCase().replace(/\s+/g, "-")}_${data.dataArrivo}.xml`,
    buffer: Buffer.from(xml, "utf-8"),
  };
}

import type { CheckInData, Guest } from "@/lib/checkin-types";
import { toCompactDate } from "@/lib/checkin-types";
import { property } from "@/content/property";

/**
 * Generatore XML per la movimentazione turistica formato "GIES/Ross1000"
 * (usato da diverse piattaforme regionali italiane; per il Veneto va
 * verificato che flussituristici.regione.veneto.it accetti lo stesso
 * tracciato, come indicato nella specifica fornita dall'utente).
 *
 * Il file non contiene dati del documento d'identità (quella registrazione è
 * demandata al portale Alloggiati Web, raggiungibile secondo l'utente
 * direttamente da Ross1000 — quindi qui NON generiamo più il tracciato
 * Alloggiati Web).
 *
 * Cittadinanza/stato di residenza/stato di nascita richiedono un codice
 * della tabella "Nazioni" che non abbiamo integrato (non disponibile in modo
 * affidabile). Solo il codice Italia (100000100) è certo, dato dalla
 * specifica: per qualunque altro stato lasciamo un segnaposto DA_COMPILARE.
 * Lo stesso vale per i codici comune (tabella "Comuni") richiesti quando il
 * luogo è in Italia. Il riepilogo testuale nell'email contiene i valori in
 * chiaro per completare i segnaposto in pochi secondi prima del caricamento.
 */

const ITALIA_CODE = "100000100";
const CODE_PLACEHOLDER = "DA_COMPILARE";

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

function statoCode(scelta: "IT" | "ALTRO"): string {
  return scelta === "IT" ? ITALIA_CODE : CODE_PLACEHOLDER;
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

  const luogoResidenza =
    guest.statoResidenza === "IT" ? CODE_PLACEHOLDER : guest.luogoResidenza;

  const lines = [
    "    <arrivo>",
    tag("idswh", idswh),
    tag("tipoalloggiato", tipo),
    needsIdCapo ? tag("idcapo", idswhByIndex[0]) : "",
    tag("cognome", guest.cognome),
    tag("nome", guest.nome),
    tag("sesso", guest.sesso),
    tag("cittadinanza", statoCode(guest.cittadinanza)),
    tag("statoresidenza", statoCode(guest.statoResidenza)),
    guest.statoResidenza === "IT" || guest.luogoResidenza
      ? tag("luogoresidenza", luogoResidenza)
      : "",
    tag("datanascita", toCompactDate(guest.dataNascita)),
    guest.statoNascita ? tag("statonascita", statoCode(guest.statoNascita)) : "",
    guest.statoNascita === "IT" && guest.comuneNascita
      ? tag("comunenascita", CODE_PLACEHOLDER)
      : "",
    tag("tipoturismo", guest.tipoTurismo),
    tag("mezzotrasporto", guest.mezzoTrasporto),
    tag("canaleprenotazione", "Diretta web"),
    guest.titoloStudio ? tag("titolostudio", guest.titoloStudio) : "",
    guest.professione ? tag("professione", guest.professione) : "",
    "    </arrivo>",
  ];

  return lines.filter(Boolean).join("\n");
}

export function buildRoss1000File(data: CheckInData): {
  filename: string;
  buffer: Buffer;
} {
  const codice = process.env.ROSS1000_CODICE_STRUTTURA || CODE_PLACEHOLDER;
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

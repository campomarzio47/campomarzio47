import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { CheckInData, Guest, PlaceRef } from "@/lib/checkin-types";
import { ITALIA_CODE } from "@/lib/reference-data";
import { property } from "@/content/property";
import { it } from "@/content/dictionaries";
import { drawCheckInHeader } from "@/content/checkin-pdf-header";

const MARGIN = 48;
const PAGE_SIZE: [number, number] = [595.28, 841.89]; // A4
const LABEL_WIDTH = 118;
const FOOTER_SPACE = 52;

const INK = rgb(0x1c / 255, 0x1a / 255, 0x19 / 255);
const MID = rgb(0x67 / 255, 0x61 / 255, 0x5b / 255);
const RULE = rgb(0xe0 / 255, 0xd8 / 255, 0xcc / 255);

/**
 * Riepilogo del check-in per l'host, in italiano.
 *
 * Ordinato per l'uso che se ne fa, non per l'ordine del modulo: prima il
 * soggiorno, poi chi intesta la ricevuta con l'indirizzo **tutto insieme**
 * (via, CAP, comune, stato: in fattura servono uno sotto l'altro, e prima
 * via e comune stavano in due punti diversi del foglio), poi il documento
 * e infine l'elenco degli ospiti. Lo stile resta semplice: etichette a
 * sinistra, valori a destra, nessun riquadro.
 */

function dateLong(iso: string, withWeekday = false): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("it-IT", {
    weekday: withWeekday ? "long" : undefined,
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function dateShort(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** "MAROSTICA (VI), Italia" oppure "GERMANIA". */
function place(comune: PlaceRef, stato: PlaceRef): string {
  if (stato?.code === ITALIA_CODE) return [comune?.label, "Italia"].filter(Boolean).join(", ");
  return stato?.label ?? "-";
}

function residence(guest: Guest): string {
  if (guest.statoResidenza?.code === ITALIA_CODE) return place(guest.comuneResidenza, guest.statoResidenza);
  // La località estera è facoltativa: se manca resta solo lo stato.
  return [guest.localitaResidenzaEstera, guest.statoResidenza?.label].filter(Boolean).join(", ") || "-";
}

const label = <T extends { code: string; label: string }>(list: T[], code: string) =>
  list.find((o) => o.code === code)?.label ?? code;

/**
 * I caratteri standard del PDF conoscono solo l'alfabeto Windows-1252:
 * "Dvořák" o "Łukasz" farebbero fallire la generazione, e con lei
 * l'intero check-in. Le lettere che mancano perdono l'accento ("Dvorak"),
 * quelle che non hanno una forma base diventano "?".
 */
function encodable(font: PDFFont) {
  const supported = new Set(font.getCharacterSet());
  const extra: Record<string, string> = {
    ł: "l", Ł: "L", đ: "d", Đ: "D", ı: "i",
    // Spazi stretti che Intl mette in date e ore.
    "\u202f": " ", "\u2009": " ",
  };
  return (text: string) =>
    Array.from(text)
      .map((ch) => {
        if (supported.has(ch.codePointAt(0)!)) return ch;
        const base = extra[ch] ?? ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return Array.from(base).every((c) => supported.has(c.codePointAt(0)!)) ? base : "?";
      })
      .join("");
}

export async function buildCheckInPdf(data: CheckInData): Promise<{
  filename: string;
  buffer: Buffer;
}> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${property.name} — check-in del ${dateShort(data.dataArrivo)}`);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fonts = {
    sans,
    sansBold: bold,
    serif: await doc.embedFont(StandardFonts.TimesRoman),
    serifItalic: await doc.embedFont(StandardFonts.TimesRomanItalic),
  };
  const safe = encodable(sans);
  const width = PAGE_SIZE[0] - MARGIN * 2;

  const received = new Date().toLocaleString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  });

  const pages: PDFPage[] = [];
  let page!: PDFPage;
  let y = 0;

  function newPage() {
    page = doc.addPage(PAGE_SIZE);
    pages.push(page);
    y = drawCheckInHeader(page, fonts, {
      margin: MARGIN,
      title: "Riepilogo check-in",
      subtitle: safe(`Ricevuto il ${received}`),
    });
  }

  function ensure(space: number) {
    if (y - space < MARGIN + FOOTER_SPACE) newPage();
  }

  /** Spezza il testo in righe che stanno nella larghezza data. */
  function wrap(text: string, font: PDFFont, size: number, max: number): string[] {
    const lines: string[] = [];
    let current = "";
    for (const word of safe(text).split(/\s+/)) {
      const next = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= max || !current) current = next;
      else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [""];
  }

  function section(title: string) {
    ensure(52);
    y -= 10;
    const spaced = title.toUpperCase().split("").join(" ");
    page.drawText(spaced, { x: MARGIN, y, size: 7.5, font: bold, color: MID });
    y -= 7;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + width, y }, thickness: 0.6, color: RULE });
    y -= 17;
  }

  /** Riga etichetta/valore. Un valore può essere su più righe (indirizzo). */
  function row(name: string, value: string | string[], options?: { strong?: boolean }) {
    const values = (Array.isArray(value) ? value : [value]).filter((v) => v !== "");
    const size = 10.5;
    const lines = values.flatMap((v) => wrap(v, options?.strong ? bold : sans, size, width - LABEL_WIDTH));
    ensure(lines.length * 15 + 4);
    page.drawText(safe(name), { x: MARGIN, y, size: 9, font: sans, color: MID });
    for (const line of lines) {
      page.drawText(line, { x: MARGIN + LABEL_WIDTH, y, size, font: options?.strong ? bold : sans, color: INK });
      y -= 15;
    }
    y -= 4;
  }

  newPage();

  const [primaryGuest] = data.guests;
  const { primary } = data;
  const t = it.checkin;

  section("Soggiorno");
  row("Arrivo", dateLong(data.dataArrivo, true), { strong: true });
  row("Partenza", `${dateLong(addDays(data.dataArrivo, data.notti), true)} · ${data.notti} ${data.notti === 1 ? "notte" : "notti"}`);
  row("Ospiti", String(data.guests.length));
  // Motivo e mezzo si chiedono una volta e valgono per tutto il gruppo.
  row("Motivo del viaggio", label(t.tourismTypeOptions, primaryGuest.tipoTurismo));
  row("Mezzo di trasporto", label(t.transportMeansOptions, primaryGuest.mezzoTrasporto));

  section("Intestatario della ricevuta");
  row("Nome e cognome", `${primaryGuest.nome} ${primaryGuest.cognome}`, { strong: true });
  if (primary.codiceFiscale) row("Codice fiscale", primary.codiceFiscale);
  row("Indirizzo", [
    primary.indirizzoResidenza,
    [primary.cap, residence(primaryGuest)].filter(Boolean).join(" "),
  ]);
  row("Email", primary.email);

  section("Documento dell'intestatario");
  row("Tipo", label(t.documentTypes, primary.tipoDocumento));
  row("Numero", primary.numeroDocumento, { strong: true });
  row("Rilasciato a", place(primary.comuneRilascio, primary.statoRilascio));

  section(data.guests.length === 1 ? "Ospite" : `Ospiti · ${data.guests.length}`);
  data.guests.forEach((guest, i) => {
    // Un ospite non si spezza fra due pagine: nome e tre righe insieme.
    ensure(4 * 19 + 8);
    page.drawText(`${i + 1}`, { x: MARGIN, y, size: 10.5, font: fonts.serifItalic, color: MID });
    row("", `${guest.cognome.toUpperCase()} ${guest.nome}`, { strong: true });
    y += 2;
    row("Nascita", `${dateShort(guest.dataNascita)} · ${guest.sesso === "M" ? "maschio" : "femmina"} · ${place(guest.comuneNascita, guest.statoNascita)}`);
    row("Cittadinanza", guest.cittadinanza?.label ?? "-");
    row("Residenza", residence(guest));
    y -= 6;
  });

  // Piè di pagina: cosa è il documento e quanto tenerlo.
  pages.forEach((p, i) => {
    const footerY = MARGIN - 6;
    p.drawLine({ start: { x: MARGIN, y: footerY + 16 }, end: { x: MARGIN + width, y: footerY + 16 }, thickness: 0.6, color: RULE });
    p.drawText(
      "Contiene dati personali e gli estremi di un documento: conservalo solo il tempo necessario agli adempimenti.",
      { x: MARGIN, y: footerY, size: 7.5, font: sans, color: MID },
    );
    const n = `${i + 1} / ${pages.length}`;
    p.drawText(n, { x: MARGIN + width - sans.widthOfTextAtSize(n, 7.5), y: footerY, size: 7.5, font: sans, color: MID });
  });

  const bytes = await doc.save();
  const capogruppo = primaryGuest?.cognome || "ospite";

  return {
    filename: `checkin_${capogruppo.toLowerCase().replace(/\s+/g, "-")}_${data.dataArrivo}.pdf`,
    buffer: Buffer.from(bytes),
  };
}

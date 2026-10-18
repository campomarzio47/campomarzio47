import { rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { property } from "@/content/property";

/**
 * Intestazione del PDF di check-in, disegnata per Campo Marzio 47: il nome
 * in serif (Times, il più vicino al Bodoni fra i caratteri inclusi nel
 * PDF) con "47" corsivo bordeaux come nel sito, e sotto una fascia di
 * scacchiera bordeaux (la Partita a Scacchi di Marostica, la scacchiera
 * sul tavolo del soggiorno).
 *
 * È per immobile, non parte del modello. Un nuovo sito creato da qui
 * ridisegna questa intestazione nello stile della sua casa (colori, motivo,
 * carattere) e riscrive questo commento: finché il nome del modello compare
 * in questo file, `node scripts/new-site.mjs check` lo segnala come residuo.
 */

export type HeaderFonts = {
  serif: PDFFont;
  serifItalic: PDFFont;
  sans: PDFFont;
  sansBold: PDFFont;
};

const BORDEAUX = rgb(0x8b / 255, 0x26 / 255, 0x35 / 255);
const CHARCOAL = rgb(0x1c / 255, 0x1a / 255, 0x19 / 255);
const MID = rgb(0x67 / 255, 0x61 / 255, 0x5b / 255);

/**
 * Disegna l'intestazione in cima alla pagina e restituisce la coordinata y
 * da cui può cominciare il contenuto.
 */
export function drawCheckInHeader(
  page: PDFPage,
  fonts: HeaderFonts,
  { margin, title, subtitle }: { margin: number; title: string; subtitle: string },
): number {
  const { width, height } = page.getSize();
  const top = height - margin;

  // Nome: "Campo Marzio " in tondo, "47" in corsivo bordeaux.
  const nameSize = 24;
  const accent = property.nameAccent;
  const base = accent ? property.name.replace(accent, "").trimEnd() + " " : property.name;
  const baseline = top - nameSize * 0.8;
  page.drawText(base, { x: margin, y: baseline, size: nameSize, font: fonts.serif, color: CHARCOAL });
  if (accent) {
    page.drawText(accent, {
      x: margin + fonts.serif.widthOfTextAtSize(base, nameSize),
      y: baseline,
      size: nameSize,
      font: fonts.serifItalic,
      color: BORDEAUX,
    });
  }
  page.drawText(`${property.address.street} · ${property.address.zip} ${property.address.city} (${property.address.province})`, {
    x: margin,
    y: baseline - 16,
    size: 8.5,
    font: fonts.sans,
    color: MID,
  });

  // A destra: cosa è il documento e quando è arrivato.
  const right = width - margin;
  const titleSize = 8;
  const spaced = title.toUpperCase().split("").join(" ");
  page.drawText(spaced, {
    x: right - fonts.sansBold.widthOfTextAtSize(spaced, titleSize),
    y: baseline + 6,
    size: titleSize,
    font: fonts.sansBold,
    color: BORDEAUX,
  });
  page.drawText(subtitle, {
    x: right - fonts.sans.widthOfTextAtSize(subtitle, 8.5),
    y: baseline - 8,
    size: 8.5,
    font: fonts.sans,
    color: MID,
  });

  // Fascia di scacchiera: due file di caselle da 4 pt su tutta la larghezza.
  const cell = 4;
  const bandTop = baseline - 34;
  const columns = Math.floor((width - margin * 2) / cell);
  for (let row = 0; row < 2; row++) {
    for (let col = row % 2; col < columns; col += 2) {
      page.drawRectangle({
        x: margin + col * cell,
        y: bandTop - (row + 1) * cell,
        width: cell,
        height: cell,
        color: BORDEAUX,
      });
    }
  }

  return bandTop - cell * 2 - 26;
}

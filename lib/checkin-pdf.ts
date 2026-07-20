import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { CheckInData, Guest } from "@/lib/checkin-types";
import { ITALIA_CODE } from "@/lib/reference-data";

const MARGIN = 50;
const PAGE_SIZE: [number, number] = [595.28, 841.89]; // A4

function guestLines(guest: Guest, index: number): string[] {
  const residenza =
    guest.statoResidenza?.code === ITALIA_CODE
      ? `${guest.comuneResidenza?.label ?? ""} (Italia)`
      : `${guest.localitaResidenzaEstera || "-"} (${guest.statoResidenza?.label ?? "-"})`;
  const nascita = guest.statoNascita
    ? guest.statoNascita.code === ITALIA_CODE
      ? `${guest.comuneNascita?.label ?? ""} (Italia)`
      : guest.statoNascita.label
    : "non specificata";
  const rilascio =
    guest.statoRilascio?.code === ITALIA_CODE
      ? `${guest.comuneRilascio?.label ?? ""} (Italia)`
      : (guest.statoRilascio?.label ?? "-");

  return [
    `Ospite ${index + 1}: ${guest.cognome} ${guest.nome}`,
    `Sesso: ${guest.sesso}    Data di nascita: ${guest.dataNascita}    Luogo di nascita: ${nascita}`,
    `Email: ${guest.email}`,
    `Cittadinanza: ${guest.cittadinanza?.label ?? "-"}`,
    `Residenza: ${residenza}`,
    `Indirizzo di residenza: ${guest.indirizzoResidenza}`,
    guest.codiceFiscale ? `Codice fiscale: ${guest.codiceFiscale}` : "",
    `Documento: ${guest.tipoDocumento} n. ${guest.numeroDocumento} — rilasciato in ${rilascio}`,
    `Tipo turismo: ${guest.tipoTurismo}    Mezzo di trasporto: ${guest.mezzoTrasporto}`,
  ].filter(Boolean);
}

export async function buildCheckInPdf(data: CheckInData): Promise<{
  filename: string;
  buffer: Buffer;
}> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage(PAGE_SIZE);
  let y = PAGE_SIZE[1] - MARGIN;

  function ensureSpace(lineHeight: number) {
    if (y < MARGIN + lineHeight) {
      page = doc.addPage(PAGE_SIZE);
      y = PAGE_SIZE[1] - MARGIN;
    }
  }

  function writeLine(text: string, options?: { size?: number; useBold?: boolean; gap?: number }) {
    const size = options?.size ?? 11;
    const gap = options?.gap ?? size + 6;
    ensureSpace(gap);
    page.drawText(text, {
      x: MARGIN,
      y,
      size,
      font: options?.useBold ? bold : font,
      color: rgb(0.12, 0.12, 0.12),
    });
    y -= gap;
  }

  writeLine("Campo Marzio 47 — Riepilogo check-in", { size: 16, useBold: true, gap: 26 });
  writeLine(`Data di arrivo: ${data.dataArrivo}    Notti: ${data.notti}    Ospiti: ${data.guests.length}`, {
    gap: 24,
  });

  data.guests.forEach((guest, i) => {
    ensureSpace(20);
    y -= 6;
    for (const line of guestLines(guest, i)) {
      writeLine(line, { useBold: line.startsWith("Ospite") });
    }
  });

  const bytes = await doc.save();

  const capogruppo = data.guests[0]?.cognome || "ospite";

  return {
    filename: `checkin_${capogruppo.toLowerCase().replace(/\s+/g, "-")}_${data.dataArrivo}.pdf`,
    buffer: Buffer.from(bytes),
  };
}

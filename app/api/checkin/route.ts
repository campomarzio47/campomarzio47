import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/mailer";
import { buildRoss1000File } from "@/lib/ross1000";
import { tipoTurismoCodes, mezzoTrasportoCodes, titoloStudioCodes } from "@/lib/checkin-types";
import { ITALIA_CODE } from "@/lib/reference-data";

const placeSchema = z
  .object({
    code: z.string().min(1).max(20),
    label: z.string().min(1).max(120),
  })
  .nullable();

const guestSchema = z
  .object({
    cognome: z.string().min(1).max(50),
    nome: z.string().min(1).max(30),
    sesso: z.enum(["M", "F"]),
    dataNascita: z.string().min(1),
    cittadinanza: placeSchema,
    statoResidenza: placeSchema,
    comuneResidenza: placeSchema,
    localitaResidenzaEstera: z.string().max(80).optional().default(""),
    statoNascita: placeSchema,
    comuneNascita: placeSchema,
    tipoTurismo: z.enum(tipoTurismoCodes),
    mezzoTrasporto: z.enum(mezzoTrasportoCodes),
    titoloStudio: z.union([z.enum(titoloStudioCodes), z.literal("")]).optional().default(""),
    professione: z.string().max(100).optional().default(""),
  })
  .refine((g) => g.cittadinanza !== null, { message: "Cittadinanza obbligatoria." })
  .refine((g) => g.statoResidenza !== null, { message: "Stato di residenza obbligatorio." })
  .refine(
    (g) => g.statoResidenza?.code !== ITALIA_CODE || g.comuneResidenza !== null,
    { message: "Comune di residenza obbligatorio se lo stato di residenza è l'Italia." },
  )
  .refine(
    (g) => g.statoNascita?.code !== ITALIA_CODE || g.comuneNascita !== null,
    { message: "Comune di nascita obbligatorio se lo stato di nascita è l'Italia." },
  );

const checkInSchema = z.object({
  dataArrivo: z.string().min(1),
  notti: z.coerce.number().int().min(1).max(60),
  guests: z.array(guestSchema).min(1).max(8),
  consenso: z.literal(true),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkInSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Dati del check-in non validi o incompleti." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const ross1000 = buildRoss1000File(data);

  const summary = data.guests
    .map((g, i) => {
      const residenza =
        g.statoResidenza?.code === ITALIA_CODE
          ? `${g.comuneResidenza?.label} (Italia)`
          : `${g.localitaResidenzaEstera || "non specificata"} (${g.statoResidenza?.label})`;
      const nascita = g.statoNascita
        ? g.statoNascita.code === ITALIA_CODE
          ? `${g.comuneNascita?.label} (Italia)`
          : g.statoNascita.label
        : "non specificata";
      return (
        `Ospite ${i + 1}: ${g.cognome} ${g.nome} (${g.sesso}), nato/a il ${g.dataNascita} — nascita: ${nascita} — ` +
        `cittadinanza: ${g.cittadinanza?.label} — residenza: ${residenza} — turismo: ${g.tipoTurismo} — trasporto: ${g.mezzoTrasporto}` +
        (g.titoloStudio ? ` — titolo di studio: ${g.titoloStudio}` : "") +
        (g.professione ? ` — professione: ${g.professione}` : "")
      );
    })
    .join("\n");

  try {
    await sendMail({
      subject: `Check-in online — arrivo ${data.dataArrivo} — ${data.guests.length} ospiti`,
      text: [
        `Nuovo check-in online ricevuto dal sito.`,
        `Arrivo: ${data.dataArrivo}  ·  Notti: ${data.notti}  ·  Ospiti: ${data.guests.length}`,
        "",
        summary,
        "",
        "In allegato:",
        `- ${ross1000.filename} (movimentazione turistica Ross1000/GIES, da caricare sul portale regionale)`,
        "",
        "Tutti i codici (cittadinanza, stato/comune di residenza e di nascita) sono già",
        "compilati automaticamente dalle tabelle ufficiali. L'unico campo che potrebbe restare",
        "segnato come \"DA_CONFIGURARE\" è il codice struttura, se non hai ancora impostato",
        "la variabile d'ambiente ROSS1000_CODICE_STRUTTURA.",
        "Verifica anche che il portale flussituristici.regione.veneto.it accetti questo stesso",
        "tracciato prima del primo invio reale.",
      ].join("\n"),
      attachments: [{ filename: ross1000.filename, content: ross1000.buffer }],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Invio non riuscito, riprova più tardi.",
      },
      { status: 500 },
    );
  }
}

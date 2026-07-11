import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/mailer";
import { buildRoss1000File } from "@/lib/ross1000";
import { documentTypeCodes } from "@/lib/checkin-types";
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
    email: z.string().email(),
    cittadinanza: placeSchema,
    statoResidenza: placeSchema,
    comuneResidenza: placeSchema,
    localitaResidenzaEstera: z.string().max(80).optional().default(""),
    indirizzoResidenza: z.string().min(1).max(120),
    statoNascita: placeSchema,
    comuneNascita: placeSchema,
    tipoDocumento: z.enum(documentTypeCodes),
    numeroDocumento: z.string().min(1).max(20),
    statoRilascio: placeSchema,
    comuneRilascio: placeSchema,
  })
  .refine((g) => g.cittadinanza !== null, { message: "Cittadinanza obbligatoria." })
  .refine((g) => g.statoResidenza !== null, { message: "Stato di residenza obbligatorio." })
  .refine((g) => g.statoNascita !== null, { message: "Stato di nascita obbligatorio." })
  .refine((g) => g.statoRilascio !== null, { message: "Stato di rilascio documento obbligatorio." })
  .refine(
    (g) => g.statoResidenza?.code !== ITALIA_CODE || g.comuneResidenza !== null,
    { message: "Comune di residenza obbligatorio se lo stato di residenza è l'Italia." },
  )
  .refine(
    (g) => g.statoNascita?.code !== ITALIA_CODE || g.comuneNascita !== null,
    { message: "Comune di nascita obbligatorio se lo stato di nascita è l'Italia." },
  )
  .refine(
    (g) => g.statoRilascio?.code !== ITALIA_CODE || g.comuneRilascio !== null,
    { message: "Comune di rilascio documento obbligatorio se lo stato di rilascio è l'Italia." },
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
      const nascita =
        g.statoNascita?.code === ITALIA_CODE
          ? `${g.comuneNascita?.label} (Italia)`
          : g.statoNascita?.label;
      const rilascio =
        g.statoRilascio?.code === ITALIA_CODE
          ? `${g.comuneRilascio?.label} (Italia)`
          : g.statoRilascio?.label;
      return (
        `Ospite ${i + 1}: ${g.cognome} ${g.nome} (${g.sesso}), nato/a il ${g.dataNascita} — nascita: ${nascita} — ` +
        `email: ${g.email} — cittadinanza: ${g.cittadinanza?.label} — residenza: ${residenza}, ${g.indirizzoResidenza} — ` +
        `documento: ${g.tipoDocumento} n. ${g.numeroDocumento}, rilasciato in ${rilascio}`
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
        "Tutti i codici (cittadinanza, stato/comune di residenza, nascita e rilascio documento) sono",
        "già compilati automaticamente dalle tabelle ufficiali. L'unico campo che potrebbe restare",
        "segnato come \"DA_CONFIGURARE\" è il codice struttura, se non hai ancora impostato la",
        "variabile d'ambiente ROSS1000_CODICE_STRUTTURA.",
        "Verifica anche che il portale flussituristici.regione.veneto.it accetti questo stesso",
        "tracciato prima del primo invio reale (in particolare i campi email, documento, indirizzo",
        "di residenza e data di partenza, aggiunti dopo un controllo diretto sul portale).",
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

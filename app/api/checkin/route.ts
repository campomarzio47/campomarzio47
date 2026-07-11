import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/mailer";
import { buildRoss1000File } from "@/lib/ross1000";
import { tipoTurismoCodes, mezzoTrasportoCodes, titoloStudioCodes } from "@/lib/checkin-types";

const statoSchema = z.enum(["IT", "ALTRO"]);

const guestSchema = z
  .object({
    cognome: z.string().min(1).max(50),
    nome: z.string().min(1).max(30),
    sesso: z.enum(["M", "F"]),
    dataNascita: z.string().min(1),
    cittadinanza: statoSchema,
    cittadinanzaAltro: z.string().max(80).optional().default(""),
    statoResidenza: statoSchema,
    luogoResidenza: z.string().max(80).optional().default(""),
    statoNascita: z.union([statoSchema, z.literal("")]).optional().default(""),
    statoNascitaAltro: z.string().max(80).optional().default(""),
    comuneNascita: z.string().max(80).optional().default(""),
    tipoTurismo: z.enum(tipoTurismoCodes),
    mezzoTrasporto: z.enum(mezzoTrasportoCodes),
    titoloStudio: z.union([z.enum(titoloStudioCodes), z.literal("")]).optional().default(""),
    professione: z.string().max(100).optional().default(""),
  })
  .refine(
    (g) => g.statoResidenza === "ALTRO" || g.luogoResidenza.length > 0,
    { message: "Comune di residenza obbligatorio se lo stato di residenza è l'Italia." },
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
      const cittadinanza = g.cittadinanza === "IT" ? "Italiana" : g.cittadinanzaAltro || "estera (non specificata)";
      const residenza =
        g.statoResidenza === "IT" ? `${g.luogoResidenza} (Italia)` : g.luogoResidenza || "estero (non specificato)";
      const nascita =
        g.statoNascita === "IT"
          ? g.comuneNascita || "Italia (comune non specificato)"
          : g.statoNascita === "ALTRO"
            ? g.statoNascitaAltro || "estero (non specificato)"
            : "non specificato";
      return (
        `Ospite ${i + 1}: ${g.cognome} ${g.nome} (${g.sesso}), nato/a il ${g.dataNascita} — nascita: ${nascita} — ` +
        `cittadinanza: ${cittadinanza} — residenza: ${residenza} — turismo: ${g.tipoTurismo} — trasporto: ${g.mezzoTrasporto}` +
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
        "IMPORTANTE: nell'XML i campi che richiedono un codice ufficiale (stato estero, comune italiano)",
        "e che non sono l'Italia sono segnati con \"DA_COMPILARE\" perché servono le tabelle Nazioni/Comuni",
        "scaricabili dal portale. Usa il riepilogo qui sopra per completarli a mano prima del caricamento.",
        "Verifica anche che il portale flussituristici.regione.veneto.it accetti questo stesso tracciato",
        "prima del primo invio reale.",
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

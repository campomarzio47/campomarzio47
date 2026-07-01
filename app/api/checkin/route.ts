import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/mailer";
import { buildAlloggiatiFile } from "@/lib/alloggiati";
import { buildRoss1000File } from "@/lib/ross1000";
import { documentTypeCodes } from "@/lib/checkin-types";

const guestSchema = z.object({
  cognome: z.string().min(1).max(50),
  nome: z.string().min(1).max(30),
  sesso: z.enum(["M", "F"]),
  dataNascita: z.string().min(1),
  comuneStatoNascita: z.string().min(1).max(80),
  provinciaNascita: z.string().min(1).max(2),
  cittadinanza: z.string().min(1).max(80),
  tipoDocumento: z.enum(documentTypeCodes),
  numeroDocumento: z.string().min(1).max(20),
  luogoRilascio: z.string().min(1).max(80),
  comuneStatoResidenza: z.string().min(1).max(80),
  provinciaResidenza: z.string().min(1).max(2),
});

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

  const alloggiati = buildAlloggiatiFile(data);
  const ross1000 = buildRoss1000File(data);

  const summary = data.guests
    .map(
      (g, i) =>
        `Ospite ${i + 1}: ${g.cognome} ${g.nome} (${g.sesso}), nato/a ${g.dataNascita} a ${g.comuneStatoNascita} — ` +
        `cittadinanza ${g.cittadinanza} — documento ${g.tipoDocumento} n. ${g.numeroDocumento}, rilasciato a ${g.luogoRilascio} — ` +
        `residente a ${g.comuneStatoResidenza} (${g.provinciaResidenza})`,
    )
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
        `- ${alloggiati.filename} (Alloggiati Web / Questura)`,
        `- ${ross1000.filename} (Ross1000 / Regione Veneto)`,
        "",
        "IMPORTANTE: nel file Alloggiati Web i campi comune/stato di nascita, cittadinanza e",
        "luogo di rilascio del documento sono segnati con \"?????????\" perché richiedono i codici",
        "ufficiali ISTAT (scaricabili dal portale Alloggiati Web dopo il login). Usa il riepilogo",
        "qui sopra per completarli a mano prima del caricamento — sono solo 3 campi per ospite.",
        "Verifica anche il tracciato Ross1000 con la documentazione ufficiale del portale regionale",
        "prima del primo invio reale.",
      ].join("\n"),
      attachments: [
        { filename: alloggiati.filename, content: alloggiati.buffer },
        { filename: ross1000.filename, content: ross1000.buffer },
      ],
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

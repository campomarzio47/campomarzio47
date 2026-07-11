import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/mailer";

const schema = z.object({
  nome: z.string().min(1).max(200),
  email: z.string().email(),
  telefono: z.string().max(40).optional().or(z.literal("")),
  checkin: z.string().min(1),
  checkout: z.string().min(1),
  ospiti: z.coerce.number().int().min(1).max(20),
  messaggio: z.string().max(4000).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Dati della richiesta non validi." },
      { status: 400 },
    );
  }

  const { nome, email, telefono, checkin, checkout, ospiti, messaggio } = parsed.data;

  try {
    await sendMail({
      subject: `Richiesta di prenotazione — arrivo ${checkin}`,
      replyTo: email,
      text: [
        "Nuova richiesta di prenotazione dal sito (nessun pagamento effettuato).",
        "",
        `Nome: ${nome}`,
        `Email: ${email}`,
        telefono ? `Telefono: ${telefono}` : null,
        `Check-in: ${checkin}`,
        `Check-out: ${checkout}`,
        `Ospiti: ${ospiti}`,
        messaggio ? "" : null,
        messaggio ? "Note aggiuntive:" : null,
        messaggio || null,
      ]
        .filter((line) => line !== null)
        .join("\n"),
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

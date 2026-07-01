import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/mailer";

const schema = z.object({
  nome: z.string().min(1).max(200),
  email: z.string().email(),
  arrivo: z.string().max(20).optional().or(z.literal("")),
  partenza: z.string().max(20).optional().or(z.literal("")),
  messaggio: z.string().min(1).max(4000),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Dati del modulo non validi." },
      { status: 400 },
    );
  }

  const { nome, email, arrivo, partenza, messaggio } = parsed.data;

  try {
    await sendMail({
      subject: `Nuovo messaggio dal sito — ${nome}`,
      replyTo: email,
      text: [
        `Nome: ${nome}`,
        `Email: ${email}`,
        arrivo ? `Arrivo: ${arrivo}` : null,
        partenza ? `Partenza: ${partenza}` : null,
        "",
        "Messaggio:",
        messaggio,
      ]
        .filter(Boolean)
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

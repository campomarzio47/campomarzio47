import { NextResponse } from "next/server";
import { unsubscribe } from "@/lib/newsletter";

/**
 * Disiscrizione dalle offerte. Due strade, stesso effetto (la riga viene
 * cancellata):
 *
 * - il bottone della pagina /offerte/disiscrizione (campo `t` nel modulo):
 *   si torna alla pagina con la conferma;
 * - il clic unico del programma di posta (RFC 8058): un POST all'indirizzo
 *   dell'intestazione List-Unsubscribe, con il token nella query.
 */
export async function POST(request: Request) {
  let token = new URL(request.url).searchParams.get("t") ?? "";
  let fromPage = false;

  if ((request.headers.get("content-type") ?? "").includes("form")) {
    const form = await request.formData().catch(() => null);
    const field = form?.get("t");
    if (typeof field === "string" && field) {
      token = field;
      fromPage = true;
    }
  }

  await unsubscribe(token);

  // Stesso indirizzo da cui arriva la richiesta (anteprime, sviluppo), non
  // il dominio ufficiale.
  if (fromPage) return NextResponse.redirect(new URL("/offerte/disiscrizione?fatto=1", request.url), { status: 303 });
  return new NextResponse(null, { status: 204 });
}

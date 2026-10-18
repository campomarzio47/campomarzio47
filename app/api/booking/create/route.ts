import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getBusyRanges } from "@/lib/ical";
import { computeStayTotal, earliestCheckinIso, nightsBetween } from "@/lib/pricing";
import { sendBookingRequestEmails } from "@/lib/booking-notifications";
import { property } from "@/content/property";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "@/lib/locale";

/**
 * Richiesta di prenotazione diretta.
 *
 * Non c'è pagamento: la richiesta viene inoltrata via email all'host, che
 * risponde a mano. I controlli su date, preavviso e disponibilità restano
 * comunque lato server — il form li fa già, ma un client può inviare
 * qualsiasi cosa.
 */
const schema = z.object({
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.coerce.number().int().min(1).max(property.facts.maxGuests),
  nome: z.string().min(1).max(200),
  email: z.string().email(),
  telefono: z.string().max(40).optional().or(z.literal("")),
  messaggio: z.string().max(2000).optional().or(z.literal("")),
  // Presa visione dell'informativa privacy: il form non lascia inviare
  // senza, ma va verificato anche qui.
  privacyAck: z.literal(true),
});

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: "validation_error" }, { status: 400 });
  }

  const { checkin, checkout, guests, nome, email, telefono, messaggio } = parsed.data;

  if (checkin >= checkout) {
    return NextResponse.json({ ok: false, code: "invalid_dates" }, { status: 400 });
  }

  if (checkin < earliestCheckinIso()) {
    return NextResponse.json({ ok: false, code: "too_soon" }, { status: 400 });
  }

  const nights = nightsBetween(checkin, checkout);
  const minNights = property.pricing.minNights || 1;
  if (nights < minNights) {
    return NextResponse.json({ ok: false, code: "min_nights" }, { status: 400 });
  }

  try {
    const busy = await getBusyRanges();
    const taken = busy.some((b) => overlaps(checkin, checkout, b.start, b.end));
    if (taken) {
      return NextResponse.json({ ok: false, code: "dates_unavailable" }, { status: 409 });
    }
  } catch {
    // Se il calendario esterno non è raggiungibile non blocchiamo la
    // richiesta: l'host resta comunque l'ultimo controllo prima di
    // confermare qualsiasi cosa.
  }

  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  try {
    await sendBookingRequestEmails({
      checkin,
      checkout,
      guests,
      nome,
      email,
      telefono: telefono || "",
      messaggio: messaggio || "",
      locale,
      total: computeStayTotal(nights),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    // Il dettaglio resta nei log del server: il messaggio di un errore
    // SMTP può contenere host, utenza o motivi di rifiuto, che non vanno
    // rimandati al browser.
    console.error("Invio della richiesta di prenotazione non riuscito", error);
    return NextResponse.json({ ok: false, code: "server_error" }, { status: 500 });
  }
}

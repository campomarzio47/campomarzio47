import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getBusyRanges } from "@/lib/ical";
import { computeStayTotal, earliestCheckinIso, nightsBetween } from "@/lib/pricing";
import { sendBookingRequestEmails } from "@/lib/booking-notifications";
import { getStripe, paymentsEnabled } from "@/lib/stripe";
import { MESSAGE_MAX, toStripeMetadata } from "@/lib/booking-metadata";
import { property } from "@/content/property";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "@/lib/locale";

/**
 * Prenotazione diretta, in due modi a seconda della configurazione:
 *
 * - con Stripe (vedi `paymentsEnabled`): si crea una pagina di pagamento
 *   Stripe Checkout che **autorizza** la carta senza addebitarla
 *   (`capture_method: "manual"`). L'host riceve il link Conferma/Rifiuta
 *   dal webhook, e solo la conferma incassa: così una data presa nel
 *   frattempo su Airbnb non diventa un rimborso da gestire.
 * - senza: la richiesta parte via email all'host, che risponde a mano.
 *
 * I controlli su date, preavviso e disponibilità stanno qui in entrambi i
 * casi: il modulo li fa già, ma un client può inviare qualsiasi cosa.
 */
const schema = z.object({
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.coerce.number().int().min(1).max(property.facts.maxGuests),
  nome: z.string().min(1).max(200),
  email: z.string().email(),
  telefono: z.string().max(40).optional().or(z.literal("")),
  messaggio: z.string().max(2000).optional().or(z.literal("")),
  // Presa visione dell'informativa (e, con i pagamenti, accettazione dei
  // Termini): il modulo non lascia inviare senza, ma va verificato anche qui.
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
    // confermare (e, con Stripe, prima di incassare).
  }

  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const total = computeStayTotal(nights);
  // Il ritorno da Stripe porta allo stesso indirizzo da cui si è partiti
  // (anche un'anteprima), non per forza al dominio ufficiale.
  const origin = new URL(request.url).origin;

  if (paymentsEnabled()) {
    try {
      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        locale,
        customer_email: email,
        // Minimo consentito da Stripe: 30 minuti dalla creazione. Un minuto
        // di margine per non finire esattamente sul limite.
        expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
        line_items: [
          {
            price_data: {
              currency: property.pricing.currency.toLowerCase(),
              unit_amount: Math.round(total * 100),
              product_data: {
                name: `${property.name} — ${checkin} → ${checkout} (${nights})`,
              },
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          capture_method: "manual",
          description: `${property.name}: ${nome}, ${checkin} → ${checkout}`,
          metadata: toStripeMetadata({
            checkin,
            checkout,
            guests: String(guests),
            guestName: nome,
            guestEmail: email,
            guestPhone: telefono || "",
            guestMessage: (messaggio || "").slice(0, MESSAGE_MAX),
            guestLocale: locale,
          }),
        },
        success_url: `${origin}/prenota/conferma`,
        cancel_url: `${origin}/prenota?${new URLSearchParams({ from: checkin, to: checkout, annullato: "1" })}`,
      });

      if (!session.url) throw new Error("Stripe non ha restituito l'indirizzo della pagina di pagamento.");
      return NextResponse.json({ ok: true, url: session.url });
    } catch (error) {
      console.error("Creazione della sessione di pagamento non riuscita", error);
      return NextResponse.json({ ok: false, code: "server_error" }, { status: 500 });
    }
  }

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
      total,
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

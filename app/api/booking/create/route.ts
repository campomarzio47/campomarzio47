import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getBusyRanges } from "@/lib/ical";
import { getStripe } from "@/lib/stripe";
import { computeStayTotalCents } from "@/lib/pricing";
import { nightsBetween, toStripeMetadata } from "@/lib/booking-metadata";
import { property } from "@/content/property";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "@/lib/locale";

const schema = z.object({
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.coerce.number().int().min(1).max(property.facts.maxGuests),
  nome: z.string().min(1).max(200),
  email: z.string().email(),
  telefono: z.string().max(40).optional().or(z.literal("")),
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

  const { checkin, checkout, guests, nome, email, telefono } = parsed.data;

  if (checkin >= checkout) {
    return NextResponse.json({ ok: false, code: "invalid_dates" }, { status: 400 });
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
    // Se il calendario esterno non è raggiungibile, non blocchiamo la
    // prenotazione: l'host resta comunque l'ultimo controllo prima
    // dell'addebito reale.
  }

  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const origin = new URL(request.url).origin;
  const totalCents = computeStayTotalCents(nights);

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: locale === "en" ? "en" : "it",
      customer_email: email,
      // Minimo consentito da Stripe: 30 minuti dalla creazione. Margine di
      // un minuto per evitare di finire esattamente sul limite.
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      line_items: [
        {
          price_data: {
            currency: property.pricing.currency.toLowerCase(),
            unit_amount: totalCents,
            product_data: {
              name: `${property.name} — ${checkin} → ${checkout}`,
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        capture_method: "manual",
        metadata: toStripeMetadata({
          checkin,
          checkout,
          guests: String(guests),
          guestName: nome,
          guestEmail: email,
          guestPhone: telefono || "",
          guestLocale: locale,
        }),
      },
      success_url: `${origin}/prenota/conferma`,
      cancel_url: `${origin}/prenota?canceled=1`,
    });

    if (!session.url) {
      throw new Error("Stripe non ha restituito un URL di pagamento.");
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    console.error("Errore nella creazione della Checkout Session", error);
    return NextResponse.json({ ok: false, code: "server_error" }, { status: 500 });
  }
}

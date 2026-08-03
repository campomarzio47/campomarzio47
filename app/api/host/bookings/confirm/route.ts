import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { verifyBookingAction } from "@/lib/booking-tokens";
import { sendConfirmedEmails } from "@/lib/booking-notifications";

export async function POST(request: Request) {
  const form = await request.formData();
  const pi = String(form.get("pi") || "");
  const exp = Number(form.get("exp"));
  const sig = String(form.get("sig") || "");

  const origin = new URL(request.url).origin;
  const landingUrl = `${origin}/host/prenotazioni/azione?${new URLSearchParams({
    pi,
    exp: String(exp),
    sig,
  })}`;

  if (!pi || !verifyBookingAction(pi, exp, sig)) {
    return NextResponse.redirect(`${origin}/host/prenotazioni/azione`, { status: 303 });
  }

  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.retrieve(pi);

  // Idempotente: se non è più requires_capture, l'azione è già stata
  // gestita (doppio click, link riaperto dopo la decisione) — non
  // ripetiamo la cattura né l'invio delle email.
  if (paymentIntent.status === "requires_capture") {
    const captured = await stripe.paymentIntents.capture(pi);
    await sendConfirmedEmails(captured);
  }

  return NextResponse.redirect(landingUrl, { status: 303 });
}

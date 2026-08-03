import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { verifyBookingAction } from "@/lib/booking-tokens";
import { sendDeclinedEmails } from "@/lib/booking-notifications";

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

  // Idempotente, come nella route di conferma.
  if (paymentIntent.status === "requires_capture") {
    const canceled = await stripe.paymentIntents.cancel(pi);
    await sendDeclinedEmails(canceled);
  }

  return NextResponse.redirect(landingUrl, { status: 303 });
}

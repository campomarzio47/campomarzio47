import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { sendHostReviewEmail, sendGuestReceivedEmail } from "@/lib/booking-notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook non configurato." }, { status: 400 });
  }

  const stripe = getStripe();
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return NextResponse.json({ error: "Firma non valida." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const origin = new URL(request.url).origin;
        await Promise.all([
          sendHostReviewEmail({ paymentIntent, baseUrl: origin }),
          sendGuestReceivedEmail(paymentIntent),
        ]);
      } catch (error) {
        // Rispondiamo comunque 200: un nostro errore (es. email non
        // configurata) non deve far ripetere all'infinito la consegna
        // dell'evento da parte di Stripe. L'autorizzazione riuscita resta
        // comunque visibile sulla Dashboard Stripe anche se questa email
        // fallisce.
        console.error("Errore nella gestione di checkout.session.completed", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}

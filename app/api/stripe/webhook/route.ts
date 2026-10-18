import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, paymentsEnabled, verifyWebhook } from "@/lib/stripe";
import { sendReleasedEmails, sendRequestEmails } from "@/lib/booking-payment-emails";

export const dynamic = "force-dynamic";

/**
 * Eventi Stripe da registrare nella dashboard (Sviluppatori → Webhook):
 *
 * - `checkout.session.completed`: l'ospite ha autorizzato la carta. Parte
 *   l'email all'host con Conferma/Rifiuta e la ricevuta all'ospite.
 * - `payment_intent.canceled`: se il motivo è la scadenza
 *   dell'autorizzazione (nessuno ha deciso in tempo), lo diciamo a
 *   entrambi. Il rifiuto dell'host manda già le sue email.
 *
 * Stripe può consegnare lo stesso evento più volte: il PaymentIntent porta
 * `notified: "1"` dopo il primo invio, e i doppioni vengono ignorati.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature || !paymentsEnabled()) {
    return NextResponse.json({ error: "Webhook non configurato." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await verifyWebhook(await request.text(), signature);
  } catch {
    return NextResponse.json({ error: "Firma non valida." }, { status: 400 });
  }

  const stripe = getStripe();

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const id = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
      if (id) {
        const paymentIntent = await stripe.paymentIntents.retrieve(id, { expand: ["latest_charge"] });
        if (paymentIntent.status === "requires_capture" && paymentIntent.metadata.notified !== "1") {
          const charge = paymentIntent.latest_charge;
          const captureBefore =
            charge && typeof charge !== "string" ? (charge.payment_method_details?.card?.capture_before ?? null) : null;
          await sendRequestEmails(paymentIntent, captureBefore);
          await stripe.paymentIntents.update(id, { metadata: { notified: "1" } });
        }
      }
    }

    if (event.type === "payment_intent.canceled") {
      const paymentIntent = event.data.object;
      const expired = paymentIntent.cancellation_reason === "automatic" || paymentIntent.cancellation_reason === "expired";
      if (expired && paymentIntent.metadata.notified === "1") {
        await sendReleasedEmails(paymentIntent, "expired");
      }
    }
  } catch (error) {
    // Rispondiamo comunque 200: un nostro errore (es. SMTP non configurato)
    // non deve far ripetere a Stripe la consegna all'infinito. Il pagamento
    // autorizzato resta comunque visibile nella dashboard di Stripe.
    console.error(`Errore nella gestione dell'evento Stripe ${event.type}`, error);
  }

  return NextResponse.json({ received: true });
}

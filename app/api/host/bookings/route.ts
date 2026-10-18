import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { verifyBookingAction } from "@/lib/booking-tokens";
import { sendConfirmedEmails, sendReleasedEmails } from "@/lib/booking-payment-emails";

/**
 * Conferma o rifiuto di una prenotazione, dal bottone della pagina
 * /host/prenotazioni/azione (il link firmato arrivato all'host via email).
 *
 * Idempotente: se il pagamento non è più in attesa (doppio clic, link
 * riaperto dopo la decisione) non si ripete né l'incasso né l'invio delle
 * email, si torna solo alla pagina che mostra lo stato.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const pi = String(form.get("pi") || "");
  const exp = Number(form.get("exp"));
  const sig = String(form.get("sig") || "");
  const action = String(form.get("action") || "");

  if (!pi || !verifyBookingAction(pi, exp, sig) || !["confirm", "decline"].includes(action)) {
    return NextResponse.redirect(new URL("/host/prenotazioni/azione", request.url), { status: 303 });
  }

  const landing = new URL(`/host/prenotazioni/azione?${new URLSearchParams({ pi, exp: String(exp), sig })}`, request.url);
  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.retrieve(pi);

  if (paymentIntent.status === "requires_capture") {
    if (action === "confirm") {
      const captured = await stripe.paymentIntents.capture(pi);
      await sendConfirmedEmails(captured).catch((error) =>
        console.error("Prenotazione confermata, ma le email non sono partite", error),
      );
    } else {
      const canceled = await stripe.paymentIntents.cancel(pi);
      await sendReleasedEmails(canceled, "declined").catch((error) =>
        console.error("Richiesta rifiutata, ma le email non sono partite", error),
      );
    }
  }

  return NextResponse.redirect(landing, { status: 303 });
}

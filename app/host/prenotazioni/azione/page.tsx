import type { Metadata } from "next";
import { getStripe } from "@/lib/stripe";
import { verifyBookingAction } from "@/lib/booking-tokens";
import { fromStripeMetadata, nightsBetween } from "@/lib/booking-metadata";

export const metadata: Metadata = {
  title: "Gestisci richiesta di prenotazione",
  robots: { index: false, follow: false },
};

type SearchParams = { pi?: string; exp?: string; sig?: string };

function InvalidLink({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="font-display text-2xl">{message}</h1>
    </div>
  );
}

export default async function HostBookingActionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { pi, exp, sig } = await searchParams;
  const expNumber = Number(exp);

  if (!pi || !sig || !verifyBookingAction(pi, expNumber, sig)) {
    return <InvalidLink message="Link non valido o scaduto." />;
  }

  let status: string;
  let currency: string;
  let amountCents: number;
  let metadata: ReturnType<typeof fromStripeMetadata>;

  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(pi);
    status = paymentIntent.status;
    currency = paymentIntent.currency;
    amountCents = paymentIntent.amount;
    metadata = fromStripeMetadata(paymentIntent.metadata);
  } catch {
    return <InvalidLink message="Prenotazione non trovata." />;
  }

  const nights = nightsBetween(metadata.checkin, metadata.checkout);
  const amount = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
  const pending = status === "requires_capture";

  return (
    <div className="mx-auto max-w-xl px-6 py-16 md:px-10">
      <h1 className="font-display text-3xl">Richiesta di prenotazione</h1>

      <div className="mt-6 space-y-2 rounded-md border border-divider p-6 text-sm">
        <p>
          <strong>{metadata.guestName}</strong> — {metadata.guestEmail}
          {metadata.guestPhone ? ` — ${metadata.guestPhone}` : ""}
        </p>
        <p>
          Check-in: {metadata.checkin} &nbsp;&nbsp; Check-out: {metadata.checkout} ({nights} notti)
        </p>
        <p>Ospiti: {metadata.guests}</p>
        <p>
          Importo: {amount}
          {pending ? " (autorizzato, non ancora addebitato)" : ""}
        </p>
      </div>

      {pending ? (
        <div className="mt-6 flex flex-wrap gap-4">
          <form action="/api/host/bookings/confirm" method="post">
            <input type="hidden" name="pi" value={pi} />
            <input type="hidden" name="exp" value={exp} />
            <input type="hidden" name="sig" value={sig} />
            <button
              type="submit"
              className="rounded-md bg-bordeaux px-6 py-3 text-sm font-medium text-off-white transition-colors hover:bg-bordeaux-dark"
            >
              Conferma prenotazione
            </button>
          </form>
          <form action="/api/host/bookings/decline" method="post">
            <input type="hidden" name="pi" value={pi} />
            <input type="hidden" name="exp" value={exp} />
            <input type="hidden" name="sig" value={sig} />
            <button
              type="submit"
              className="rounded-md border border-divider px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-divider/60"
            >
              Rifiuta
            </button>
          </form>
        </div>
      ) : (
        <p className="mt-6 text-sm text-mid">
          {status === "succeeded"
            ? "Questa prenotazione è già stata confermata."
            : status === "canceled"
              ? "Questa richiesta è già stata rifiutata."
              : `Stato attuale: ${status}`}
        </p>
      )}
    </div>
  );
}

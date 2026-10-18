import type { Metadata } from "next";
import { getStripe } from "@/lib/stripe";
import { verifyBookingAction } from "@/lib/booking-tokens";
import { fromStripeMetadata, type BookingMetadata } from "@/lib/booking-metadata";
import { nightsBetween } from "@/lib/pricing";
import { getBusyRanges } from "@/lib/ical";

export const metadata: Metadata = {
  title: "Prenotazione da confermare",
  robots: { index: false, follow: false },
};

type SearchParams = { pi?: string; exp?: string; sig?: string };

/**
 * Pagina dell'host per una prenotazione pagata: ci si arriva solo dal link
 * firmato dell'email. In italiano, perché la legge solo l'host.
 *
 * Prima dei bottoni ricontrolla il calendario di Airbnb e Booking: fra la
 * richiesta e la decisione possono essere passate ore, e confermare date
 * già vendute altrove vorrebbe dire incassare e poi rimborsare.
 */
function Notice({ title, body }: { title: string; body?: string }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center">
      <h1 className="font-display text-[2.2rem] leading-tight">{title}</h1>
      {body && <p className="mt-4 text-mid">{body}</p>}
    </div>
  );
}

const long = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export default async function HostBookingActionPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { pi, exp, sig } = await searchParams;

  if (!pi || !sig || !exp || !verifyBookingAction(pi, Number(exp), sig)) {
    return <Notice title="Link non valido o scaduto" body="Le prenotazioni restano comunque visibili nella dashboard di Stripe." />;
  }

  let status: string;
  let amount: string;
  let data: BookingMetadata;
  let captureBefore: number | null = null;
  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(pi, { expand: ["latest_charge"] });
    status = paymentIntent.status;
    amount = new Intl.NumberFormat("it-IT", { style: "currency", currency: paymentIntent.currency.toUpperCase() }).format(
      paymentIntent.amount / 100,
    );
    data = fromStripeMetadata(paymentIntent.metadata);
    const charge = paymentIntent.latest_charge;
    if (charge && typeof charge !== "string") captureBefore = charge.payment_method_details?.card?.capture_before ?? null;
  } catch {
    return <Notice title="Prenotazione non trovata" />;
  }

  const pending = status === "requires_capture";
  const nights = nightsBetween(data.checkin, data.checkout);
  const taken = pending
    ? await getBusyRanges()
        .then((busy) => busy.some((b) => data.checkin < b.end && b.start < data.checkout))
        .catch(() => false)
    : false;

  const rows: [string, string][] = [
    ["Ospite", data.guestName],
    ["Email", data.guestEmail],
    ...(data.guestPhone ? [["Telefono", data.guestPhone] as [string, string]] : []),
    ["Arrivo", long(data.checkin)],
    ["Partenza", `${long(data.checkout)} · ${nights} ${nights === 1 ? "notte" : "notti"}`],
    ["Ospiti", data.guests],
    ["Importo", pending ? `${amount}, autorizzato e non ancora addebitato` : amount],
  ];

  return (
    <div className="mx-auto max-w-2xl px-5 pb-20 pt-12 md:px-10 md:pt-20">
      <p className="eyebrow text-bordeaux">Prenotazione diretta</p>
      <h1 className="mt-4 font-display text-[2.4rem] leading-[1.05] md:text-[3rem]">
        {pending ? "Da confermare" : status === "succeeded" ? "Confermata" : "Chiusa"}
      </h1>

      <dl className="mt-10 divide-y divide-divider border-y border-divider">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 py-3.5 text-[0.9375rem]">
            <dt className="text-mid">{label}</dt>
            <dd className="font-medium [overflow-wrap:anywhere]">{value}</dd>
          </div>
        ))}
      </dl>

      {data.guestMessage && (
        <blockquote className="mt-8 border-l-2 border-bordeaux pl-5 text-[0.9375rem] leading-relaxed text-charcoal/85">
          {data.guestMessage}
        </blockquote>
      )}

      {pending ? (
        <>
          {taken && (
            <p role="alert" className="mt-8 rounded-xl border border-bordeaux/40 bg-bordeaux/5 px-5 py-4 text-sm font-medium text-bordeaux">
              Attenzione: adesso queste date risultano occupate su Airbnb o Booking.com. Se non le hai bloccate tu per
              questa prenotazione, rifiuta: l&apos;ospite non pagherà nulla.
            </p>
          )}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            {(["confirm", "decline"] as const).map((action) => (
              <form key={action} action="/api/host/bookings" method="post" className="sm:flex-1">
                <input type="hidden" name="pi" value={pi} />
                <input type="hidden" name="exp" value={exp} />
                <input type="hidden" name="sig" value={sig} />
                <input type="hidden" name="action" value={action} />
                <button type="submit" className={`btn w-full ${action === "confirm" ? "btn-primary" : "btn-ghost"}`}>
                  {action === "confirm" ? `Conferma e incassa ${amount}` : "Rifiuta"}
                </button>
              </form>
            ))}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-mid">
            Confermando, la carta viene addebitata e l&apos;ospite riceve la conferma. Rifiutando, l&apos;autorizzazione
            si annulla e non paga nulla.
            {captureBefore &&
              ` Hai tempo fino a ${new Date(captureBefore * 1000).toLocaleString("it-IT", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Rome",
              })}.`}
          </p>
        </>
      ) : (
        <p className="mt-10 text-[0.9375rem] leading-relaxed text-mid">
          {status === "succeeded"
            ? "Prenotazione confermata e importo addebitato. Ricordati di bloccare le date su Airbnb e Booking.com."
            : status === "canceled"
              ? "La richiesta è stata rifiutata o è scaduta: l'ospite non ha pagato nulla."
              : `Stato del pagamento su Stripe: ${status}.`}
        </p>
      )}
    </div>
  );
}

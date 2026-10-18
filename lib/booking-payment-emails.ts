import type Stripe from "stripe";
import { property } from "@/content/property";
import { legal } from "@/content/legal";
import { sendMail } from "@/lib/mailer";
import { nightsBetween } from "@/lib/pricing";
import { siteUrl } from "@/lib/seo";
import { intlLocale, type Locale } from "@/lib/locale";
import { signBookingAction } from "@/lib/booking-tokens";
import { fromStripeMetadata, type BookingMetadata } from "@/lib/booking-metadata";

/**
 * Email della prenotazione pagata (Stripe), dalla richiesta all'esito.
 *
 * Il percorso: l'ospite autorizza la carta → l'host riceve il link
 * Conferma/Rifiuta → alla conferma l'importo viene addebitato; al rifiuto,
 * o se nessuno decide in tempo, l'autorizzazione decade senza addebito.
 * All'ospite si scrive nella sua lingua, all'host in italiano.
 */

type Stay = {
  data: BookingMetadata;
  nights: number;
  amount: string;
};

function stayFrom(paymentIntent: Stripe.PaymentIntent): Stay {
  const data = fromStripeMetadata(paymentIntent.metadata);
  return {
    data,
    nights: nightsBetween(data.checkin, data.checkout),
    amount: formatAmount(paymentIntent.amount, paymentIntent.currency, data.guestLocale),
  };
}

function formatAmount(cents: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatDate(iso: string, locale: Locale, weekday = false): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(intlLocale[locale], {
    weekday: weekday ? "long" : undefined,
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Ultimo giorno in cui si può cancellare con rimborso totale. */
function freeCancellationUntil(checkin: string): string {
  const date = new Date(`${checkin}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - legal.stay.freeCancellationDays);
  return date.toISOString().slice(0, 10);
}

function canStillCancelForFree(checkin: string): boolean {
  return new Date().toISOString().slice(0, 10) <= freeCancellationUntil(checkin);
}

// Le email all'ospite invitano a rispondere (per cancellare, per una
// domanda): la risposta deve arrivare alla casella dell'host, non al
// mittente tecnico del provider SMTP.
const hostReplyTo = () => process.env.HOST_EMAIL?.trim() || undefined;

const join = (lines: (string | false | null | undefined)[]) =>
  lines.filter((line) => line !== false && line !== null && line !== undefined).join("\n");

// ─────────────────────────────── Ospite ───────────────────────────────

const copy = {
  it: {
    hello: (name: string) => `Ciao ${name},`,
    arrival: "Arrivo",
    departure: "Partenza",
    guests: "Ospiti",
    nights: (n: number) => (n === 1 ? "1 notte" : `${n} notti`),
    received: {
      subject: `Richiesta ricevuta — ${property.name}`,
      intro: `grazie: abbiamo ricevuto la tua richiesta per ${property.name}.`,
      total: "Totale",
      body: [
        "Sulla carta abbiamo solo autorizzato l'importo: non ti è stato addebitato",
        "nulla. Ti confermiamo la prenotazione per email, di solito entro un",
        "giorno, e solo allora l'importo viene addebitato. Se non possiamo",
        "ospitarti, l'autorizzazione si annulla e non paghi niente.",
      ],
    },
    confirmed: {
      subject: `Prenotazione confermata — ${property.name}`,
      intro: "la tua prenotazione è confermata: ti aspettiamo!",
      charged: "Importo addebitato",
      checkin: (url: string) =>
        `Prima dell'arrivo fai il check-in online, è richiesto dalla legge e bastano pochi minuti: ${url}`,
    },
    cancellation: (date: string) =>
      `Puoi cancellare con rimborso totale fino al ${date}: basta rispondere a questa email. Dopo quella data l'importo non è più rimborsabile.`,
    declined: {
      subject: `La tua richiesta per ${property.name}`,
      body: [
        `purtroppo per queste date non possiamo ospitarti. L'autorizzazione sulla`,
        "carta è stata annullata: non ti è stato addebitato nulla.",
        "",
        "Ci dispiace, e speriamo di ospitarti un'altra volta.",
      ],
    },
    expired: {
      subject: `La tua richiesta per ${property.name} è scaduta`,
      body: [
        "non siamo riusciti a confermare la tua richiesta in tempo, e",
        "l'autorizzazione sulla carta è scaduta: non ti è stato addebitato nulla.",
        "",
        "Se vuoi ancora venire, rispondi a questa email o riprova dal sito.",
      ],
    },
    bye: "A presto,",
  },
  en: {
    hello: (name: string) => `Hi ${name},`,
    arrival: "Check-in",
    departure: "Check-out",
    guests: "Guests",
    nights: (n: number) => (n === 1 ? "1 night" : `${n} nights`),
    received: {
      subject: `Request received — ${property.name}`,
      intro: `thank you: we have received your request for ${property.name}.`,
      total: "Total",
      body: [
        "We have only authorised the amount on your card: nothing has been",
        "charged. We will confirm your booking by email, usually within a day,",
        "and only then is the amount charged. If we cannot host you, the",
        "authorisation is cancelled and you pay nothing.",
      ],
    },
    confirmed: {
      subject: `Booking confirmed — ${property.name}`,
      intro: "your booking is confirmed: we look forward to welcoming you!",
      charged: "Amount charged",
      checkin: (url: string) =>
        `Before you arrive, please complete the online check-in: it is required by Italian law and takes a few minutes: ${url}`,
    },
    cancellation: (date: string) =>
      `You can cancel with a full refund until ${date}: just reply to this email. After that date the amount is no longer refundable.`,
    declined: {
      subject: `Your request for ${property.name}`,
      body: [
        "unfortunately we cannot host you on these dates. The authorisation on",
        "your card has been cancelled: you have not been charged anything.",
        "",
        "We are sorry, and we hope to welcome you another time.",
      ],
    },
    expired: {
      subject: `Your request for ${property.name} has expired`,
      body: [
        "we were unable to confirm your request in time, and the authorisation",
        "on your card has expired: you have not been charged anything.",
        "",
        "If you would still like to come, reply to this email or try again on the website.",
      ],
    },
    bye: "See you soon,",
  },
  de: {
    hello: (name: string) => `Guten Tag ${name},`,
    arrival: "Anreise",
    departure: "Abreise",
    guests: "Gäste",
    nights: (n: number) => (n === 1 ? "1 Nacht" : `${n} Nächte`),
    received: {
      subject: `Anfrage erhalten — ${property.name}`,
      intro: `vielen Dank: Wir haben Ihre Anfrage für ${property.name} erhalten.`,
      total: "Gesamtpreis",
      body: [
        "Wir haben den Betrag auf Ihrer Karte nur reserviert: Belastet wurde",
        "nichts. Wir bestätigen Ihre Buchung per E-Mail, meist innerhalb eines",
        "Tages, und erst dann wird der Betrag abgebucht. Können wir Sie nicht",
        "beherbergen, wird die Reservierung aufgehoben und Sie zahlen nichts.",
      ],
    },
    confirmed: {
      subject: `Buchung bestätigt — ${property.name}`,
      intro: "Ihre Buchung ist bestätigt: Wir freuen uns auf Sie!",
      charged: "Abgebuchter Betrag",
      checkin: (url: string) =>
        `Bitte erledigen Sie vor der Anreise den Online-Check-in: Er ist gesetzlich vorgeschrieben und dauert nur wenige Minuten: ${url}`,
    },
    cancellation: (date: string) =>
      `Sie können bis zum ${date} mit voller Rückerstattung stornieren: Antworten Sie einfach auf diese E-Mail. Danach ist der Betrag nicht mehr erstattungsfähig.`,
    declined: {
      subject: `Ihre Anfrage für ${property.name}`,
      body: [
        "leider können wir Sie an diesen Tagen nicht beherbergen. Die Reservierung",
        "auf Ihrer Karte wurde aufgehoben: Es wurde nichts abgebucht.",
        "",
        "Es tut uns leid, und wir hoffen, Sie ein anderes Mal begrüßen zu dürfen.",
      ],
    },
    expired: {
      subject: `Ihre Anfrage für ${property.name} ist abgelaufen`,
      body: [
        "wir konnten Ihre Anfrage nicht rechtzeitig bestätigen, und die",
        "Reservierung auf Ihrer Karte ist abgelaufen: Es wurde nichts abgebucht.",
        "",
        "Wenn Sie trotzdem kommen möchten, antworten Sie auf diese E-Mail oder versuchen Sie es erneut auf der Website.",
      ],
    },
    bye: "Bis bald,",
  },
} satisfies Record<Locale, unknown>;

function stayLines({ data, nights }: Stay, locale: Locale): string[] {
  const t = copy[locale];
  return [
    `${t.arrival}: ${formatDate(data.checkin, locale, true)}`,
    `${t.departure}: ${formatDate(data.checkout, locale, true)} (${t.nights(nights)})`,
    `${t.guests}: ${data.guests}`,
  ];
}

// ──────────────────────────── Invii, per fase ────────────────────────────

/** Subito dopo il pagamento autorizzato: all'host il link per decidere, all'ospite la ricevuta della richiesta. */
export async function sendRequestEmails(paymentIntent: Stripe.PaymentIntent, captureBefore: number | null) {
  const stay = stayFrom(paymentIntent);
  const { data, nights } = stay;
  const { exp, sig } = signBookingAction(paymentIntent.id);
  const url = `${siteUrl}/host/prenotazioni/azione?${new URLSearchParams({ pi: paymentIntent.id, exp: String(exp), sig })}`;
  const deadline = captureBefore
    ? new Date(captureBefore * 1000).toLocaleString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Rome",
      })
    : null;
  const amountIt = formatAmount(paymentIntent.amount, paymentIntent.currency, "it");

  const host = join([
    `Nuova prenotazione da confermare per ${property.name}.`,
    "",
    `Ospite: ${data.guestName}`,
    `Email: ${data.guestEmail}`,
    data.guestPhone && `Telefono: ${data.guestPhone}`,
    `Lingua: ${{ it: "italiano", en: "inglese", de: "tedesco" }[data.guestLocale]}`,
    "",
    ...stayLines(stay, "it"),
    `Importo autorizzato, non ancora addebitato: ${amountIt}`,
    data.guestMessage && "",
    data.guestMessage && "Messaggio dell'ospite:",
    data.guestMessage,
    "",
    "Prima di confermare controlla che le date siano ancora libere su Airbnb",
    "e Booking.com: il calendario del sito legge i loro feed, ma con qualche",
    "ora di ritardo.",
    "",
    `Conferma o rifiuta qui: ${url}`,
    "",
    deadline
      ? `Hai tempo fino a ${deadline}: dopo, l'autorizzazione scade da sola e l'ospite viene avvisato.`
      : "L'autorizzazione dura pochi giorni: decidi il prima possibile.",
  ]);

  const t = copy[data.guestLocale];
  const guest = join([
    t.hello(data.guestName),
    "",
    t.received.intro,
    "",
    ...stayLines(stay, data.guestLocale),
    `${t.received.total}: ${stay.amount}`,
    "",
    ...t.received.body,
    "",
    t.cancellation(formatDate(freeCancellationUntil(data.checkin), data.guestLocale)),
    "",
    property.host.name,
  ]);

  await Promise.all([
    sendMail({
      subject: `Da confermare: ${data.guestName}, ${formatDate(data.checkin, "it")} (${nights} notti)`,
      text: host,
      replyTo: data.guestEmail,
    }),
    sendMail({ to: data.guestEmail, subject: t.received.subject, text: guest, replyTo: hostReplyTo() }),
  ]);
}

/** Dopo la conferma dell'host (importo addebitato). */
export async function sendConfirmedEmails(paymentIntent: Stripe.PaymentIntent) {
  const stay = stayFrom(paymentIntent);
  const { data } = stay;
  const t = copy[data.guestLocale];
  const until = formatDate(freeCancellationUntil(data.checkin), data.guestLocale);

  const guest = join([
    t.hello(data.guestName),
    "",
    t.confirmed.intro,
    "",
    ...stayLines(stay, data.guestLocale),
    `${t.confirmed.charged}: ${stay.amount}`,
    "",
    t.confirmed.checkin(`${siteUrl}/check-in`),
    "",
    canStillCancelForFree(data.checkin) && t.cancellation(until),
    canStillCancelForFree(data.checkin) && "",
    t.bye,
    property.host.name,
  ]);

  const host = join([
    `Hai confermato la prenotazione di ${data.guestName}: l'importo è stato addebitato.`,
    "",
    ...stayLines(stay, "it"),
    `Importo: ${formatAmount(paymentIntent.amount, paymentIntent.currency, "it")}`,
    "",
    "Adesso blocca le stesse date su Airbnb e Booking.com: il sito non può",
    "farlo al posto tuo, e finché non lo fai le piattaforme le vendono ancora.",
    "",
    `Cancellazione gratuita per l'ospite fino al ${formatDate(freeCancellationUntil(data.checkin), "it")}.`,
    "Se cancella entro quella data, rimborsalo dalla dashboard di Stripe",
    "(Pagamenti → apri il pagamento → Rimborsa).",
  ]);

  await Promise.all([
    sendMail({ to: data.guestEmail, subject: t.confirmed.subject, text: guest, replyTo: hostReplyTo() }),
    sendMail({
      subject: `Confermata: ${data.guestName}, ${formatDate(data.checkin, "it")}`,
      text: host,
      replyTo: data.guestEmail,
    }),
  ]);
}

/** Dopo il rifiuto dell'host, oppure quando l'autorizzazione scade da sola. */
export async function sendReleasedEmails(paymentIntent: Stripe.PaymentIntent, reason: "declined" | "expired") {
  const stay = stayFrom(paymentIntent);
  const { data } = stay;
  const t = copy[data.guestLocale][reason];

  const guest = join([copy[data.guestLocale].hello(data.guestName), "", ...t.body, "", property.host.name]);
  const host =
    reason === "declined"
      ? `Hai rifiutato la richiesta di ${data.guestName} (arrivo ${formatDate(data.checkin, "it")}). L'autorizzazione è stata annullata: nessun addebito.`
      : `La richiesta di ${data.guestName} (arrivo ${formatDate(data.checkin, "it")}) è scaduta senza conferma: Stripe ha annullato l'autorizzazione e l'ospite è stato avvisato.`;

  await Promise.all([
    sendMail({ to: data.guestEmail, subject: t.subject, text: guest, replyTo: hostReplyTo() }),
    sendMail({
      subject: `${reason === "declined" ? "Rifiutata" : "Scaduta"}: ${data.guestName}, ${formatDate(data.checkin, "it")}`,
      text: host,
      replyTo: data.guestEmail,
    }),
  ]);
}

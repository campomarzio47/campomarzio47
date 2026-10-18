import { property } from "@/content/property";
import { legal } from "@/content/legal";
import { sendMail } from "@/lib/mailer";
import { nightsBetween } from "@/lib/pricing";
import { intlLocale, type Locale } from "@/lib/locale";

/**
 * Email generate da una richiesta di prenotazione diretta.
 *
 * Il sito non incassa nulla: la richiesta è solo un messaggio strutturato.
 * Per questo i testi insistono su un punto — finché l'host non risponde
 * per iscritto, la prenotazione non esiste e le date restano libere per
 * altri. Dirlo qui, e non solo in /termini, evita che un ospite dia per
 * scontato di aver prenotato.
 */
export type BookingRequest = {
  checkin: string;
  checkout: string;
  guests: number;
  nome: string;
  email: string;
  telefono: string;
  messaggio: string;
  locale: Locale;
  /** Totale indicativo in euro, come mostrato all'ospite sul sito. */
  total: number;
};

function formatAmount(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: property.pricing.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string, locale: Locale): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(intlLocale[locale], {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function hostText(request: BookingRequest, nights: number): string {
  return [
    `Nuova richiesta di prenotazione diretta per ${property.name}.`,
    "",
    `Ospite: ${request.nome}`,
    `Email: ${request.email}`,
    request.telefono ? `Telefono: ${request.telefono}` : "",
    `Check-in: ${formatDate(request.checkin, "it")}`,
    `Check-out: ${formatDate(request.checkout, "it")}    Notti: ${nights}`,
    `Ospiti: ${request.guests}`,
    `Totale indicativo mostrato sul sito: ${formatAmount(request.total, "it")}`,
    request.messaggio ? "" : "",
    request.messaggio ? "Messaggio dell'ospite:" : "",
    request.messaggio || "",
    "",
    "Nessun pagamento è stato richiesto e nessuna carta è stata raccolta.",
    "Per confermare rispondi direttamente a questa email: parte già",
    "all'indirizzo dell'ospite.",
    "",
    "Prima di confermare, controlla che queste date non siano già occupate",
    "su Airbnb o Booking.com: il calendario del sito legge i loro feed, ma",
    "non conosce le altre richieste dirette ancora in sospeso.",
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");
}

function guestCopy(request: BookingRequest, nights: number) {
  const checkin = formatDate(request.checkin, request.locale);
  const checkout = formatDate(request.checkout, request.locale);
  const total = formatAmount(request.total, request.locale);
  const hours = legal.stay.paymentDueHoursBeforeArrival;

  if (request.locale === "de") {
    return {
      subject: `Wir haben Ihre Anfrage erhalten — ${property.name}`,
      text: [
        `Guten Tag ${request.nome},`,
        "",
        `vielen Dank für Ihre Anfrage für ${property.name}. Das haben Sie uns gesendet:`,
        "",
        `Anreise: ${checkin}`,
        `Abreise: ${checkout} (${nights} ${nights === 1 ? "Nacht" : "Nächte"})`,
        `Gäste: ${request.guests}`,
        `Voraussichtlicher Gesamtpreis: ${total}`,
        "",
        "Bitte beachten Sie: Dies ist eine Anfrage, noch keine Buchung. Die",
        "Termine sind erst reserviert, wenn wir sie Ihnen schriftlich bestätigen,",
        "und es wurde Ihnen nichts berechnet — wir haben keine Kartendaten erfragt.",
        "",
        "Wenn wir Sie beherbergen können, senden wir Ihnen eine Bestätigung mit",
        `dem endgültigen Preis und den Zahlungsmodalitäten. Der Betrag ist spätestens ${hours}`,
        "Stunden vor der Anreise fällig; dann senden wir Ihnen auch den Zugangscode.",
        "",
        "Wir antworten meist innerhalb von ein bis zwei Tagen.",
        "",
        property.host.name,
      ].join("\n"),
    };
  }

  if (request.locale === "en") {
    return {
      subject: `We received your booking request — ${property.name}`,
      text: [
        `Hi ${request.nome},`,
        "",
        `Thank you for your request for ${property.name}. Here is what you sent us:`,
        "",
        `Check-in: ${checkin}`,
        `Check-out: ${checkout} (${nights} nights)`,
        `Guests: ${request.guests}`,
        `Indicative total: ${total}`,
        "",
        "Please note: this is a request, not a booking yet. The dates are",
        "not reserved until we reply confirming them in writing, and you",
        "have not been charged anything — we never asked for card details.",
        "",
        `If we can host you, we will send you a confirmation with the final`,
        `price and how to pay. The balance is due no later than ${hours} hours`,
        "before arrival, when we send you the access code to the house.",
        "",
        "We usually reply within a couple of days.",
        "",
        property.host.name,
      ].join("\n"),
    };
  }

  return {
    subject: `Abbiamo ricevuto la tua richiesta — ${property.name}`,
    text: [
      `Ciao ${request.nome},`,
      "",
      `grazie per la tua richiesta per ${property.name}. Ecco cosa ci hai inviato:`,
      "",
      `Check-in: ${checkin}`,
      `Check-out: ${checkout} (${nights} notti)`,
      `Ospiti: ${request.guests}`,
      `Totale indicativo: ${total}`,
      "",
      "Una precisazione importante: questa è una richiesta, non ancora una",
      "prenotazione. Le date non sono riservate finché non ti rispondiamo",
      "confermandole per iscritto, e non ti è stato addebitato nulla — non",
      "ti abbiamo chiesto alcun dato della carta.",
      "",
      "Se possiamo ospitarti ti manderemo una conferma con il prezzo",
      `definitivo e le modalità di pagamento. Il saldo è dovuto entro ${hours}`,
      "ore prima dell'arrivo, quando ti inviamo il codice di accesso alla casa.",
      "",
      "Di solito rispondiamo entro un paio di giorni.",
      "",
      property.host.name,
    ].join("\n"),
  };
}

export async function sendBookingRequestEmails(request: BookingRequest): Promise<void> {
  const nights = nightsBetween(request.checkin, request.checkout);
  const guest = guestCopy(request, nights);

  await Promise.all([
    sendMail({
      subject: `Richiesta di prenotazione — ${formatDate(request.checkin, "it")} (${nights} notti)`,
      text: hostText(request, nights),
      replyTo: request.email,
    }),
    sendMail({ to: request.email, subject: guest.subject, text: guest.text }),
  ]);
}

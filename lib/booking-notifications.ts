import type Stripe from "stripe";
import { property } from "@/content/property";
import { sendMail } from "@/lib/mailer";
import { signBookingAction } from "@/lib/booking-tokens";
import { fromStripeMetadata, nightsBetween, type BookingMetadata } from "@/lib/booking-metadata";

type Locale = BookingMetadata["guestLocale"];

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatDate(iso: string, locale: Locale): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale === "en" ? "en-GB" : "it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function buildLandingUrl(baseUrl: string, paymentIntentId: string, exp: number, sig: string): string {
  const params = new URLSearchParams({ pi: paymentIntentId, exp: String(exp), sig });
  return `${baseUrl}/host/prenotazioni/azione?${params.toString()}`;
}

// Email all'host: nuova richiesta da esaminare, con il link (unico, valido
// sia per confermare sia per rifiutare) alla pagina di gestione.
export async function sendHostReviewEmail(params: {
  paymentIntent: Stripe.PaymentIntent;
  baseUrl: string;
}) {
  const { paymentIntent, baseUrl } = params;
  const metadata = fromStripeMetadata(paymentIntent.metadata);
  const nights = nightsBetween(metadata.checkin, metadata.checkout);
  const { exp, sig } = signBookingAction(paymentIntent.id);
  const url = buildLandingUrl(baseUrl, paymentIntent.id, exp, sig);
  const amount = formatAmount(paymentIntent.amount, paymentIntent.currency);

  const text = [
    `Nuova richiesta di prenotazione diretta per ${property.name}.`,
    "",
    `Ospite: ${metadata.guestName}`,
    `Email: ${metadata.guestEmail}`,
    metadata.guestPhone ? `Telefono: ${metadata.guestPhone}` : "",
    `Check-in: ${formatDate(metadata.checkin, "it")}`,
    `Check-out: ${formatDate(metadata.checkout, "it")}    Notti: ${nights}`,
    `Ospiti: ${metadata.guests}`,
    `Importo autorizzato (non ancora addebitato): ${amount}`,
    "",
    "La carta è stata solo autorizzata, non ancora addebitata. Prima di",
    "confermare, controlla che queste date non siano già occupate su",
    "Airbnb o Booking.com.",
    "",
    `Conferma o rifiuta qui: ${url}`,
    "",
    "Il link scade tra 7 giorni.",
  ]
    .filter(Boolean)
    .join("\n");

  await sendMail({
    subject: `Nuova richiesta di prenotazione — ${formatDate(metadata.checkin, "it")} (${nights} notti)`,
    text,
    replyTo: metadata.guestEmail,
  });
}

function guestReceivedCopy(metadata: BookingMetadata, nights: number, amount: string) {
  const checkin = formatDate(metadata.checkin, metadata.guestLocale);
  const checkout = formatDate(metadata.checkout, metadata.guestLocale);

  if (metadata.guestLocale === "en") {
    return {
      subject: `Booking request received — ${property.name}`,
      text: [
        `Hi ${metadata.guestName},`,
        "",
        `We've received your booking request for ${property.name}.`,
        `Check-in: ${checkin}`,
        `Check-out: ${checkout} (${nights} nights)`,
        `Guests: ${metadata.guests}`,
        `Amount authorised on your card: ${amount} (not charged yet).`,
        "",
        "The host will review your request and confirm within a couple of",
        "days. Your card will only be charged if the booking is confirmed;",
        "otherwise the authorisation is simply released, with no charge.",
        "",
        property.host.name,
      ].join("\n"),
    };
  }

  return {
    subject: `Richiesta di prenotazione ricevuta — ${property.name}`,
    text: [
      `Ciao ${metadata.guestName},`,
      "",
      `Abbiamo ricevuto la tua richiesta di prenotazione per ${property.name}.`,
      `Check-in: ${checkin}`,
      `Check-out: ${checkout} (${nights} notti)`,
      `Ospiti: ${metadata.guests}`,
      `Importo autorizzato sulla tua carta: ${amount} (non ancora addebitato).`,
      "",
      "L'host esaminerà la richiesta e confermerà entro un paio di giorni.",
      "La carta verrà addebitata solo in caso di conferma; altrimenti",
      "l'autorizzazione viene semplicemente rilasciata, senza alcun addebito.",
      "",
      property.host.name,
    ].join("\n"),
  };
}

export async function sendGuestReceivedEmail(paymentIntent: Stripe.PaymentIntent) {
  const metadata = fromStripeMetadata(paymentIntent.metadata);
  const nights = nightsBetween(metadata.checkin, metadata.checkout);
  const amount = formatAmount(paymentIntent.amount, paymentIntent.currency);
  const { subject, text } = guestReceivedCopy(metadata, nights, amount);

  await sendMail({ to: metadata.guestEmail, subject, text });
}

function guestConfirmedCopy(metadata: BookingMetadata, nights: number, amount: string) {
  const checkin = formatDate(metadata.checkin, metadata.guestLocale);
  const checkout = formatDate(metadata.checkout, metadata.guestLocale);

  if (metadata.guestLocale === "en") {
    return {
      subject: `Booking confirmed — ${property.name}`,
      text: [
        `Hi ${metadata.guestName},`,
        "",
        `Great news — your booking for ${property.name} is confirmed!`,
        `Check-in: ${checkin}`,
        `Check-out: ${checkout} (${nights} nights)`,
        `Amount charged: ${amount}`,
        "",
        `See you soon,`,
        property.host.name,
      ].join("\n"),
    };
  }

  return {
    subject: `Prenotazione confermata — ${property.name}`,
    text: [
      `Ciao ${metadata.guestName},`,
      "",
      `Ottime notizie — la tua prenotazione per ${property.name} è confermata!`,
      `Check-in: ${checkin}`,
      `Check-out: ${checkout} (${nights} notti)`,
      `Importo addebitato: ${amount}`,
      "",
      "A presto,",
      property.host.name,
    ].join("\n"),
  };
}

// Email di conferma inviate a ospite e host dopo che l'host ha catturato
// il pagamento (POST /api/host/bookings/confirm).
export async function sendConfirmedEmails(paymentIntent: Stripe.PaymentIntent) {
  const metadata = fromStripeMetadata(paymentIntent.metadata);
  const nights = nightsBetween(metadata.checkin, metadata.checkout);
  const amount = formatAmount(paymentIntent.amount, paymentIntent.currency);
  const guest = guestConfirmedCopy(metadata, nights, amount);

  const hostText = [
    `Hai confermato la prenotazione di ${metadata.guestName} per ${property.name}.`,
    `Check-in: ${formatDate(metadata.checkin, "it")}`,
    `Check-out: ${formatDate(metadata.checkout, "it")}    Notti: ${nights}`,
    `Importo addebitato: ${amount}`,
    "",
    "Ricordati di bloccare queste stesse date sul calendario di Airbnb e",
    "Booking.com: non esiste una sincronizzazione automatica gratuita tra",
    "questo sito e le piattaforme.",
  ].join("\n");

  await Promise.all([
    sendMail({ to: metadata.guestEmail, subject: guest.subject, text: guest.text }),
    sendMail({
      subject: `Prenotazione confermata — ${metadata.guestName}, ${formatDate(metadata.checkin, "it")}`,
      text: hostText,
      replyTo: metadata.guestEmail,
    }),
  ]);
}

function guestDeclinedCopy(metadata: BookingMetadata) {
  if (metadata.guestLocale === "en") {
    return {
      subject: `About your booking request — ${property.name}`,
      text: [
        `Hi ${metadata.guestName},`,
        "",
        `Unfortunately we're unable to accept your booking request for`,
        `${property.name} for the requested dates. The authorisation on`,
        "your card has been released — you have not been charged.",
        "",
        "We're sorry for the inconvenience and hope to host you another time.",
        "",
        property.host.name,
      ].join("\n"),
    };
  }

  return {
    subject: `La tua richiesta di prenotazione — ${property.name}`,
    text: [
      `Ciao ${metadata.guestName},`,
      "",
      `Purtroppo non possiamo accettare la tua richiesta di prenotazione per`,
      `${property.name} per le date richieste. L'autorizzazione sulla tua`,
      "carta è stata rilasciata — non hai subito alcun addebito.",
      "",
      "Ci scusiamo per il disagio e speriamo di ospitarti in un'altra occasione.",
      "",
      property.host.name,
    ].join("\n"),
  };
}

// Email inviate dopo il rifiuto (POST /api/host/bookings/decline).
export async function sendDeclinedEmails(paymentIntent: Stripe.PaymentIntent) {
  const metadata = fromStripeMetadata(paymentIntent.metadata);
  const guest = guestDeclinedCopy(metadata);

  const hostText = [
    `Hai rifiutato la richiesta di prenotazione di ${metadata.guestName} per`,
    `${property.name} (check-in ${formatDate(metadata.checkin, "it")}).`,
    "L'autorizzazione è stata rilasciata, nessun addebito effettuato.",
  ].join("\n");

  await Promise.all([
    sendMail({ to: metadata.guestEmail, subject: guest.subject, text: guest.text }),
    sendMail({
      subject: `Richiesta rifiutata — ${metadata.guestName}`,
      text: hostText,
      replyTo: metadata.guestEmail,
    }),
  ]);
}

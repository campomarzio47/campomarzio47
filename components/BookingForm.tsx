"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import type { DateRange } from "react-day-picker";
import { ArrowRight } from "lucide-react";
import DateRangeCalendar, {
  CalendarLegend,
  RangeHint,
  nightsInRange,
} from "@/components/DateRangeCalendar";
import Stepper from "@/components/Stepper";
import PrivacyAck from "@/components/PrivacyAck";
import { useLocale } from "@/components/LocaleProvider";
import { property } from "@/content/property";
import { legal } from "@/content/legal";
import PageHeader from "@/components/PageHeader";
import { MESSAGE_MAX } from "@/lib/booking-metadata";
import { fill, plural, type Dictionary } from "@/content/dictionaries";
import { formatWeekdayDayMonth } from "@/lib/date-locale";
import { intlLocale } from "@/lib/locale";
import { useBusyRanges } from "@/lib/hooks/useBusyRanges";

type Status = "idle" | "sending" | "sent" | "redirecting" | "error";
type ErrorCode = keyof Dictionary["booking"]["errors"];

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function initialRangeFrom(from?: string, to?: string): DateRange | undefined {
  if (!from || !to) return undefined;
  // "2026-10-23" letto come data locale, non come mezzanotte UTC: in
  // America sarebbe diventato il 22.
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const fromDate = new Date(fy, fm - 1, fd);
  const toDate = new Date(ty, tm - 1, td);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return undefined;
  return { from: fromDate, to: toDate };
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="border-t border-charcoal pt-6">
      <h2 className="mb-6 flex items-baseline gap-4">
        <span className="tabular font-display text-lg italic text-bordeaux">
          {String(n).padStart(2, "0")}
        </span>
        <span className="font-display text-[1.85rem] leading-none md:text-[2.2rem]">{title}</span>
      </h2>
      {children}
    </section>
  );
}

/**
 * Prenotazione: date, ospiti, dati, in quest'ordine e numerati.
 *
 * Due modi, decisi dal server (`payments`): con Stripe il bottone porta
 * alla pagina di pagamento, che autorizza la carta; senza, la richiesta
 * parte via email. Cambiano solo le parole, il bottone e la casella dei
 * Termini: la forma della pagina resta la stessa.
 * Il riepilogo col prezzo resta di lato su desktop; su telefono il totale
 * e il bottone d'invio stanno in una barra che segue lo scorrimento.
 * Un unico <form>: anche la casella privacy e il bottone del riepilogo ne
 * fanno parte, così la validazione del browser vale per tutto.
 */
export default function BookingForm({
  initialFrom,
  initialTo,
  payments = false,
  canceled = false,
}: {
  initialFrom?: string;
  initialTo?: string;
  payments?: boolean;
  /** Di ritorno da Stripe dopo aver annullato il pagamento. */
  canceled?: boolean;
} = {}) {
  const { dict, locale } = useLocale();
  const pay = dict.booking.pay;
  const promises = payments
    ? pay.promises.map((p) => fill(p, { days: legal.stay.freeCancellationDays }))
    : dict.booking.promises;
  const showTouristTax = legal.stay.touristTax.applies !== false;
  const availability = useBusyRanges();
  const [range, setRange] = useState<DateRange | undefined>(() =>
    initialRangeFrom(initialFrom, initialTo),
  );
  const [guests, setGuests] = useState(Math.min(2, property.facts.maxGuests));
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [privacyAck, setPrivacyAck] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
  const [datesMissing, setDatesMissing] = useState(false);
  const datesRef = useRef<HTMLDivElement>(null);

  const nights = nightsInRange(range);
  const minNights = property.pricing.minNights || 1;
  const { pricePerNight, cleaningFee, currency } = property.pricing;
  const validStay = nights >= minNights;
  const total = validStay ? nights * pricePerNight + cleaningFee : 0;
  const money = (amount: number) =>
    new Intl.NumberFormat(intlLocale[locale], {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  const short = (d: Date) => formatWeekdayDayMonth(d, locale);

  useEffect(() => {
    // Tornando indietro da Stripe col tasto del browser, la pagina può
    // riapparire dalla cache con il bottone ancora fermo su "Ti portiamo
    // su Stripe…".
    function onShow(e: PageTransitionEvent) {
      if (e.persisted) setStatus("idle");
    }
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!range?.from || !range?.to || !validStay) {
      setDatesMissing(true);
      datesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setStatus("sending");
    setErrorCode(null);

    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkin: toIso(range.from),
          checkout: toIso(range.to),
          guests,
          nome,
          email,
          telefono,
          messaggio,
          privacyAck,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorCode((data.code as ErrorCode) || "server_error");
        setStatus("error");
        return;
      }

      if (data.url) {
        // Pagina di pagamento di Stripe: il bottone resta in attesa finché
        // il browser non ha lasciato la pagina.
        setStatus("redirecting");
        window.location.assign(data.url);
        return;
      }

      setStatus("sent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrorCode("server_error");
      setStatus("error");
    }
  }

  // Conferma mostrata al posto del modulo. `role="status"` perché chi usa
  // uno screen reader non vedrebbe altrimenti che la pagina è cambiata.
  if (status === "sent") {
    return (
      <>
        <PageHeader section="booking" />
        <Confirmation
          title={dict.bookingConfirmation.title}
          body={dict.bookingConfirmation.subtitle}
          back={dict.bookingConfirmation.back}
        />
      </>
    );
  }

  const sending = status === "sending" || status === "redirecting";
  const submitLabel = sending
    ? payments
      ? pay.redirecting
      : dict.booking.sendingLabel
    : payments
      ? pay.submit
      : dict.booking.submitButton;

  return (
    <>
      <PageHeader section="booking" subtitle={payments ? pay.subtitle : undefined} />
      {canceled && status === "idle" && (
        <p role="status" className="-mt-6 mb-10 max-w-xl rounded-xl border border-divider bg-paper px-5 py-4 text-[0.9375rem] leading-relaxed md:-mt-10">
          {pay.canceled}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className="grid gap-x-16 gap-y-14 md:grid-cols-[minmax(0,1fr)_22rem] lg:grid-cols-[minmax(0,1fr)_24rem]"
      >
        <div className="flex flex-col gap-14">
          <div ref={datesRef} className="scroll-mt-28">
            <Step n={1} title={dict.booking.stepDates}>
              <div className="rounded-[1.25rem] border border-divider bg-paper p-4 sm:p-6">
                {availability.state === "loading" ? (
                  <div className="flex h-80 items-center justify-center text-sm text-mid">
                    {dict.availability.loading}
                  </div>
                ) : availability.state === "ready" ? (
                  <DateRangeCalendar
                    value={range}
                    onChange={(next) => {
                      setRange(next);
                      setDatesMissing(false);
                    }}
                    availability={availability}
                  />
                ) : (
                  <p className="text-sm text-mid">
                    {availability.state === "error" ? dict.availability.error : dict.availability.unconfigured}
                  </p>
                )}
                <div className="mt-5 flex flex-col gap-3 border-t border-divider pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <RangeHint value={range} />
                  <CalendarLegend />
                </div>
              </div>
              {datesMissing && (
                <p role="alert" className="mt-3 text-sm font-medium text-bordeaux">
                  {nights > 0 && !validStay
                    ? fill(dict.booking.minNightsWarning, { min: minNights })
                    : dict.booking.missingDates}
                </p>
              )}
            </Step>
          </div>

          <Step n={2} title={dict.booking.stepGuests}>
            <Stepper
              id="booking-guests"
              label={dict.booking.guestsLabel}
              hint={fill(dict.booking.guestsHint, { max: property.facts.maxGuests })}
              value={guests}
              min={1}
              max={property.facts.maxGuests}
              onChange={setGuests}
            />
          </Step>

          <Step n={3} title={dict.booking.stepDetails}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="field-label sm:col-span-2" htmlFor="booking-name">
                {dict.booking.nameLabel}
                <input
                  id="booking-name"
                  required
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="field"
                />
              </label>
              <label className="field-label" htmlFor="booking-email">
                {dict.booking.emailLabel}
                <input
                  id="booking-email"
                  required
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field"
                />
              </label>
              <label className="field-label" htmlFor="booking-phone">
                <span>
                  {dict.booking.phoneLabel}{" "}
                  <span className="font-normal text-mid">({dict.booking.optionalLabel})</span>
                </span>
                <input
                  id="booking-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="field"
                />
              </label>
              <label className="field-label sm:col-span-2" htmlFor="booking-message">
                <span>
                  {dict.booking.messageLabel}{" "}
                  <span className="font-normal text-mid">({dict.booking.optionalLabel})</span>
                </span>
                <textarea
                  id="booking-message"
                  rows={3}
                  // Con Stripe il messaggio viaggia nei metadata del pagamento,
                  // che non accettano più di 500 caratteri.
                  maxLength={payments ? MESSAGE_MAX : 2000}
                  placeholder={dict.booking.messagePlaceholder}
                  value={messaggio}
                  onChange={(e) => setMessaggio(e.target.value)}
                  className="field"
                />
              </label>
            </div>
          </Step>
        </div>

        <aside className="md:sticky md:top-[calc(var(--header-height)+2rem)] md:self-start">
          <div className="rounded-[1.25rem] border border-divider bg-paper p-6 md:p-7">
            <h2 className="font-display text-2xl">{dict.booking.summaryTitle}</h2>

            <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-divider bg-divider text-sm">
              <div className="bg-paper px-4 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mid">
                  {dict.availabilityBar.arrivalLabel}
                </dt>
                <dd className="mt-1 font-medium first-letter:uppercase">
                  {range?.from ? short(range.from) : "—"}
                </dd>
              </div>
              <div className="bg-paper px-4 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mid">
                  {dict.availabilityBar.departureLabel}
                </dt>
                <dd className="mt-1 font-medium first-letter:uppercase">
                  {range?.to && nights > 0 ? short(range.to) : "—"}
                </dd>
              </div>
            </dl>

            <dl className="mt-5 flex flex-col gap-2 text-[0.9375rem]">
              <div className="flex justify-between text-mid">
                <dt>
                  {nights > 0
                    ? `${money(pricePerNight)} × ${plural(dict.availabilityBar.nights, nights)}`
                    : `${money(pricePerNight)} ${dict.availabilityBar.perNight}`}
                </dt>
                <dd className="tabular">{validStay ? money(nights * pricePerNight) : "—"}</dd>
              </div>
              {cleaningFee > 0 && (
                <div className="flex justify-between text-mid">
                  <dt>{dict.booking.cleaningFeeLabel}</dt>
                  <dd className="tabular">{money(cleaningFee)}</dd>
                </div>
              )}
              <div className="mt-2 flex items-baseline justify-between border-t border-divider pt-4">
                <dt className="font-medium">{payments ? pay.totalLabel : dict.booking.totalLabel}</dt>
                <dd className="tabular font-display text-3xl">{validStay ? money(total) : "—"}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-mid">
              {payments ? pay.note : dict.booking.quoteNote}
              {showTouristTax && ` ${dict.booking.touristTaxNote}`}
            </p>

            <div className="mt-6 border-t border-divider pt-5">
              <PrivacyAck id="booking-privacy" checked={privacyAck} onChange={setPrivacyAck} withTerms={payments} />
            </div>

            <button type="submit" disabled={sending} className="btn btn-primary mt-6 hidden w-full md:flex">
              {submitLabel}
              {!sending && <ArrowRight size={17} strokeWidth={2} aria-hidden="true" className="arrow" />}
            </button>

            {status === "error" && errorCode && (
              <p role="alert" className="mt-4 text-sm font-medium text-bordeaux">
                {dict.booking.errors[errorCode]}
              </p>
            )}

            <ul className="mt-6 flex flex-col gap-2 border-t border-divider pt-5 text-sm text-mid">
              {promises.map((promise) => (
                <li key={promise} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="checker h-2.5 w-2.5 flex-none opacity-80"
                    style={{ "--checker-size": "2.5px" } as CSSProperties}
                  />
                  {promise}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Telefono: totale e invio sempre a portata di pollice. */}
        <div className="sticky bottom-0 z-20 -mx-5 -mb-px border-t border-divider bg-paper/95 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="tabular font-display text-xl leading-tight">{validStay ? money(total) : "—"}</p>
              <p className="truncate text-xs text-mid">
                {validStay && range?.from && range.to
                  ? `${short(range.from)} – ${short(range.to)} · ${plural(dict.availabilityBar.nights, nights)}`
                  : dict.booking.noDates}
              </p>
            </div>
            <button type="submit" disabled={sending} className="btn btn-primary flex-none">
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export function Confirmation({ title, body, back }: { title: string; body: string; back: string }) {
  return (
    <div role="status" className="animate-fade-up mx-auto max-w-xl py-10 text-center">
      <svg viewBox="0 0 64 64" className="mx-auto h-16 w-16" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="none" stroke="var(--color-divider)" strokeWidth="1.5" />
        <path
          d="M20 33 l8 8 l16 -18"
          fill="none"
          stroke="var(--color-bordeaux)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-check"
        />
      </svg>
      <p className="mt-8 font-display text-[2.6rem] leading-none">{title}</p>
      <p className="mt-5 text-[1.0625rem] leading-relaxed text-mid">{body}</p>
      <Link href="/" className="btn btn-ghost mt-10">
        {back}
      </Link>
    </div>
  );
}

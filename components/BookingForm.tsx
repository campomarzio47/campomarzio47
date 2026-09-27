"use client";

import { useState, type FormEvent } from "react";
import type { DateRange } from "react-day-picker";
import BookingCalendar, { nightsInRange } from "@/components/BookingCalendar";
import PrivacyAck from "@/components/PrivacyAck";
import { useLocale } from "@/components/LocaleProvider";
import { property } from "@/content/property";
import type { Dictionary } from "@/content/dictionaries";

type Status = "idle" | "sending" | "sent" | "error";
type ErrorCode = keyof Dictionary["booking"]["errors"];

const inputClasses =
  "w-full rounded-md border border-divider bg-off-white px-3 py-2 text-sm outline-none placeholder:text-mid focus:border-bordeaux focus-visible:ring-2 focus-visible:ring-bordeaux";
const labelClasses = "flex flex-col gap-1 text-xs text-mid";

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatPrice(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "it-IT", {
    style: "currency",
    currency,
  }).format(amount);
}

function initialRangeFrom(from?: string, to?: string): DateRange | undefined {
  if (!from || !to) return undefined;
  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return undefined;
  return { from: fromDate, to: toDate };
}

export default function BookingForm({
  initialFrom,
  initialTo,
}: {
  initialFrom?: string;
  initialTo?: string;
} = {}) {
  const { dict, locale } = useLocale();
  const [range, setRange] = useState<DateRange | undefined>(() =>
    initialRangeFrom(initialFrom, initialTo),
  );
  const [guests, setGuests] = useState(1);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [privacyAck, setPrivacyAck] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);

  const nights = nightsInRange(range);
  const minNights = property.pricing.minNights || 1;
  const { pricePerNight, cleaningFee, currency } = property.pricing;
  const total = nights >= minNights ? nights * pricePerNight + cleaningFee : 0;
  const canSubmit = Boolean(
    range?.from && range?.to && nights >= minNights && nome && email && privacyAck,
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!range?.from || !range?.to) return;

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

      setStatus("sent");
    } catch {
      setErrorCode("server_error");
      setStatus("error");
    }
  }

  // Conferma mostrata al posto del modulo. `role="status"` perché chi usa
  // uno screen reader non vedrebbe altrimenti che la pagina è cambiata.
  if (status === "sent") {
    return (
      <div role="status" className="rounded-md border border-divider p-6">
        <p className="font-display text-xl">{dict.bookingConfirmation.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-mid">
          {dict.bookingConfirmation.subtitle}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 md:flex-row">
      <div className="flex-1">
        <BookingCalendar value={range} onChange={setRange} />
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <label className={labelClasses} htmlFor="booking-guests">
          {dict.booking.guestsLabel}
          <input
            id="booking-guests"
            required
            type="number"
            min={1}
            max={property.facts.maxGuests}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses} htmlFor="booking-name">
          {dict.booking.nameLabel}
          <input
            id="booking-name"
            required
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses} htmlFor="booking-email">
          {dict.booking.emailLabel}
          <input
            id="booking-email"
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses} htmlFor="booking-phone">
          {dict.booking.phoneLabel}{" "}
          <span className="font-normal">({dict.booking.optionalLabel})</span>
          <input
            id="booking-phone"
            type="tel"
            autoComplete="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses} htmlFor="booking-message">
          {dict.booking.messageLabel}{" "}
          <span className="font-normal">({dict.booking.optionalLabel})</span>
          <textarea
            id="booking-message"
            rows={3}
            value={messaggio}
            onChange={(e) => setMessaggio(e.target.value)}
            className={inputClasses}
          />
        </label>

        {nights > 0 && (
          <div className="rounded-md border border-divider p-4 text-sm">
            <div className="flex justify-between">
              <span>{dict.booking.nightsLabel}</span>
              <span>{nights}</span>
            </div>
            <div className="flex justify-between text-mid">
              <span>{dict.booking.pricePerNightLabel}</span>
              <span>{formatPrice(pricePerNight, currency, locale)}</span>
            </div>
            {cleaningFee > 0 && (
              <div className="flex justify-between text-mid">
                <span>{dict.booking.cleaningFeeLabel}</span>
                <span>{formatPrice(cleaningFee, currency, locale)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-divider pt-2 font-medium">
              <span>{dict.booking.totalLabel}</span>
              <span>{formatPrice(total, currency, locale)}</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-mid">{dict.booking.quoteNote}</p>
          </div>
        )}

        <PrivacyAck id="booking-privacy" checked={privacyAck} onChange={setPrivacyAck} />

        <button
          type="submit"
          disabled={!canSubmit || status === "sending"}
          className="inline-flex items-center justify-center rounded-md bg-bordeaux px-6 py-3 text-sm font-medium text-off-white transition-all duration-200 hover:bg-bordeaux-dark active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux focus-visible:ring-offset-2"
        >
          {status === "sending" ? dict.booking.sendingLabel : dict.booking.submitButton}
        </button>

        {status === "error" && errorCode && (
          <p role="alert" className="text-sm text-bordeaux">
            {dict.booking.errors[errorCode]}
          </p>
        )}
      </form>
    </div>
  );
}

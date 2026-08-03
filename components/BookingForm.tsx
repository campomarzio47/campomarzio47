"use client";

import { useState, type FormEvent } from "react";
import type { DateRange } from "react-day-picker";
import BookingCalendar, { nightsInRange } from "@/components/BookingCalendar";
import { useLocale } from "@/components/LocaleProvider";
import { property } from "@/content/property";
import type { Dictionary } from "@/content/dictionaries";

type Status = "idle" | "sending" | "error";
type ErrorCode = keyof Dictionary["booking"]["errors"];

const inputClasses =
  "w-full rounded-md border border-divider bg-off-white px-3 py-2 text-sm outline-none focus:border-bordeaux";
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

export default function BookingForm() {
  const { dict, locale } = useLocale();
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);

  const nights = nightsInRange(range);
  const minNights = property.pricing.minNights || 1;
  const { pricePerNight, cleaningFee, currency } = property.pricing;
  const total = nights >= minNights ? nights * pricePerNight + cleaningFee : 0;
  const canSubmit = Boolean(
    range?.from && range?.to && nights >= minNights && nome && email,
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
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorCode((data.code as ErrorCode) || "server_error");
        setStatus("error");
        return;
      }

      window.location.href = data.url;
    } catch {
      setErrorCode("server_error");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-10 md:flex-row">
      <div className="flex-1">
        <BookingCalendar value={range} onChange={setRange} />
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <label className={labelClasses}>
          {dict.booking.guestsLabel}
          <input
            required
            type="number"
            min={1}
            max={property.facts.maxGuests}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className={inputClasses}
          />
        </label>

        <input
          required
          placeholder={dict.booking.nameLabel}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={inputClasses}
        />
        <input
          required
          type="email"
          placeholder={dict.booking.emailLabel}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClasses}
        />
        <input
          placeholder={dict.booking.phoneLabel}
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className={inputClasses}
        />

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
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || status === "sending"}
          className="inline-flex items-center justify-center rounded-md bg-bordeaux px-6 py-3 text-sm font-medium text-off-white transition-colors hover:bg-bordeaux-dark disabled:opacity-60"
        >
          {status === "sending" ? dict.booking.sendingLabel : dict.booking.continueButton}
        </button>

        {status === "error" && errorCode && (
          <p className="text-sm text-bordeaux">{dict.booking.errors[errorCode]}</p>
        )}
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import { property } from "@/content/property";
import { useLocale } from "@/components/LocaleProvider";

type Status = "idle" | "sending" | "sent" | "error";
type BusyRange = { start: string; end: string };

const inputClasses =
  "w-full rounded-md border border-divider bg-off-white px-3 py-2 text-sm outline-none focus:border-bordeaux";
const labelClasses = "flex flex-col gap-1 text-xs text-mid";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function overlaps(checkin: string, checkout: string, busy: BusyRange[]) {
  if (!checkin || !checkout) return false;
  const start = new Date(checkin).getTime();
  const end = new Date(checkout).getTime();
  return busy.some((range) => {
    const busyStart = new Date(range.start).getTime();
    const busyEnd = new Date(range.end).getTime();
    return start < busyEnd && end > busyStart;
  });
}

export default function BookingRequestForm() {
  const { dict } = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const [busy, setBusy] = useState<BusyRange[]>([]);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefono: "",
    checkin: "",
    checkout: "",
    ospiti: 1,
    messaggio: "",
  });

  useEffect(() => {
    fetch("/api/availability")
      .then((res) => res.json())
      .then((data) => setBusy(data.busy ?? []))
      .catch(() => setBusy([]));
  }, []);

  const showOverlapWarning = overlaps(form.checkin, form.checkout, busy);

  const mailtoHref = `mailto:${property.host.email}?subject=${encodeURIComponent(
    "Richiesta di prenotazione — " + property.name,
  )}&body=${encodeURIComponent(
    `Nome: ${form.nome}\nCheck-in: ${form.checkin}\nCheck-out: ${form.checkout}\nOspiti: ${form.ospiti}\n\n${form.messaggio}`,
  )}`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/prenotazione", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-md border border-divider p-6">
        <p className="font-display text-xl">{dict.bookingRequest.sentTitle}</p>
        <p className="mt-2 text-sm text-mid">{dict.bookingRequest.sentBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          required
          placeholder={dict.bookingRequest.nameLabel}
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          className={inputClasses}
        />
        <input
          required
          type="email"
          placeholder={dict.bookingRequest.emailLabel}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputClasses}
        />
      </div>

      <input
        placeholder={dict.bookingRequest.phoneLabel}
        value={form.telefono}
        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        className={inputClasses}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={labelClasses}>
          {dict.bookingRequest.checkinLabel}
          <input
            required
            type="date"
            min={todayIso()}
            value={form.checkin}
            onChange={(e) => setForm({ ...form, checkin: e.target.value })}
            className={inputClasses}
          />
        </label>
        <label className={labelClasses}>
          {dict.bookingRequest.checkoutLabel}
          <input
            required
            type="date"
            min={form.checkin || todayIso()}
            value={form.checkout}
            onChange={(e) => setForm({ ...form, checkout: e.target.value })}
            className={inputClasses}
          />
        </label>
        <label className={labelClasses}>
          {dict.bookingRequest.guestsLabel}
          <input
            required
            type="number"
            min={1}
            max={property.facts.maxGuests}
            value={form.ospiti}
            onChange={(e) => setForm({ ...form, ospiti: Number(e.target.value) })}
            className={inputClasses}
          />
        </label>
      </div>

      {showOverlapWarning && (
        <p className="text-sm text-bordeaux">{dict.bookingRequest.overlapWarning}</p>
      )}

      <textarea
        placeholder={dict.bookingRequest.messagePlaceholder}
        rows={3}
        value={form.messaggio}
        onChange={(e) => setForm({ ...form, messaggio: e.target.value })}
        className={inputClasses}
      />

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center justify-center self-start rounded-md bg-bordeaux px-6 py-3 text-sm font-medium text-off-white transition-colors hover:bg-bordeaux-dark disabled:opacity-60"
      >
        {status === "sending" ? dict.bookingRequest.sending : dict.bookingRequest.submit}
      </button>

      {status === "error" && (
        <p className="text-sm text-bordeaux">
          {dict.bookingRequest.errorPrefix}{" "}
          <a href={mailtoHref} className="underline underline-offset-4">
            {dict.bookingRequest.errorFallbackLink}
          </a>
          .
        </p>
      )}
    </form>
  );
}

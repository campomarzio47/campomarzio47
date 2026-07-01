"use client";

import { useEffect, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { addDays } from "date-fns";
import { it as itLocale, enUS } from "date-fns/locale";
import BookingButtons from "@/components/BookingButtons";
import { useLocale } from "@/components/LocaleProvider";

type BusyRange = { start: string; end: string };
type ApiResponse = { configured: boolean; busy: BusyRange[]; error?: string };

export default function AvailabilityCalendar() {
  const { dict, locale } = useLocale();
  const [state, setState] = useState<"loading" | "ready" | "unconfigured" | "error">(
    "loading",
  );
  const [busy, setBusy] = useState<DateRange[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/availability")
      .then((res) => res.json() as Promise<ApiResponse>)
      .then((data) => {
        if (cancelled) return;
        if (!data.configured) {
          setState("unconfigured");
          return;
        }
        setBusy(
          data.busy.map((range) => ({
            from: new Date(range.start),
            // il giorno di checkout non è una notte occupata
            to: addDays(new Date(range.end), -1),
          })),
        );
        setState(data.error ? "error" : "ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return <p className="text-sm text-mid">{dict.availability.loading}</p>;
  }

  if (state === "unconfigured" || state === "error") {
    return (
      <div className="rounded-md border border-divider p-6">
        <p className="text-sm text-mid">
          {state === "error" ? dict.availability.error : dict.availability.unconfigured}{" "}
          {dict.availability.checkPlatforms}
        </p>
        <BookingButtons className="mt-4" />
      </div>
    );
  }

  return (
    <div>
      <DayPicker
        locale={locale === "it" ? itLocale : enUS}
        numberOfMonths={2}
        disabled={busy}
        modifiers={{ busy }}
        modifiersClassNames={{ busy: "rdp-busy" }}
        startMonth={new Date()}
        className="!bg-transparent"
      />
      <div className="mt-4 flex items-center gap-2 text-xs text-mid">
        <span className="inline-block h-3 w-3 rounded-sm bg-divider" />
        {dict.availability.legendUnavailable}
      </div>
      <BookingButtons className="mt-6" />
    </div>
  );
}

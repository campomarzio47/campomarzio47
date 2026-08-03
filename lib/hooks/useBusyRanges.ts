"use client";

import { useEffect, useState } from "react";
import { addDays } from "date-fns";
import type { DateRange } from "react-day-picker";

type BusyRange = { start: string; end: string };
type ApiResponse = { configured: boolean; busy: BusyRange[]; error?: string };
export type BusyRangesState = "loading" | "ready" | "unconfigured" | "error";

// Recupera e trasforma le date occupate da /api/availability (feed iCal di
// Airbnb/Booking) nel formato DateRange[] atteso da react-day-picker.
// Condiviso da AvailabilityBar e BookingCalendar (selezione intervallo per
// la prenotazione diretta).
export function useBusyRanges(): { state: BusyRangesState; busy: DateRange[] } {
  const [state, setState] = useState<BusyRangesState>("loading");
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

  return { state, busy };
}

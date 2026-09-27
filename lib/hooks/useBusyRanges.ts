"use client";

import { useEffect, useState } from "react";
import { addDays, max, parseISO, startOfToday } from "date-fns";
import type { DateRange, Matcher } from "react-day-picker";
import { earliestCheckinIso } from "@/lib/pricing";

type BusyRange = { start: string; end: string };
type ApiResponse = { configured: boolean; busy: BusyRange[]; error?: string };
export type BusyRangesState = "loading" | "ready" | "unconfigured" | "error";

// Primo giorno selezionabile come arrivo: lo stesso limite che
// /api/booking/create applica lato server (earliestCheckinIso, data UTC), ma
// mai prima di oggi nel fuso dell'ospite — con minAdvanceDays a 0, fra
// mezzanotte e le 2 italiane la data UTC è ancora quella di ieri.
function firstBookableDay(): Date {
  return max([startOfToday(), parseISO(earliestCheckinIso())]);
}

// Recupera e trasforma le date occupate da /api/availability (feed iCal di
// Airbnb/Booking) nel formato DateRange[] atteso da react-day-picker.
// Condiviso da AvailabilityBar e BookingCalendar (selezione intervallo per
// la prenotazione diretta).
//
// `busy` va usato come modifier (stile `.rdp-busy`, "prenotato altrove");
// `disabled` è tutto ciò che non si può selezionare: `busy` più i giorni
// prima di `firstDay`. I giorni passati restano fuori da `busy` apposta: non
// sono prenotati, solo non disponibili, e prendono lo stile disabilitato
// standard di react-day-picker.
export function useBusyRanges(): {
  state: BusyRangesState;
  busy: DateRange[];
  disabled: Matcher[];
  firstDay: Date;
} {
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

  const firstDay = firstBookableDay();
  return { state, busy, disabled: [...busy, { before: firstDay }], firstDay };
}

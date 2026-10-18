"use client";

import { DayPicker, type DateRange, type ChevronProps } from "react-day-picker";
import { differenceInCalendarDays, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { plural, fill } from "@/content/dictionaries";
import { property } from "@/content/property";
import { dateFnsLocale } from "@/lib/date-locale";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import type { useBusyRanges } from "@/lib/hooks/useBusyRanges";

export function nightsInRange(range: DateRange | undefined): number {
  if (!range?.from || !range?.to) return 0;
  return differenceInCalendarDays(range.to, range.from);
}

export function isCompleteRange(range: DateRange | undefined): range is { from: Date; to: Date } {
  return nightsInRange(range) > 0;
}

function Chevron({ orientation }: ChevronProps) {
  const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
  return <Icon size={18} strokeWidth={1.75} aria-hidden="true" />;
}

/**
 * Calendario di scelta dell'intervallo, condiviso dalla barra delle date
 * in home e da /prenota. Un mese su telefono, due affiancati da 768 px in
 * su (prima erano due anche su telefono, impilati: si scorreva per
 * trovare il secondo).
 *
 * Il foglio di stile di react-day-picker non viene importato di proposito:
 * vedi la sezione "Calendario" in globals.css.
 *
 * Dopo un intervallo completo, il tocco successivo ricomincia da capo
 * dall'arrivo (come su Airbnb): il comportamento predefinito della
 * libreria spostava invece l'estremo più vicino, e chi voleva solo
 * cambiare date si ritrovava intervalli strani.
 */
export default function DateRangeCalendar({
  value,
  onChange,
  availability,
  months,
}: {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  availability: ReturnType<typeof useBusyRanges>;
  months?: 1 | 2;
}) {
  const { dict, locale } = useLocale();
  const wide = useMediaQuery("(min-width: 768px)");
  const { busy, disabled, firstDay } = availability;

  function handleSelect(next: DateRange | undefined, day: Date) {
    if (isCompleteRange(value)) {
      onChange({ from: day, to: undefined });
      return;
    }
    onChange(next);
  }

  return (
    <DayPicker
      mode="range"
      locale={dateFnsLocale[locale]}
      numberOfMonths={months ?? (wide ? 2 : 1)}
      disabled={disabled}
      excludeDisabled
      modifiers={{ busy }}
      modifiersClassNames={{ busy: "rdp-busy" }}
      startMonth={firstDay}
      defaultMonth={value?.from ?? firstDay}
      selected={value}
      onSelect={handleSelect}
      animate
      components={{ Chevron }}
      labels={{
        labelPrevious: () => dict.a11y.previousMonth,
        labelNext: () => dict.a11y.nextMonth,
      }}
    />
  );
}

/**
 * La riga sotto il calendario: dice cosa fare adesso (scegliere l'arrivo,
 * poi la partenza) e, a intervallo completo, quante notti sono. È un
 * aria-live: chi usa uno screen reader sente lo stesso suggerimento.
 */
export function RangeHint({ value }: { value: DateRange | undefined }) {
  const { dict, locale } = useLocale();
  const minNights = property.pricing.minNights || 1;
  const nights = nightsInRange(value);
  const fmt = (d: Date) => format(d, "EEE d MMM", { locale: dateFnsLocale[locale] });

  let text: string;
  let warn = false;
  if (!value?.from) text = dict.availabilityBar.pickArrival;
  else if (!value.to || nights === 0) text = dict.availabilityBar.pickDeparture;
  else if (nights < minNights) {
    text = fill(dict.booking.minNightsWarning, { min: minNights });
    warn = true;
  } else {
    text = `${fmt(value.from)} → ${fmt(value.to)} · ${plural(dict.availabilityBar.nights, nights)}`;
  }

  return (
    <p
      aria-live="polite"
      className={`text-sm font-medium first-letter:uppercase ${warn ? "text-bordeaux" : "text-charcoal"}`}
    >
      {text}
    </p>
  );
}

/** Legenda: date occupate (barrate) e date scelte. */
export function CalendarLegend() {
  const { dict } = useLocale();
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-mid">
      <span className="flex items-center gap-2">
        <span className="tabular text-sm text-mid line-through">14</span>
        {dict.availability.legendUnavailable}
      </span>
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className="flex items-center">
          <span className="h-3.5 w-3.5 rounded-full bg-bordeaux" />
          <span className="h-2 w-4 bg-sand" />
          <span className="h-3.5 w-3.5 rounded-full bg-bordeaux" />
        </span>
        {dict.availability.legendSelected}
      </span>
    </div>
  );
}

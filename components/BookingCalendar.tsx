"use client";

import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { it as itLocale, enUS } from "date-fns/locale";
import { differenceInCalendarDays } from "date-fns";
import { useLocale } from "@/components/LocaleProvider";
import { useBusyRanges } from "@/lib/hooks/useBusyRanges";
import { property } from "@/content/property";

export function nightsInRange(range: DateRange | undefined): number {
  if (!range?.from || !range?.to) return 0;
  return differenceInCalendarDays(range.to, range.from);
}

export default function BookingCalendar({
  value,
  onChange,
}: {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}) {
  const { dict, locale } = useLocale();
  const { state, busy } = useBusyRanges();
  const minNights = property.pricing.minNights || 1;
  const nights = nightsInRange(value);
  const tooShort = Boolean(value?.from && value?.to && nights < minNights);

  if (state === "loading") {
    return <p className="text-sm text-mid">{dict.availability.loading}</p>;
  }

  if (state === "unconfigured" || state === "error") {
    return (
      <p className="text-sm text-mid">
        {state === "error" ? dict.availability.error : dict.availability.unconfigured}
      </p>
    );
  }

  return (
    <div>
      <DayPicker
        mode="range"
        locale={locale === "it" ? itLocale : enUS}
        numberOfMonths={2}
        disabled={busy}
        excludeDisabled
        modifiers={{ busy }}
        modifiersClassNames={{ busy: "rdp-busy" }}
        startMonth={new Date()}
        selected={value}
        onSelect={onChange}
        className="!bg-transparent"
      />
      <div className="mt-4 flex items-center gap-2 text-xs text-mid">
        <span className="inline-block h-3 w-3 rounded-sm bg-divider" />
        {dict.availability.legendUnavailable}
      </div>
      {tooShort && (
        <p className="mt-3 text-sm text-bordeaux">
          {dict.booking.minNightsWarning.replace("{min}", String(minNights))}
        </p>
      )}
    </div>
  );
}

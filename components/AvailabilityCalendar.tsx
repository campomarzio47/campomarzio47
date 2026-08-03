"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { it as itLocale, enUS } from "date-fns/locale";
import BookingButtons from "@/components/BookingButtons";
import { useLocale } from "@/components/LocaleProvider";
import { useBusyRanges } from "@/lib/hooks/useBusyRanges";

export default function AvailabilityCalendar() {
  const { dict, locale } = useLocale();
  const { state, busy } = useBusyRanges();

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

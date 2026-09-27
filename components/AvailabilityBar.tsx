"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { it as itLocale, enUS } from "date-fns/locale";
import { format } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { useBusyRanges } from "@/lib/hooks/useBusyRanges";

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AvailabilityBar() {
  const { dict, locale } = useLocale();
  const router = useRouter();
  const { busy, disabled, firstDay } = useBusyRanges();
  const [range, setRange] = useState<DateRange | undefined>();
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!desktopOpen) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setDesktopOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [desktopOpen]);

  function handleSelect(next: DateRange | undefined) {
    setRange(next);
    // Al primo click react-day-picker imposta from === to: non è ancora un
    // intervallo completo, va chiuso solo quando le due date differiscono.
    const isCompleteRange = next?.from && next?.to && next.to.getTime() !== next.from.getTime();
    if (isCompleteRange) setDesktopOpen(false);
  }

  function goToBooking() {
    const params = new URLSearchParams();
    if (range?.from) params.set("from", toIso(range.from));
    if (range?.to) params.set("to", toIso(range.to));
    const qs = params.toString();
    router.push(qs ? `/prenota?${qs}` : "/prenota");
  }

  const dateLocale = locale === "it" ? itLocale : enUS;
  const fmt = (d?: Date) => (d ? format(d, "d MMM", { locale: dateLocale }) : dict.availabilityBar.selectDate);

  const calendar = (
    <DayPicker
      mode="range"
      locale={dateLocale}
      numberOfMonths={1}
      disabled={disabled}
      excludeDisabled
      modifiers={{ busy }}
      modifiersClassNames={{ busy: "rdp-busy" }}
      startMonth={firstDay}
      selected={range}
      onSelect={handleSelect}
      className="!bg-transparent"
    />
  );

  return (
    <>
      {/* Desktop: barra fissa affiancata alla sidebar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 hidden justify-center px-6 md:left-64 md:flex">
        <div ref={wrapRef} className="pointer-events-auto relative">
          {desktopOpen && (
            <div className="animate-pop-in absolute bottom-full left-0 mb-3 rounded-lg border border-divider bg-off-white p-3 shadow-xl">
              {calendar}
            </div>
          )}
          <div className="flex items-stretch gap-1 rounded-full border border-divider bg-off-white/95 p-1.5 shadow-xl backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setDesktopOpen((v) => !v)}
              className="flex flex-col items-start rounded-full px-5 py-2 text-left transition-colors hover:bg-divider/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux"
            >
              <span className="text-[11px] uppercase tracking-wide text-mid">
                {dict.availabilityBar.arrivalLabel}
              </span>
              <span className="text-sm font-medium">{fmt(range?.from)}</span>
            </button>
            <div className="my-2 w-px bg-divider" />
            <button
              type="button"
              onClick={() => setDesktopOpen((v) => !v)}
              className="flex flex-col items-start rounded-full px-5 py-2 text-left transition-colors hover:bg-divider/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux"
            >
              <span className="text-[11px] uppercase tracking-wide text-mid">
                {dict.availabilityBar.departureLabel}
              </span>
              <span className="text-sm font-medium">{fmt(range?.to)}</span>
            </button>
            <button
              type="button"
              onClick={goToBooking}
              className="ml-1 rounded-full bg-bordeaux px-8 text-sm font-semibold text-off-white transition-all duration-200 hover:bg-bordeaux-dark active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux focus-visible:ring-offset-2"
            >
              {dict.availabilityBar.cta}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: bottone full-width fisso in basso */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-off-white p-3 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.15)] md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-bordeaux py-3 text-sm font-semibold text-off-white shadow-md transition-all duration-200 hover:bg-bordeaux-dark active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux focus-visible:ring-offset-2"
        >
          <CalendarDays size={17} strokeWidth={2} />
          {dict.availabilityBar.cta}
        </button>
      </div>

      {/* Mobile: pannello date */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="animate-fade-in absolute inset-0 bg-charcoal/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="animate-sheet-in absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-off-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg">{dict.availabilityBar.cta}</span>
              <button
                type="button"
                aria-label={dict.photos.close}
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 text-charcoal transition-colors hover:bg-divider/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4 flex gap-3 text-sm">
              <div className="flex-1 rounded-md border border-divider px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-mid">
                  {dict.availabilityBar.arrivalLabel}
                </div>
                <div className="font-medium">{fmt(range?.from)}</div>
              </div>
              <div className="flex-1 rounded-md border border-divider px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-mid">
                  {dict.availabilityBar.departureLabel}
                </div>
                <div className="font-medium">{fmt(range?.to)}</div>
              </div>
            </div>
            <div className="flex justify-center">{calendar}</div>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                goToBooking();
              }}
              className="mt-4 w-full rounded-md bg-bordeaux py-3 text-sm font-semibold text-off-white transition-all duration-200 hover:bg-bordeaux-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux focus-visible:ring-offset-2"
            >
              {dict.availabilityBar.cta}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

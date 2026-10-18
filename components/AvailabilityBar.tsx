"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ArrowRight, X } from "lucide-react";
import DateRangeCalendar, {
  CalendarLegend,
  RangeHint,
  isCompleteRange,
  nightsInRange,
} from "@/components/DateRangeCalendar";
import { useLocale } from "@/components/LocaleProvider";
import { fill, plural } from "@/content/dictionaries";
import { property } from "@/content/property";
import { dateFnsLocale } from "@/lib/date-locale";
import { intlLocale } from "@/lib/locale";
import { useBusyRanges } from "@/lib/hooks/useBusyRanges";
import { useDialog } from "@/lib/hooks/useDialog";
import { usePresence, useHydrated } from "@/lib/hooks/usePresence";

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Barra delle date, solo in home.
 *
 * - Telefono: una barra fissa in fondo con il prezzo a notte e il bottone;
 *   il bottone apre un pannello dal basso con il calendario.
 * - Desktop: una "pillola" fluttuante Arrivo | Partenza | Verifica, con il
 *   calendario a due mesi che si apre sopra.
 *
 * In entrambi i casi porta a /prenota?from=...&to=..., dove il modulo
 * ritrova le date già scelte. Montata con un portale: la pagina entra con
 * un'animazione che usa `transform`, e un elemento `fixed` dentro un
 * antenato trasformato non resterebbe agganciato allo schermo.
 */
export default function AvailabilityBar() {
  const { dict, locale } = useLocale();
  const router = useRouter();
  const hydrated = useHydrated();
  const availability = useBusyRanges();
  const [range, setRange] = useState<DateRange | undefined>();
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const sheet = usePresence(sheetOpen, 300);

  useDialog(sheetOpen, closeSheet, sheetRef);

  useEffect(() => {
    if (!desktopOpen) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setDesktopOpen(false);
    }
    // Il calendario si chiudeva solo cliccando fuori: da tastiera non
    // c'era modo di uscirne senza selezionare due date.
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDesktopOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [desktopOpen]);

  function handleDesktopSelect(next: DateRange | undefined) {
    setRange(next);
    if (isCompleteRange(next)) window.setTimeout(() => setDesktopOpen(false), 450);
  }

  function goToBooking() {
    const params = new URLSearchParams();
    if (range?.from && isCompleteRange(range)) {
      params.set("from", toIso(range.from));
      params.set("to", toIso(range.to));
    }
    const qs = params.toString();
    router.push(qs ? `/prenota?${qs}` : "/prenota");
  }

  const dateLocale = dateFnsLocale[locale];
  const short = (d?: Date) => (d ? format(d, "d MMM", { locale: dateLocale }) : undefined);
  const nights = nightsInRange(range);
  const price = new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: property.pricing.currency,
    maximumFractionDigits: 0,
  }).format(property.pricing.pricePerNight);
  const { minNights } = property.pricing;

  if (!hydrated) return null;

  return createPortal(
    <>
      {/* Desktop: pillola fluttuante */}
      <div className="animate-dock-in pointer-events-none fixed inset-x-0 bottom-7 z-30 hidden justify-center px-6 md:flex">
        <div ref={wrapRef} className="pointer-events-auto relative">
          {desktopOpen && (
            <div
              role="dialog"
              aria-label={dict.a11y.datesDialog}
              className="animate-pop-in absolute bottom-full left-1/2 mb-4 w-[min(46rem,calc(100vw-3rem))] -translate-x-1/2 rounded-[1.25rem] border border-divider bg-paper p-7 shadow-[0_30px_80px_-30px_rgba(28,26,25,0.35)]"
            >
              <DateRangeCalendar
                value={range}
                onChange={handleDesktopSelect}
                availability={availability}
                months={2}
              />
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-divider pt-5">
                <RangeHint value={range} />
                <CalendarLegend />
              </div>
            </div>
          )}
          <div className="flex items-stretch gap-1 rounded-full border border-divider bg-paper/95 p-1.5 shadow-[0_20px_50px_-20px_rgba(28,26,25,0.35)] backdrop-blur-md">
            {(["from", "to"] as const).map((end) => (
              <button
                key={end}
                type="button"
                // aria-label esplicita: letto da solo, il bottone
                // annuncerebbe "Arrivo, 12 mag", senza dire che serve ad
                // aprire un calendario.
                aria-label={end === "from" ? dict.a11y.selectArrival : dict.a11y.selectDeparture}
                aria-expanded={desktopOpen}
                aria-haspopup="dialog"
                onClick={() => setDesktopOpen((v) => !v)}
                className="flex min-w-36 flex-col items-start rounded-full px-6 py-2 text-left transition-colors duration-300 hover:bg-sand/60 focus-visible:outline-2 focus-visible:outline-bordeaux"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mid">
                  {end === "from" ? dict.availabilityBar.arrivalLabel : dict.availabilityBar.departureLabel}
                </span>
                <span className={`text-[0.9375rem] font-medium ${range?.[end] && (end === "from" || nights > 0) ? "" : "text-mid"}`}>
                  {(end === "to" && nights === 0 ? undefined : short(range?.[end])) ??
                    dict.availabilityBar.selectDate}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={goToBooking}
              className="btn btn-primary ml-1 px-7"
            >
              {dict.availabilityBar.cta}
              <ArrowRight size={17} strokeWidth={2} aria-hidden="true" className="arrow" />
            </button>
          </div>
        </div>
      </div>

      {/* Telefono: barra fissa in fondo */}
      <div className="animate-dock-in fixed inset-x-0 bottom-0 z-30 border-t border-divider bg-paper/95 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            {isCompleteRange(range) ? (
              <>
                <p className="truncate font-display text-lg leading-tight">
                  {short(range.from)} – {short(range.to)}
                </p>
                <p className="text-xs text-mid">{plural(dict.availabilityBar.nights, nights)}</p>
              </>
            ) : (
              <>
                <p className="font-display text-lg leading-tight">
                  <span className="tabular">{price}</span>{" "}
                  <span className="font-sans text-sm text-mid">{dict.availabilityBar.perNight}</span>
                </p>
                {minNights > 1 && (
                  <p className="text-xs text-mid">{fill(dict.availabilityBar.minStay, { n: minNights })}</p>
                )}
              </>
            )}
          </div>
          <button
            type="button"
            aria-expanded={sheetOpen}
            aria-haspopup="dialog"
            onClick={() => (isCompleteRange(range) ? goToBooking() : setSheetOpen(true))}
            className="btn btn-primary flex-none px-5"
          >
            {dict.availabilityBar.cta}
          </button>
        </div>
      </div>

      {/* Telefono: pannello date dal basso */}
      {sheet.mounted && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            aria-hidden="true"
            className={`absolute inset-0 bg-charcoal/45 ${sheet.closing ? "animate-fade-out" : "animate-fade-in"}`}
            onClick={closeSheet}
          />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={dict.a11y.datesDialog}
            className={`absolute inset-x-0 bottom-0 flex max-h-[92svh] flex-col rounded-t-[1.5rem] bg-paper shadow-2xl ${
              sheet.closing ? "animate-sheet-out" : "animate-sheet-in"
            }`}
          >
            <div className="flex-none px-5 pt-3">
              <div aria-hidden="true" className="mx-auto h-1 w-10 rounded-full bg-divider" />
              <div className="mt-3 flex items-center justify-between">
                <p className="font-display text-2xl">{dict.availabilityBar.cta}</p>
                <button
                  type="button"
                  aria-label={dict.photos.close}
                  onClick={closeSheet}
                  className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-sand focus-visible:outline-2 focus-visible:outline-bordeaux"
                >
                  <X size={20} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(["from", "to"] as const).map((end) => {
                  const picking =
                    end === "from" ? !range?.from : Boolean(range?.from) && nights === 0;
                  const value = end === "to" && nights === 0 ? undefined : short(range?.[end]);
                  return (
                    <div
                      key={end}
                      className={`rounded-xl border px-4 py-2.5 transition-colors duration-300 ${
                        picking ? "border-charcoal bg-off-white" : "border-divider"
                      }`}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mid">
                        {end === "from" ? dict.availabilityBar.arrivalLabel : dict.availabilityBar.departureLabel}
                      </p>
                      <p className={`mt-0.5 font-medium ${value ? "" : "text-mid"}`}>
                        {value ?? dict.availabilityBar.selectDate}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <DateRangeCalendar value={range} onChange={setRange} availability={availability} months={1} />
              <div className="mt-4">
                <CalendarLegend />
              </div>
            </div>

            <div className="flex flex-none items-center justify-between gap-4 border-t border-divider px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
              <div className="min-w-0">
                <RangeHint value={range} />
                {range?.from && (
                  <button
                    type="button"
                    onClick={() => setRange(undefined)}
                    className="mt-0.5 min-h-8 text-sm text-mid underline underline-offset-4"
                  >
                    {dict.availabilityBar.clear}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  closeSheet();
                  goToBooking();
                }}
                className="btn btn-primary flex-none"
              >
                {dict.booking.title}
                <ArrowRight size={17} strokeWidth={2} aria-hidden="true" className="arrow" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}

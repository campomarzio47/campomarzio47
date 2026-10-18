"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { plural } from "@/content/dictionaries";
import { intlLocale } from "@/lib/locale";

const MIN_YEAR = 1900;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseIso(iso: string) {
  const [y, m, d] = iso.split("-");
  return { day: d ? String(Number(d)) : "", month: m ? String(Number(m)) : "", year: y ?? "" };
}

/** Data valida e non futura, oppure null. */
function toIso(day: string, month: string, year: string): string | null {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!/^\d{4}$/.test(year) || !d || !m) return null;
  const date = new Date(y, m - 1, d);
  // new Date(2001, 1, 31) diventa il 3 marzo: se giorno o mese cambiano,
  // la data non esiste.
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  if (y < MIN_YEAR || date > new Date()) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

function ageOn(iso: string, today = new Date()): number {
  const [y, m, d] = iso.split("-").map(Number);
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1;
  return age;
}

/**
 * Data di nascita in tre campi: giorno, mese, anno.
 *
 * Il calendario nativo del telefono parte dall'anno in corso: per un
 * ospite nato nel 1950 voleva dire scorrere settant'anni. Qui giorno e
 * anno si scrivono col tastierino numerico e il mese si sceglie per nome,
 * così non si può confondere l'ordine giorno/mese come nei formati
 * stranieri. Le date impossibili (31 febbraio, anni futuri o prima del
 * 1900) bloccano il passo con un messaggio, e la data valida viene
 * riscritta per esteso con l'età accanto: un 1958 battuto 1985 salta
 * all'occhio prima di arrivare in Questura.
 *
 * Verso l'esterno esiste solo la data ISO completa ("1985-04-12") o la
 * stringa vuota: il resto del check-in non vede mai date a metà.
 */
export default function BirthDateField({
  id,
  value,
  onChange,
  autoComplete = false,
}: {
  id: string;
  value: string;
  onChange: (iso: string) => void;
  autoComplete?: boolean;
}) {
  const { dict, locale } = useLocale();
  const t = dict.checkin;
  const initial = parseIso(value);
  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);
  const yearRef = useRef<HTMLInputElement>(null);

  const months = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(intlLocale[locale], { month: "long" });
    return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2000, i, 1)));
  }, [locale]);

  const complete = day !== "" && month !== "" && year.length === 4;
  const iso = complete ? toIso(day, month, year) : null;
  // L'errore compare appena la data è completa: l'anno è l'ultimo campo
  // e quattro cifre bastano a dire che si è finito di scrivere.
  const showError = complete && !iso;

  function update(next: { day?: string; month?: string; year?: string }) {
    const d = next.day ?? day;
    const m = next.month ?? month;
    const y = next.year ?? year;
    setDay(d);
    setMonth(m);
    setYear(y);
    const result = d && m && y.length === 4 ? toIso(d, m, y) : null;
    onChange(result ?? "");
    // Il messaggio del browser al tentativo di andare avanti: senza, una
    // data impossibile con tutti e tre i campi pieni passerebbe il
    // controllo "obbligatorio".
    yearRef.current?.setCustomValidity(
      d && m && y.length === 4 && !result ? t.birthDateInvalid : "",
    );
  }

  const digits = (s: string, max: number) => s.replace(/\D/g, "").slice(0, max);
  const errorId = `${id}-errore`;
  const confirmId = `${id}-conferma`;
  const described = showError ? errorId : iso ? confirmId : undefined;

  return (
    <fieldset className="flex flex-col gap-2 sm:col-span-2">
      <legend className="mb-2 text-[0.8125rem] font-medium">{t.birthDate}</legend>
      <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_6rem] gap-2">
        <label className="flex flex-col gap-1 text-xs text-mid" htmlFor={`${id}-giorno`}>
          {t.day}
          <input
            id={`${id}-giorno`}
            required
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            placeholder="12"
            autoComplete={autoComplete ? "bday-day" : "off"}
            value={day}
            onChange={(e) => update({ day: digits(e.target.value, 2) })}
            aria-invalid={showError}
            aria-describedby={described}
            className="field tabular text-center"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-mid" htmlFor={`${id}-mese`}>
          {t.month}
          <select
            id={`${id}-mese`}
            required
            autoComplete={autoComplete ? "bday-month" : "off"}
            value={month}
            onChange={(e) => update({ month: e.target.value })}
            aria-invalid={showError}
            aria-describedby={described}
            className={`field ${month ? "" : "text-mid"}`}
          >
            <option value="" disabled>
              {t.month}
            </option>
            {months.map((name, i) => (
              <option key={name} value={String(i + 1)}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-mid" htmlFor={`${id}-anno`}>
          {t.year}
          <input
            ref={yearRef}
            id={`${id}-anno`}
            required
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            minLength={4}
            placeholder="1985"
            autoComplete={autoComplete ? "bday-year" : "off"}
            value={year}
            onChange={(e) => update({ year: digits(e.target.value, 4) })}
            aria-invalid={showError}
            aria-describedby={described}
            className="field tabular text-center"
          />
        </label>
      </div>
      {showError ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-bordeaux">
          {t.birthDateInvalid}
        </p>
      ) : iso ? (
        <p id={confirmId} className="animate-fade-in text-xs text-mid">
          {new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "long" }).format(
            new Date(Number(year), Number(month) - 1, Number(day)),
          )}{" "}
          · {plural(t.ageYears, ageOn(iso))}
        </p>
      ) : null}
    </fieldset>
  );
}

"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { PlaceOption } from "@/lib/reference-data";
import type { Locale } from "@/lib/locale";
import { useLocale } from "@/components/LocaleProvider";

/** "STATI UNITI D'AMERICA" → "Stati Uniti D'America"; la sigla di provincia fra parentesi resta maiuscola. */
function titleCase(label: string): string {
  return label
    .toLowerCase()
    .replace(/(^|[\s'’\-/])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase())
    .replace(/\(([a-z]{2})\)$/i, (_, sigla: string) => `(${sigla.toUpperCase()})`);
}

/** Minuscolo e senza accenti: "osterreich" trova "Österreich". */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** Nome da mostrare: nella lingua di chi compila se lo conosciamo, altrimenti quello ufficiale. */
export function placeDisplayName(option: PlaceOption, locale: Locale): string {
  if (locale !== "it" && option.names) return option.names[locale];
  return titleCase(option.label);
}

/**
 * Campo con suggerimenti per comuni e stati.
 *
 * Implementa il pattern ARIA "combobox con listbox": il focus resta
 * sull'input e l'opzione evidenziata viene indicata con
 * `aria-activedescendant`. Prima le opzioni erano `<button>` dentro la
 * lista, raggiungibili solo col mouse: il `blur` dell'input chiudeva la
 * lista prima che il Tab potesse arrivarci, quindi chi naviga da tastiera
 * non riusciva a completare il check-in — che è la funzione principale del
 * sito. Da qui la riscrittura.
 *
 * Gli stati si cercano anche in inglese e tedesco (lib/country-names.ts):
 * la tabella ufficiale conosce solo "GERMANIA", e un ospite tedesco scrive
 * "Deutschland". Il valore salvato resta sempre il codice e il nome
 * ufficiali.
 */
export default function PlaceAutocomplete({
  id,
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  id?: string;
  value: PlaceOption | null;
  onChange: (option: PlaceOption | null) => void;
  options: PlaceOption[];
  placeholder?: string;
  required?: boolean;
}) {
  const { dict, locale } = useLocale();
  const display = (o: PlaceOption | null) => (o ? placeDisplayName(o, locale) : "");
  const [query, setQuery] = useState(display(value));
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const hintId = useId();

  // Allinea il testo alla scelta (anche quando cambia la lingua). Con
  // `value` vuoto il testo resta quello che l'utente sta scrivendo.
  const [synced, setSynced] = useState({ value, locale });
  if (synced.value !== value || synced.locale !== locale) {
    setSynced({ value, locale });
    if (value) setQuery(placeDisplayName(value, locale));
  }

  // Indice di ricerca calcolato una volta sola per elenco: i comuni sono
  // quasi ottomila.
  const index = useMemo(
    () =>
      options.map((o) => ({
        option: o,
        keys: [o.label, o.names?.en, o.names?.de].filter(Boolean).map((k) => normalize(k!)),
      })),
    [options],
  );

  const results = useMemo(() => {
    const q = normalize(query);
    if (q.length < 2 || (value && q === normalize(display(value)))) return [];
    const starts: PlaceOption[] = [];
    const contains: PlaceOption[] = [];
    for (const { option, keys } of index) {
      if (keys.some((k) => k.startsWith(q))) starts.push(option);
      else if (keys.some((k) => k.includes(q))) contains.push(option);
      if (starts.length >= 20) break;
    }
    return [...starts, ...contains].slice(0, 20);
    // display dipende solo da locale
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, index, value, locale]);

  // Tiene l'opzione evidenziata dentro la parte visibile della lista
  // quando la si percorre con le frecce.
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    listRef.current.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function selectOption(o: PlaceOption) {
    onChange({ code: o.code, label: o.label, names: o.names });
    setQuery(placeDisplayName(o, locale));
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!results.length) return;

    if (e.key === "ArrowDown") {
      // preventDefault: altrimenti la freccia sposta il cursore nel testo
      // invece di scorrere i suggerimenti.
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % results.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
      return;
    }

    if (e.key === "Enter" && open && activeIndex >= 0) {
      // Solo con un'opzione evidenziata: altrimenti Invio deve poter
      // inviare il modulo come su qualsiasi altro campo.
      e.preventDefault();
      selectOption(results[activeIndex]);
    }
  }

  function handleBlur() {
    // Dà il tempo al clic su un suggerimento di registrarsi prima di chiudere.
    setTimeout(() => {
      setOpen(false);
      setTouched(true);
      setActiveIndex(-1);

      if (!value) {
        const q = normalize(query);
        if (q.length >= 2) {
          // L'utente ha scritto il nome ma non ha scelto un suggerimento:
          // se il testo identifica in modo univoco un'opzione, la
          // selezioniamo comunque (es. "comacchio" -> "COMACCHIO (FE)").
          const exact = index.filter(({ keys }) => keys.some((k) => k === q || k.startsWith(`${q} (`)));
          const matches = exact.length ? exact : index.filter(({ keys }) => keys.some((k) => k.includes(q)));
          if (matches.length === 1) selectOption(matches[0].option);
        }
      }
    }, 150);
  }

  const invalid = touched && !value && query.trim().length > 0;
  const expanded = open && results.length > 0;

  return (
    <div className="relative">
      <input
        id={id}
        required={required && !value}
        placeholder={placeholder}
        value={query}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setTouched(false);
          // L'elenco cambia a ogni lettera: l'evidenziazione riparte da
          // capo, perché tenerla ferma su un indice che ora punta a
          // un'altra località sarebbe peggio che non averla.
          setActiveIndex(-1);
          if (value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={expanded && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        aria-invalid={invalid}
        aria-describedby={invalid ? hintId : undefined}
        className="field"
      />
      {invalid && (
        <p id={hintId} className="mt-1.5 text-xs font-medium text-bordeaux">
          {dict.checkin.selectFromListHint}
        </p>
      )}
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={dict.a11y.suggestions}
        hidden={!expanded}
        className="animate-pop-in absolute z-30 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-divider bg-paper py-1.5 shadow-[0_20px_40px_-20px_rgba(28,26,25,0.35)]"
      >
        {results.map((o, i) => {
          const name = placeDisplayName(o, locale);
          const official = titleCase(o.label);
          return (
            <li
              key={o.code}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              // onMouseDown + preventDefault: senza, il mousedown toglie il
              // focus all'input e il blur chiude la lista prima che il clic
              // arrivi a destinazione.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectOption(o)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 py-2 text-[0.9375rem] ${
                i === activeIndex ? "bg-sand" : ""
              }`}
            >
              <span>{name}</span>
              {name !== official && <span className="text-xs text-mid">{official}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

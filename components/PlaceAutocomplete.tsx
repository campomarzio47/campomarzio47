"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { PlaceOption } from "@/lib/reference-data";
import { useLocale } from "@/components/LocaleProvider";

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
 */
export default function PlaceAutocomplete({
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  value: PlaceOption | null;
  onChange: (option: PlaceOption | null) => void;
  options: PlaceOption[];
  placeholder?: string;
  required?: boolean;
}) {
  const { dict } = useLocale();
  const [query, setQuery] = useState(value?.label ?? "");
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const hintId = useId();

  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value?.code]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2 || q === value?.label.toLowerCase()) return [];
    return options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 20);
  }, [query, options, value]);

  // Tiene l'opzione evidenziata dentro la parte visibile della lista
  // quando la si percorre con le frecce.
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    listRef.current.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function selectOption(o: PlaceOption) {
    onChange(o);
    setQuery(o.label);
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
    // Da' il tempo al click su un suggerimento di registrarsi prima di chiudere.
    setTimeout(() => {
      setOpen(false);
      setTouched(true);
      setActiveIndex(-1);

      if (!value) {
        const q = query.trim().toLowerCase();
        if (q.length >= 2) {
          // L'utente ha scritto il nome ma non ha scelto un suggerimento:
          // se il testo identifica in modo univoco un'opzione, la
          // selezioniamo comunque (es. "marostica" -> "MAROSTICA (VI)").
          const matches = options.filter((o) => o.label.toLowerCase().includes(q));
          if (matches.length === 1) {
            selectOption(matches[0]);
          }
        }
      }
    }, 150);
  }

  const invalid = touched && !value && query.trim().length > 0;
  const expanded = open && results.length > 0;

  return (
    <div className="relative">
      <input
        required={required && !value}
        placeholder={placeholder}
        value={query}
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
        aria-activedescendant={
          expanded && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
        }
        aria-invalid={invalid}
        aria-describedby={invalid ? hintId : undefined}
        className={`w-full rounded-md border bg-off-white px-3 py-2 text-sm outline-none placeholder:text-mid ${
          invalid ? "border-bordeaux" : "border-divider focus:border-bordeaux"
        }`}
      />
      {invalid && (
        <p id={hintId} className="mt-1 text-xs text-bordeaux">
          {dict.checkin.selectFromListHint}
        </p>
      )}
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={dict.a11y.suggestions}
        hidden={!expanded}
        className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-divider bg-off-white shadow-lg"
      >
        {results.map((o, i) => (
          <li
            key={o.code}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === activeIndex}
            // onMouseDown + preventDefault: senza, il mousedown toglie il
            // focus all'input e il blur chiude la lista prima che il click
            // arrivi a destinazione.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => selectOption(o)}
            onMouseEnter={() => setActiveIndex(i)}
            className={`cursor-pointer px-3 py-2 text-left text-sm ${
              i === activeIndex ? "bg-divider/60" : ""
            }`}
          >
            {o.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

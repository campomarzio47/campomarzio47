"use client";

import { useEffect, useMemo, useState } from "react";
import type { PlaceOption } from "@/lib/reference-data";
import { useLocale } from "@/components/LocaleProvider";

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

  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value?.code]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2 || q === value?.label.toLowerCase()) return [];
    return options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 20);
  }, [query, options, value]);

  function selectOption(o: PlaceOption) {
    onChange(o);
    setQuery(o.label);
    setOpen(false);
  }

  function handleBlur() {
    // Da' il tempo al click su un suggerimento di registrarsi prima di chiudere.
    setTimeout(() => {
      setOpen(false);
      setTouched(true);

      if (!value) {
        const q = query.trim().toLowerCase();
        if (q.length >= 2) {
          // L'utente ha scritto il nome ma non ha cliccato un suggerimento:
          // se il testo identifica in modo univoco un'opzione, la selezioniamo
          // comunque (es. "marostica" -> "MAROSTICA (VI)").
          const matches = options.filter((o) => o.label.toLowerCase().includes(q));
          if (matches.length === 1) {
            selectOption(matches[0]);
          }
        }
      }
    }, 150);
  }

  const invalid = touched && !value && query.trim().length > 0;

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
          if (value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        aria-invalid={invalid}
        className={`w-full rounded-md border bg-off-white px-3 py-2 text-sm outline-none ${
          invalid ? "border-bordeaux" : "border-divider focus:border-bordeaux"
        }`}
      />
      {invalid && <p className="mt-1 text-xs text-bordeaux">{dict.checkin.selectFromListHint}</p>}
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-divider bg-off-white shadow-lg">
          {results.map((o) => (
            <li key={o.code}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectOption(o)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-divider/50"
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

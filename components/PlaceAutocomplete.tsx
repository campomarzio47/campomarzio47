"use client";

import { useEffect, useMemo, useState } from "react";
import type { PlaceOption } from "@/lib/reference-data";

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
  const [query, setQuery] = useState(value?.label ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value?.code]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2 || q === value?.label.toLowerCase()) return [];
    return options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 20);
  }, [query, options, value]);

  return (
    <div className="relative">
      <input
        required={required && !value}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full rounded-md border border-divider bg-off-white px-3 py-2 text-sm outline-none focus:border-bordeaux"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-divider bg-off-white shadow-lg">
          {results.map((o) => (
            <li key={o.code}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(o);
                  setQuery(o.label);
                  setOpen(false);
                }}
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

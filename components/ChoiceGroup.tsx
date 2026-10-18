"use client";

import { useId } from "react";

/**
 * Scelta fra poche opzioni come pulsanti affiancati (sesso, tipo di
 * documento): si vede tutto in un colpo d'occhio e si sceglie con un tocco,
 * dove un menu a tendina chiedeva due tocchi e nascondeva le opzioni.
 * Sotto sono radio veri: tastiera, `required` e screen reader funzionano
 * come il browser li conosce.
 */
export default function ChoiceGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
  required,
}: {
  legend: string;
  name: string;
  value: T | "";
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  required?: boolean;
}) {
  const base = useId();

  return (
    <fieldset>
      <legend className="mb-2 text-[0.8125rem] font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const id = `${base}-${option.value}`;
          const checked = value === option.value;
          return (
            <div key={option.value}>
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                required={required}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={`flex min-h-12 cursor-pointer select-none items-center rounded-full border px-5 text-[0.9375rem] transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bordeaux ${
                  checked
                    ? "border-charcoal bg-charcoal text-off-white"
                    : "border-divider bg-paper text-charcoal hover:border-charcoal"
                }`}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

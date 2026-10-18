"use client";

import { Minus, Plus } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

/**
 * Campo numerico con − e +, per ospiti e notti: sul telefono un
 * `<input type="number">` apre la tastiera per scrivere "2", mentre due
 * bottoni grandi bastano e non sbagliano. Il valore è annunciato dagli
 * screen reader a ogni cambio.
 */
export default function Stepper({
  id,
  label,
  hint,
  value,
  min,
  max,
  onChange,
  format = (n) => String(n),
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  format?: (n: number) => string;
}) {
  const { dict } = useLocale();
  const button =
    "flex h-11 w-11 flex-none items-center justify-center rounded-full border border-divider bg-paper text-charcoal transition-[border-color,transform,opacity] duration-200 hover:border-charcoal active:scale-90 disabled:opacity-30 disabled:hover:border-divider focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux";

  return (
    <div role="group" aria-labelledby={`${id}-label`} className="flex items-center justify-between gap-4">
      <div>
        <p id={`${id}-label`} className="text-[0.9375rem] font-medium">
          {label}
        </p>
        {hint && <p className="mt-0.5 text-xs text-mid">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`${dict.a11y.decrease}: ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={button}
        >
          <Minus size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <output
          id={id}
          aria-live="polite"
          className="tabular min-w-8 text-center font-display text-2xl"
        >
          {format(value)}
        </output>
        <button
          type="button"
          aria-label={`${dict.a11y.increase}: ${label}`}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={button}
        >
          <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

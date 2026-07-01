"use client";

import { useLocale } from "@/components/LocaleProvider";

export default function HouseRules() {
  const { dict } = useLocale();

  return (
    <>
      <h2 className="mt-14 mb-4 font-display text-2xl">{dict.availability.rulesTitle}</h2>
      <dl className="divide-y divide-divider border-y border-divider">
        {dict.availability.rules.map((rule) => (
          <div
            key={rule.label}
            className="flex items-center justify-between gap-4 py-3 text-sm"
          >
            <dt className="text-mid">{rule.label}</dt>
            <dd className="text-right font-medium">{rule.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

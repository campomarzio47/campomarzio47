"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { Dictionary } from "@/content/dictionaries";

type SectionWithTitle = {
  [K in keyof Dictionary]: Dictionary[K] extends { title: string } ? K : never;
}[keyof Dictionary];

export default function PageHeader({ section }: { section: SectionWithTitle }) {
  const { dict } = useLocale();
  const entry = dict[section] as { title: string; subtitle?: string };

  return (
    <div className="mb-10">
      <h1 className="font-display text-3xl md:text-5xl">{entry.title}</h1>
      {entry.subtitle && <p className="mt-2 text-mid">{entry.subtitle}</p>}
    </div>
  );
}

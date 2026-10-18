"use client";

import type { CSSProperties } from "react";
import { useLocale } from "@/components/LocaleProvider";
import Emphasis from "@/components/Emphasis";
import type { Dictionary } from "@/content/dictionaries";

type SectionWithTitle = {
  [K in keyof Dictionary]: Dictionary[K] extends { title: string } ? K : never;
}[keyof Dictionary];

/**
 * Titolo delle pagine interne. Accetta qualunque sezione del dizionario
 * con forma `{ title, subtitle?, eyebrow? }`. Il titolo sale da dietro una
 * linea invisibile, come quello della copertina: è la firma di ogni pagina.
 */
export default function PageHeader({
  section,
  className = "",
}: {
  section: SectionWithTitle;
  className?: string;
}) {
  const { dict } = useLocale();
  const entry = dict[section] as { title: string; subtitle?: string; eyebrow?: string };

  return (
    <header className={`mb-12 md:mb-16 ${className}`}>
      {entry.eyebrow && (
        <p className="eyebrow animate-fade-up" style={{ "--delay": "80ms" } as CSSProperties}>
          {entry.eyebrow}
        </p>
      )}
      <h1 className="mt-5 font-display text-[3rem] leading-[0.98] tracking-[-0.02em] md:text-[5.5rem]">
        <span className="line-mask">
          <span style={{ "--line-delay": "120ms" } as CSSProperties}>
            <Emphasis text={entry.title} />
          </span>
        </span>
      </h1>
      {entry.subtitle && (
        <p
          className="animate-fade-up mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-mid"
          style={{ "--delay": "320ms" } as CSSProperties}
        >
          {entry.subtitle}
        </p>
      )}
    </header>
  );
}

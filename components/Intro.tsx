"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import Emphasis from "@/components/Emphasis";
import { useLocale } from "@/components/LocaleProvider";
import type { Plural } from "@/content/dictionaries";
import { property } from "@/content/property";

/** "{n} ospiti" con il numero in Bodoni e la parola in piccolo. */
function Fact({ forms, n }: { forms: Plural | string; n: number }) {
  const template = typeof forms === "string" ? forms : n === 1 ? forms.one : forms.other;
  const [before, after] = template.split("{n}");
  return (
    <li className="flex items-baseline gap-2">
      {before && <span className="text-sm text-mid">{before}</span>}
      <span className="tabular font-display text-[2rem] leading-none">{n}</span>
      <span className="text-sm text-mid">{after?.trim()}</span>
    </li>
  );
}

/**
 * Subito sotto la copertina: la frase che racconta la casa, i numeri
 * essenziali e — perché chi apre il sito è spesso un ospite che ha già
 * prenotato altrove — la strada più breve per il check-in.
 */
export default function Intro() {
  const { dict } = useLocale();
  const { facts } = property;

  return (
    <section className="px-5 pb-20 pt-16 md:px-10 md:pb-28 md:pt-28">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-12 md:gap-8">
        <Reveal className="md:col-span-7">
          <p className="font-display text-[1.95rem] leading-[1.18] tracking-[-0.015em] md:text-[3.4rem] md:leading-[1.08]">
            <Emphasis text={dict.hero.tagline} />
          </p>
        </Reveal>

        <Reveal delay={150} className="md:col-span-4 md:col-start-9 md:pt-3">
          <p className="text-[1.0625rem] leading-[1.75] text-charcoal/80">{dict.hero.description}</p>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-5 border-t border-divider pt-6">
            <Fact forms={dict.facts.guests} n={facts.maxGuests} />
            <Fact forms={dict.facts.bedrooms} n={facts.bedrooms} />
            <Fact forms={dict.facts.beds} n={facts.beds} />
            <Fact forms={dict.facts.bathrooms} n={facts.bathrooms} />
            <Fact forms={dict.facts.surface} n={facts.surfaceSqm} />
          </ul>
        </Reveal>
      </div>

      <Reveal className="mx-auto mt-16 max-w-7xl md:mt-24">
        <Link
          href="/check-in"
          className="group flex items-center justify-between gap-5 rounded-[2px] border border-divider bg-paper px-5 py-5 transition-colors duration-300 hover:border-charcoal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bordeaux md:px-8 md:py-7"
        >
          <span>
            <span className="block font-display text-[1.4rem] leading-tight md:text-[1.75rem]">
              {dict.checkinPrompt.title}
            </span>
            <span className="mt-1.5 block max-w-xl text-[0.9375rem] leading-relaxed text-mid">
              {dict.checkinPrompt.body}
            </span>
          </span>
          <span className="flex flex-none items-center gap-4">
            <span className="hidden text-[0.9375rem] font-semibold md:inline">
              {dict.checkinPrompt.cta}
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-off-white transition-colors duration-300 group-hover:bg-bordeaux">
              <ArrowRight
                size={19}
                strokeWidth={1.75}
                aria-hidden="true"
                className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
              />
            </span>
          </span>
        </Link>
      </Reveal>
    </section>
  );
}

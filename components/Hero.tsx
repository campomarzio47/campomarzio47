"use client";

import Image from "next/image";
import { useLocale } from "@/components/LocaleProvider";
import BookingButtons from "@/components/BookingButtons";

export default function Hero() {
  const { dict } = useLocale();
  const keyFacts = [
    dict.hero.facts.surface,
    dict.hero.facts.bedrooms,
    dict.hero.facts.guests,
    dict.hero.facts.garden,
  ];

  return (
    <section>
      <div className="h-2 w-full bg-bordeaux" />
      <div className="relative h-[46vh] w-full overflow-hidden md:h-[58vh]">
        <Image
          src="/photos/soggiorno-divano.jpg"
          alt={dict.hero.tagline}
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
        <h1 className="font-display text-4xl leading-tight md:text-6xl">Campo Marzio 47</h1>
        <p className="mt-3 text-lg text-mid">{dict.hero.tagline}</p>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mid">
          {keyFacts.map((fact) => (
            <span key={fact} className="border-l-2 border-beam pl-3">
              {fact}
            </span>
          ))}
        </div>

        <BookingButtons className="mt-8" />

        <p className="mt-10 max-w-2xl text-base leading-relaxed text-charcoal/90">
          {dict.hero.description}
        </p>
      </div>
    </section>
  );
}

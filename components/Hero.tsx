"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
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
          src="/photos/copertina.jpg"
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

        <div className="mt-8">
          <Link
            href="/disponibilita#richiedi-prenotazione"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-bordeaux px-8 py-4 text-base font-semibold text-off-white shadow-md transition-colors hover:bg-bordeaux-dark"
          >
            <CalendarCheck size={19} strokeWidth={2} />
            {dict.bookingRequest.title}
          </Link>
          <BookingButtons className="mt-4" />
        </div>

        <p className="mt-10 max-w-2xl text-base leading-relaxed text-charcoal/90">
          {dict.hero.description}
        </p>
      </div>
    </section>
  );
}

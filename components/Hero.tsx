"use client";

import Image from "next/image";
import { useLocale } from "@/components/LocaleProvider";
import { property } from "@/content/property";

export default function Hero() {
  const { dict } = useLocale();

  return (
    <section>
      <div className="h-2 w-full bg-bordeaux" />
      <div className="relative h-[42dvh] w-full overflow-hidden md:h-[58vh]">
        <Image
          src={property.heroImage}
          alt={dict.hero.tagline}
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10 text-center md:px-10 md:py-14">
        <h1 className="font-display text-4xl leading-tight md:text-6xl">{property.name}</h1>
      </div>
    </section>
  );
}

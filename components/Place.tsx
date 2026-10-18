"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { useLocale } from "@/components/LocaleProvider";
import { property } from "@/content/property";

/**
 * "Dove siamo": la sezione scura della home. È il messaggio del sito —
 * non una casa qualunque, ma questa casa, in questa città — e per questo
 * cambia tono rispetto alle altre. Si nasconde da sola se il dizionario
 * non ha un titolo (struttura senza testi sul luogo).
 */
export default function Place() {
  const { dict } = useLocale();
  const { place } = dict;
  const { photo, mapsQuery } = property.surroundings;

  if (!place.title) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

  return (
    <section id="dove" className="bg-charcoal px-5 py-20 text-off-white md:px-10 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-12 md:items-center md:gap-8">
        {photo.src && (
          <figure className="md:col-span-5">
            <Reveal variant="mask" className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-off-white/10">
              <Image
                src={photo.src}
                alt={place.imageAlt}
                fill
                quality={85}
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </Reveal>
            <figcaption className="mt-3 text-[0.8125rem] italic text-off-white/55">
              {place.caption}
            </figcaption>
          </figure>
        )}

        <div className={photo.src ? "md:col-span-6 md:col-start-7" : "md:col-span-8"}>
          <SectionHeading eyebrow={place.eyebrow} title={place.title} tone="light" />
          <Reveal delay={120} className="mt-8 flex flex-col gap-5 text-[1.0625rem] leading-[1.75] text-off-white/75">
            {place.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Reveal>

          <Reveal delay={200}>
            <dl className="mt-10 grid grid-cols-1 border-t border-off-white/15 sm:grid-cols-3">
              {place.points.map((point) => (
                <div
                  key={point.label}
                  className="flex items-baseline justify-between gap-4 border-b border-off-white/15 py-4 sm:block sm:border-b-0 sm:pr-4"
                >
                  <dt className="text-sm text-off-white/60">{point.label}</dt>
                  <dd className="font-display text-xl italic sm:mt-2">{point.detail}</dd>
                </div>
              ))}
            </dl>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-off-white"
            >
              <span className="link-draw">{place.mapsLink}</span>
              <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

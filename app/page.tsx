"use client";

import Hero from "@/components/Hero";
import AvailabilityBar from "@/components/AvailabilityBar";
import PhotoCarousel from "@/components/PhotoCarousel";
import Amenities from "@/components/Amenities";
import ReviewsSection from "@/components/ReviewsSection";
import { useLocale } from "@/components/LocaleProvider";

export default function Home() {
  const { dict } = useLocale();

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-3xl px-6 pb-16 text-center md:px-10">
        <p className="font-display text-2xl italic text-mid">{dict.hero.tagline}</p>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-charcoal/90">
          {dict.hero.description}
        </p>
      </section>

      <section id="foto" className="border-t border-divider px-6 py-14 md:px-10 md:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl">{dict.photos.title}</h2>
          <p className="mt-1 text-sm text-mid">{dict.photos.subtitle}</p>
          <div className="mt-6">
            <PhotoCarousel />
          </div>
        </div>
      </section>

      <section id="servizi" className="border-t border-divider px-6 py-14 md:px-10 md:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl">{dict.amenities.title}</h2>
          <p className="mt-1 text-sm text-mid">{dict.amenities.subtitle}</p>
          <div className="mt-6">
            <Amenities />
          </div>
        </div>
      </section>

      <section id="recensioni" className="border-t border-divider px-6 py-14 md:px-10 md:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl">{dict.reviews.title}</h2>
          <p className="mt-1 text-sm text-mid">{dict.reviews.subtitle}</p>
          <div className="mt-6">
            <ReviewsSection />
          </div>
        </div>
      </section>

      <AvailabilityBar />
    </>
  );
}

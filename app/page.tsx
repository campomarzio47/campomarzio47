"use client";

import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import AvailabilityBar from "@/components/AvailabilityBar";
import PhotoMosaic from "@/components/PhotoMosaic";
import Amenities from "@/components/Amenities";
import Place from "@/components/Place";
import ReviewsSection from "@/components/ReviewsSection";
import SectionHeading from "@/components/SectionHeading";
import { useLocale } from "@/components/LocaleProvider";
import { property } from "@/content/property";

export default function Home() {
  const { dict } = useLocale();

  return (
    <>
      <Hero />
      <Intro />

      <section id="foto" className="px-5 pb-20 md:px-10 md:pb-36">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={dict.photos.eyebrow}
            title={dict.photos.title}
            subtitle={dict.photos.subtitle}
            className="mb-12 md:mb-16"
          />
          <PhotoMosaic />
        </div>
      </section>

      <section id="servizi" className="border-t border-divider px-5 py-20 md:px-10 md:py-36">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={dict.amenities.eyebrow}
            title={dict.amenities.title}
            subtitle={dict.amenities.subtitle}
            className="mb-12 md:mb-20"
          />
          <Amenities />
        </div>
      </section>

      <Place />

      {/* Senza recensioni (struttura nuova) la sezione non c'è: un titolo
          "Recensioni" sopra il vuoto dice il contrario di quello che
          vorrebbe. Il redirect da /recensioni porta comunque in home. */}
      {property.reviews.length > 0 && (
        <section id="recensioni" className="overflow-hidden px-5 py-20 md:px-10 md:py-36">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow={dict.reviews.eyebrow}
              title={dict.reviews.title}
              subtitle={dict.reviews.subtitle}
              className="mb-12 md:mb-16"
            />
            <ReviewsSection />
          </div>
        </section>
      )}

      <AvailabilityBar />
    </>
  );
}

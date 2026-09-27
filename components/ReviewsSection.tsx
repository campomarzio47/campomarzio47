"use client";

import ReviewCard from "@/components/ReviewCard";
import { property } from "@/content/property";
import { useLocale } from "@/components/LocaleProvider";

export default function ReviewsSection() {
  const { dict } = useLocale();

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {property.reviews.map((review) => (
          <ReviewCard key={review.name} review={review} />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <a
          href={property.booking.airbnbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm text-bordeaux underline underline-offset-4 hover:text-bordeaux-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux focus-visible:ring-offset-2"
        >
          {dict.reviews.allOnAirbnb}
        </a>
        <a
          href={property.booking.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm text-bordeaux underline underline-offset-4 hover:text-bordeaux-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux focus-visible:ring-offset-2"
        >
          {dict.reviews.allOnBooking}
        </a>
      </div>

      {/* Chi pubblica recensioni deve dire se e come verifica che
          provengano da clienti reali: art. 22 comma 4-bis del Codice del
          consumo, introdotto dalla direttiva Omnibus. */}
      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-mid">
        {dict.reviews.provenance}
      </p>
    </>
  );
}

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
          className="text-bordeaux underline underline-offset-4 hover:text-bordeaux-dark"
        >
          {dict.reviews.allOnAirbnb}
        </a>
        <a
          href={property.booking.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-bordeaux underline underline-offset-4 hover:text-bordeaux-dark"
        >
          {dict.reviews.allOnBooking}
        </a>
      </div>
    </>
  );
}

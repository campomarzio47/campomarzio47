"use client";

import { property } from "@/content/property";
import { useLocale } from "@/components/LocaleProvider";

export default function BookingButtons({
  className = "",
}: {
  className?: string;
}) {
  const { dict } = useLocale();
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      <a
        href={property.booking.airbnbUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-md border border-charcoal px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-charcoal hover:text-off-white"
      >
        {dict.buttons.airbnb}
      </a>
      <a
        href={property.booking.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-md border border-charcoal px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-charcoal hover:text-off-white"
      >
        {dict.buttons.booking}
      </a>
    </div>
  );
}

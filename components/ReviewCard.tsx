"use client";

import { Star, Quote } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { Review } from "@/content/property";

const MAX_STARS = 5;

/**
 * Le stelle sono derivate dal voto reale della recensione, non disegnate
 * fisse a cinque: i voti arrivano da Airbnb e Booking.com in decimi, e
 * mostrarne cinque a prescindere significherebbe pubblicare una
 * valutazione non ancorata al dato — cioè, se un domani arrivasse una
 * recensione da 8/10, una valutazione falsa.
 */
export default function ReviewCard({ review }: { review: Review }) {
  const { dict } = useLocale();
  const stars = Math.round((review.rating / 10) * MAX_STARS);
  const ratingLabel = dict.a11y.ratingOutOfFive.replace("{rating}", String(stars));

  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-md bg-charcoal p-6 text-off-white">
      <Quote
        size={72}
        strokeWidth={0}
        fill="currentColor"
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 -top-2 text-off-white/[0.06]"
      />
      {/* Il gruppo porta l'etichetta testuale: le icone da sole non
          dicono nulla a chi usa uno screen reader. */}
      <div role="img" aria-label={ratingLabel} className="flex items-center gap-1">
        {Array.from({ length: MAX_STARS }).map((_, i) => (
          <Star
            key={i}
            size={15}
            fill={i < stars ? "currentColor" : "none"}
            strokeWidth={i < stars ? 0 : 1.5}
            aria-hidden="true"
            className={i < stars ? "text-bordeaux" : "text-off-white/30"}
          />
        ))}
      </div>
      <p className="relative text-sm leading-relaxed text-off-white/90">
        &ldquo;{review.text}&rdquo;
      </p>
      <div className="mt-2 text-xs uppercase tracking-wide text-off-white/60">
        {review.name} · {review.group} · {review.date}
      </div>
    </div>
  );
}

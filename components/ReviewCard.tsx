import { Star, Quote } from "lucide-react";
import type { property } from "@/content/property";

type Review = (typeof property.reviews)[number];

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-md bg-charcoal p-6 text-off-white">
      <Quote
        size={72}
        strokeWidth={0}
        fill="currentColor"
        className="pointer-events-none absolute -right-2 -top-2 text-off-white/[0.06]"
      />
      <div className="flex items-center gap-1 text-bordeaux">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <p className="relative text-sm leading-relaxed text-off-white/90">
        &ldquo;{review.text}&rdquo;
      </p>
      <div className="mt-2 text-xs uppercase tracking-wide text-off-white/50">
        {review.name} · {review.group} · {review.date}
      </div>
    </div>
  );
}

import { Star } from "lucide-react";
import type { property } from "@/content/property";

type Review = (typeof property.reviews)[number];

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex flex-col gap-3 rounded-md bg-charcoal p-6 text-off-white">
      <div className="flex items-center gap-1 text-bordeaux">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <p className="text-sm leading-relaxed text-off-white/90">
        &ldquo;{review.text}&rdquo;
      </p>
      <div className="mt-2 text-xs uppercase tracking-wide text-off-white/50">
        {review.name} · {review.group} · {review.date}
      </div>
    </div>
  );
}

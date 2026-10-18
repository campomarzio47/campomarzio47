"use client";

import { useLocale } from "@/components/LocaleProvider";
import { fill } from "@/content/dictionaries";
import { defaultLocale, intlLocale } from "@/lib/locale";
import type { Review } from "@/content/property";

/**
 * Una recensione come una citazione stampata: il testo in Bodoni, chi
 * l'ha scritta sotto.
 *
 * Il voto è mostrato com'è — in decimi, come lo danno Airbnb e Booking —
 * e non convertito in stelle: cinque stelle disegnate a prescindere
 * sarebbero una valutazione non ancorata al dato, e una recensione da 8/10
 * diventerebbe una valutazione falsa.
 */
export default function ReviewCard({ review }: { review: Review }) {
  const { dict, locale } = useLocale();
  const [year, month] = review.date.split("-").map(Number);
  const when =
    year && month
      ? new Intl.DateTimeFormat(intlLocale[locale], { month: "long", year: "numeric" }).format(
          new Date(year, month - 1, 1),
        )
      : review.date;

  return (
    <figure className="flex h-full flex-col rounded-[2px] border border-divider bg-paper p-7 md:p-9">
      <span aria-hidden="true" className="block h-8 font-display text-[4.5rem] leading-[0.9] text-bordeaux">
        &ldquo;
      </span>
      {/* La recensione resta nella sua lingua originale: lang lo dice a
          screen reader e motori di ricerca anche quando il sito è in
          un'altra lingua. */}
      <blockquote lang={review.lang ?? defaultLocale} className="mt-3 flex-1 font-display text-[1.3rem] leading-[1.45] md:text-[1.4rem]">
        {review.text}
      </blockquote>
      <figcaption className="mt-8 flex items-end justify-between gap-4 border-t border-divider pt-5">
        <span>
          <span className="block font-semibold">{review.name}</span>
          <span className="mt-0.5 block text-sm text-mid">
            {dict.reviews.groups[review.group]} · {when}
          </span>
        </span>
        <span
          role="img"
          aria-label={fill(dict.a11y.ratingOutOfTen, { rating: review.rating })}
          className="tabular flex-none font-display text-2xl italic"
        >
          {review.rating}
          <span className="text-base not-italic text-mid">/10</span>
        </span>
      </figcaption>
    </figure>
  );
}

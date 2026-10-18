"use client";

import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ReviewCard from "@/components/ReviewCard";
import Reveal from "@/components/Reveal";
import { property } from "@/content/property";
import { useLocale } from "@/components/LocaleProvider";
import { fill } from "@/content/dictionaries";

/**
 * Recensioni: sul telefono scorrono di lato una alla volta (si intravede
 * la successiva, così si capisce che c'è altro), su desktop stanno
 * affiancate. Lo scorrimento è quello nativo; i trattini sotto dicono a
 * che punto si è e portano a una recensione precisa.
 */
export default function ReviewsSection() {
  const { dict } = useLocale();
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  // Un host può essere su una sola piattaforma: un URL vuoto non diventa
  // un link che riporta alla pagina stessa, semplicemente non compare.
  const { airbnbUrl, bookingUrl } = property.booking;
  const reviews = property.reviews;

  function onScroll() {
    const track = trackRef.current;
    if (!track || !track.firstElementChild) return;
    const card = (track.firstElementChild as HTMLElement).offsetWidth;
    setActive(Math.round(track.scrollLeft / (card + 16)));
  }

  function goTo(i: number) {
    const item = trackRef.current?.children[i] as HTMLElement | undefined;
    item?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  return (
    <>
      <ul
        ref={trackRef}
        onScroll={onScroll}
        aria-label={dict.a11y.reviews}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0"
      >
        {reviews.map((review, i) => (
          <li key={review.name + review.date} className="w-[86%] flex-none snap-start md:w-auto">
            <Reveal delay={i * 120} className="h-full">
              <ReviewCard review={review} />
            </Reveal>
          </li>
        ))}
      </ul>

      {reviews.length > 1 && (
        <div className="mt-6 flex gap-2 md:hidden">
          {reviews.map((review, i) => (
            <button
              key={review.name + review.date}
              type="button"
              onClick={() => goTo(i)}
              aria-label={fill(dict.a11y.showReview, { n: i + 1 })}
              aria-current={i === active ? "true" : undefined}
              className="flex h-11 items-center"
            >
              <span
                className={`block h-[2px] rounded-full transition-all duration-500 ease-out ${
                  i === active ? "w-10 bg-charcoal" : "w-5 bg-divider"
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {(airbnbUrl || bookingUrl) && (
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-1 text-[0.9375rem] font-semibold md:mt-12">
          {airbnbUrl && (
            <a
              href={airbnbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bordeaux"
            >
              <span className="link-draw">{dict.reviews.allOnAirbnb}</span>
              <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </a>
          )}
          {bookingUrl && (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bordeaux"
            >
              <span className="link-draw">{dict.reviews.allOnBooking}</span>
              <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </a>
          )}
        </div>
      )}

      {/* Chi pubblica recensioni deve dire se e come verifica che
          provengano da clienti reali: art. 22 comma 4-bis del Codice del
          consumo, introdotto dalla direttiva Omnibus. */}
      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-mid">{dict.reviews.provenance}</p>
    </>
  );
}

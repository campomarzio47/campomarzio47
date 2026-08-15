"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { property } from "@/content/property";
import { useLocale } from "@/components/LocaleProvider";
import Lightbox from "@/components/Lightbox";

export default function PhotoCarousel() {
  const { dict } = useLocale();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const photos = property.gallery.map((photo, i) => ({
    src: photo.src,
    alt: dict.photos.items[i]?.alt ?? "",
    caption: dict.photos.items[i]?.caption ?? "",
  }));

  function scrollByCard(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: direction * 340, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative h-[280px] w-[82%] flex-none snap-center overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux focus-visible:ring-offset-2 focus-visible:ring-offset-off-white sm:h-[380px] sm:w-[440px]"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              quality={90}
              sizes="(min-width: 640px) 440px, 82vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="pointer-events-none absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-off-white opacity-0 transition-opacity duration-300 group-hover:opacity-80" />
            <span className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-off-white opacity-0 transition-opacity duration-300 group-hover:opacity-80" />
            {photo.caption && (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-4 text-sm text-off-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {photo.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label={dict.photos.prev}
        onClick={() => scrollByCard(-1)}
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-off-white/90 p-2.5 text-charcoal shadow-md transition-all duration-200 hover:bg-off-white active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux sm:flex"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        aria-label={dict.photos.next}
        onClick={() => scrollByCard(1)}
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-off-white/90 p-2.5 text-charcoal shadow-md transition-all duration-200 hover:bg-off-white active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux sm:flex"
      >
        <ChevronRight size={20} />
      </button>

      {openIndex !== null && (
        <Lightbox
          photos={photos}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { property } from "@/content/property";
import { useLocale } from "@/components/LocaleProvider";
import Lightbox from "@/components/Lightbox";

const spanClasses = [
  "sm:col-span-2 sm:row-span-2",
  "",
  "",
  "sm:col-span-2",
  "",
  "",
];

export default function Gallery() {
  const { dict } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const photos = property.gallery.map((photo, i) => ({
    src: photo.src,
    alt: dict.photos.items[i]?.alt ?? "",
    caption: dict.photos.items[i]?.caption ?? "",
  }));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:auto-rows-[160px] sm:grid-cols-4">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            onClick={() => setOpenIndex(i)}
            className={`group relative min-h-[140px] overflow-hidden rounded-md ${spanClasses[i] ?? ""}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 640px) 25vw, 50vw"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          photos={photos}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </>
  );
}

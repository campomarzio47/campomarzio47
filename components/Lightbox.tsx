"use client";

import Image from "next/image";
import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

type Photo = { src: string; alt: string; caption: string };

export default function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: readonly Photo[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const goPrev = useCallback(
    () => onNavigate((index - 1 + photos.length) % photos.length),
    [index, photos.length, onNavigate],
  );
  const goNext = useCallback(
    () => onNavigate((index + 1) % photos.length),
    [index, photos.length, onNavigate],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goPrev, goNext]);

  const { dict } = useLocale();
  const photo = photos[index];

  // Portale su document.body: la lightbox è "fixed" e non deve dipendere
  // dagli antenati (es. il wrapper Reveal usa transform per l'animazione,
  // che altrimenti diventerebbe il nuovo contenitore di riferimento per
  // "fixed", spostando l'overlay fuori posto).
  return createPortal(
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-charcoal/95 px-4">
      <button
        aria-label={dict.photos.close}
        onClick={onClose}
        className="absolute right-5 top-5 rounded-full p-1 text-off-white/80 transition-all duration-200 hover:text-off-white active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-off-white"
      >
        <X size={28} />
      </button>

      <button
        aria-label={dict.photos.prev}
        onClick={goPrev}
        className="absolute left-3 rounded-full p-1 text-off-white/70 transition-all duration-200 hover:text-off-white active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-off-white md:left-8"
      >
        <ChevronLeft size={32} />
      </button>

      <div className="animate-pop-in flex max-h-[85vh] w-full max-w-4xl flex-col items-center gap-4">
        <div className="relative h-[70vh] w-full">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            quality={90}
            className="object-contain"
            sizes="100vw"
          />
        </div>
        <p className="text-sm text-off-white/70">{photo.caption}</p>
      </div>

      <button
        aria-label={dict.photos.next}
        onClick={goNext}
        className="absolute right-3 rounded-full p-1 text-off-white/70 transition-all duration-200 hover:text-off-white active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-off-white md:right-8"
      >
        <ChevronRight size={32} />
      </button>
    </div>,
    document.body,
  );
}

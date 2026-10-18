"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import PhotoViewer, { type ViewerPhoto } from "@/components/PhotoViewer";
import { useLocale } from "@/components/LocaleProvider";
import { fill } from "@/content/dictionaries";
import { property } from "@/content/property";

type Slot = "wide" | "tall";

// Composizione fissa a zig-zag: orizzontale grande, due verticali sfalsate,
// orizzontale grande. Ogni posizione ha le sue classi per telefono e
// desktop.
const SLOTS: { slot: Slot; className: string; aspect: string; delay: number }[] = [
  { slot: "wide", className: "col-span-2 md:col-span-8", aspect: "aspect-[4/3]", delay: 0 },
  { slot: "tall", className: "col-span-1 md:col-span-4 md:self-end", aspect: "aspect-[3/4]", delay: 140 },
  { slot: "tall", className: "col-span-1 mt-12 md:col-span-4 md:mt-0", aspect: "aspect-[3/4]", delay: 260 },
  { slot: "wide", className: "col-span-2 md:col-span-8 md:mt-24", aspect: "aspect-[4/3]", delay: 120 },
];

/**
 * Sceglie le foto per i quattro posti della composizione rispettandone
 * l'orientamento: una foto verticale tagliata in orizzontale perde metà
 * della stanza. Le prende nell'ordine di property.gallery; se mancano
 * foto del formato giusto, usa le prime rimaste.
 */
function pickMosaic(photos: ViewerPhoto[]): number[] {
  const used = new Set<number>();
  const picked: number[] = [];
  for (const { slot } of SLOTS) {
    const wanted = photos.findIndex(
      (p, i) => !used.has(i) && (slot === "wide" ? p.width >= p.height : p.height > p.width),
    );
    const index = wanted >= 0 ? wanted : photos.findIndex((_, i) => !used.has(i));
    if (index < 0) break;
    used.add(index);
    picked.push(index);
  }
  return picked;
}

export default function PhotoMosaic() {
  const { dict } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const pushedHistory = useRef(false);

  const photos: ViewerPhoto[] = property.gallery.map((photo, i) => ({
    ...photo,
    alt: dict.photos.items[i]?.alt ?? "",
    caption: dict.photos.items[i]?.caption ?? "",
  }));
  const mosaic = pickMosaic(photos);

  // Il tasto "indietro" del telefono deve chiudere la galleria, non far
  // uscire dalla pagina: è il gesto che quasi tutti fanno per primo.
  // Una voce in più nella cronologia (stesso URL) lo rende possibile.
  const open = useCallback((index: number) => {
    setOpenIndex(index);
    window.history.pushState({ ...window.history.state, gallery: true }, "");
    pushedHistory.current = true;
  }, []);

  const close = useCallback(() => {
    if (pushedHistory.current) window.history.back();
    else setOpenIndex(null);
  }, []);

  useEffect(() => {
    if (openIndex === null) return;
    function onPop() {
      pushedHistory.current = false;
      setOpenIndex(null);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [openIndex]);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-12 md:gap-x-8 md:gap-y-10">
        {mosaic.map((photoIndex, position) => {
          const photo = photos[photoIndex];
          const { className, aspect, delay } = SLOTS[position];
          return (
            <figure key={photo.src} className={className}>
              <Reveal variant="mask" delay={delay} className="overflow-hidden rounded-[2px] bg-sand">
                <button
                  type="button"
                  onClick={() => open(photoIndex)}
                  aria-label={`${photo.caption} — ${fill(dict.photos.viewAll, { n: photos.length })}`}
                  className={`group relative block ${aspect} w-full cursor-zoom-in transition-transform duration-300 ease-out active:scale-[0.985] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-off-white`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    quality={85}
                    sizes={
                      position === 0 || position === 3
                        ? "(min-width: 768px) 60vw, 100vw"
                        : "(min-width: 768px) 30vw, 50vw"
                    }
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                  />
                </button>
              </Reveal>
              <figcaption className="mt-3 flex items-baseline gap-3 text-[0.8125rem] leading-snug text-mid md:text-sm">
                <span className="tabular font-display text-[0.9375rem] italic text-bordeaux">
                  {String(photoIndex + 1).padStart(2, "0")}
                </span>
                <span>{photo.caption}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      <Reveal className="mt-12 flex md:mt-16 md:justify-end">
        <button
          type="button"
          onClick={() => open(0)}
          className="link-arrow group flex min-h-12 items-center gap-4 rounded-full py-1 pr-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bordeaux"
        >
          <span aria-hidden="true" className="flex -space-x-3">
            {photos
              .filter((_, i) => !mosaic.includes(i))
              .slice(0, 3)
              .map((photo, i) => (
                <span
                  key={photo.src}
                  className="relative block h-11 w-11 overflow-hidden rounded-full ring-2 ring-off-white transition-transform duration-500 ease-out group-hover:translate-x-[var(--spread)]"
                  style={{ "--spread": `${i * 4}px` } as CSSProperties}
                >
                  <Image src={photo.src} alt="" fill sizes="44px" className="object-cover" />
                </span>
              ))}
          </span>
          <span className="link-draw text-[0.9375rem] font-semibold">
            {fill(dict.photos.viewAll, { n: photos.length })}
          </span>
          <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" className="arrow" />
        </button>
      </Reveal>

      <PhotoViewer
        photos={photos}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={close}
      />
    </>
  );
}

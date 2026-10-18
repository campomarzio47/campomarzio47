"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { fill } from "@/content/dictionaries";
import { useDialog } from "@/lib/hooks/useDialog";
import { usePresence, useHydrated } from "@/lib/hooks/usePresence";

export type ViewerPhoto = {
  src: string;
  width: number;
  height: number;
  focus?: string;
  alt: string;
  caption: string;
};

/**
 * Galleria a schermo intero.
 *
 * Lo scorrimento fra le foto è quello nativo del browser (scroll-snap):
 * segue il dito al pixel, ha l'inerzia del sistema e non serve alcuna
 * libreria. Frecce, tastiera e miniature lo comandano dall'esterno.
 *
 * Ogni foto è mostrata al massimo a 1,25 volte la sua larghezza reale: le
 * foto da telefono ingrandite a tutto schermo su un monitor diventano
 * pastose, ed è quello che faceva sembrare "finta" la vecchia galleria.
 *
 * Montata con un portale su document.body: un antenato con `transform`
 * (le animazioni di Reveal) altrimenti diventerebbe il riferimento per
 * `position: fixed` e la sposterebbe fuori posto.
 */
export default function PhotoViewer({
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  photos: ViewerPhoto[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const { dict } = useLocale();
  const hydrated = useHydrated();
  const open = index !== null;
  const { mounted, closing } = usePresence(open, 280);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  // Indice mostrato: resta l'ultimo anche durante l'animazione di uscita.
  const [current, setCurrent] = useState(index ?? 0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && index !== null) setCurrent(index);
  }

  useDialog(open, onClose, dialogRef, closeRef);

  // All'apertura la striscia si posiziona sulla foto scelta, senza
  // animazione: l'utente deve vedere subito quella che ha toccato.
  useEffect(() => {
    if (index === null) return;
    const track = trackRef.current;
    if (track && Math.round(track.scrollLeft / track.clientWidth) !== index) {
      track.scrollTo({ left: index * track.clientWidth, behavior: "instant" as ScrollBehavior });
    }
    // Solo all'apertura: durante la navigazione la posizione la decide lo scorrimento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const goTo = useCallback(
    (next: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(photos.length - 1, next));
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      track.scrollTo({ left: clamped * track.clientWidth, behavior: reduced ? "auto" : "smooth" });
    },
    [photos.length],
  );

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goTo(current - 1);
      if (e.key === "ArrowRight") goTo(current + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, current, goTo]);

  // La miniatura attiva resta sempre visibile nella sua striscia.
  useEffect(() => {
    const thumb = thumbsRef.current?.children[current] as HTMLElement | undefined;
    thumb?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [current]);

  const frame = useRef(0);
  function onScroll() {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const track = trackRef.current;
      if (!track) return;
      const next = Math.round(track.scrollLeft / track.clientWidth);
      if (next !== current) {
        setCurrent(next);
        onIndexChange(next);
      }
    });
  }

  if (!hydrated || !mounted) return null;

  const photo = photos[current];

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={dict.a11y.photoDialog}
      className={`fixed inset-0 z-50 flex flex-col bg-[#141210] text-off-white ${
        closing ? "animate-fade-out" : "animate-fade-in"
      }`}
    >
      <div className="flex h-16 flex-none items-center justify-between px-4 md:h-20 md:px-8">
        <p className="tabular font-display text-lg">
          <span className="italic">{String(current + 1).padStart(2, "0")}</span>
          <span className="mx-2 text-off-white/40">/</span>
          <span className="text-off-white/60">{String(photos.length).padStart(2, "0")}</span>
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={dict.photos.close}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-off-white/20 transition-colors duration-300 hover:border-off-white/60 active:scale-95 focus-visible:outline-2 focus-visible:outline-off-white"
        >
          <X size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {photos.map((p, i) => (
            <figure
              key={p.src}
              className={`flex h-full w-full flex-none snap-center snap-always flex-col items-center justify-center gap-4 px-4 md:px-24 ${
                closing ? "" : "animate-pop-in"
              }`}
              aria-hidden={i !== current}
            >
              <div
                className="relative max-h-full w-full"
                style={{
                  aspectRatio: `${p.width} / ${p.height}`,
                  maxWidth: `min(100%, ${Math.round(p.width * 1.25)}px, calc((100svh - 13rem) * ${(p.width / p.height).toFixed(4)}))`,
                }}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  quality={90}
                  sizes="(min-width: 768px) 1000px, 100vw"
                  // Le foto vicine si caricano subito: scorrendo non deve
                  // mai apparire un riquadro vuoto.
                  loading={Math.abs(i - (index ?? current)) <= 1 ? "eager" : "lazy"}
                  className="object-contain"
                />
              </div>
              <figcaption className="max-w-md px-4 text-center text-sm text-off-white/70">
                {p.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          aria-label={dict.photos.prev}
          className="absolute left-6 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-off-white/20 transition-[border-color,opacity] duration-300 hover:border-off-white/60 disabled:opacity-0 focus-visible:outline-2 focus-visible:outline-off-white md:flex"
        >
          <ChevronLeft size={22} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => goTo(current + 1)}
          disabled={current === photos.length - 1}
          aria-label={dict.photos.next}
          className="absolute right-6 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-off-white/20 transition-[border-color,opacity] duration-300 hover:border-off-white/60 disabled:opacity-0 focus-visible:outline-2 focus-visible:outline-off-white md:flex"
        >
          <ChevronRight size={22} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <div
        ref={thumbsRef}
        role="group"
        aria-label={dict.a11y.thumbnails}
        className="no-scrollbar flex flex-none gap-2 overflow-x-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:justify-center md:pb-6"
      >
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={fill(dict.a11y.showPhoto, { n: i + 1 })}
            aria-current={i === current ? "true" : undefined}
            className={`relative h-14 w-14 flex-none overflow-hidden rounded-[2px] transition-[opacity,transform] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-off-white ${
              i === current ? "opacity-100" : "opacity-40 hover:opacity-75"
            }`}
          >
            <Image src={p.src} alt="" fill sizes="56px" className="object-cover" />
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-off-white transition-transform duration-500 ease-out ${
                i === current ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {photo?.caption}
      </p>
    </div>,
    document.body,
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { property } from "@/content/property";

/**
 * Copertina della home: solo la foto e il nome, niente dati né bottoni —
 * il resto sta subito sotto e nella barra delle date.
 *
 * Il movimento è uno solo e ha un senso: la foto entra leggermente
 * ingrandita e si assesta mentre il nome sale riga per riga; scorrendo,
 * la foto scivola più lenta del testo (parallasse leggera) e il nome si
 * dissolve. Con "riduci movimento" attivo resta tutto fermo.
 */
export default function Hero() {
  const { dict } = useLocale();
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const { name, nameAccent, address } = property;
  const base = nameAccent ? name.replace(nameAccent, "").trimEnd() : name;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;

    function update() {
      frame = 0;
      const y = window.scrollY;
      const h = window.innerHeight;
      if (y > h * 1.2) return;
      if (imageRef.current) imageRef.current.style.transform = `translate3d(0, ${y * 0.32}px, 0)`;
      if (titleRef.current) {
        titleRef.current.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
        titleRef.current.style.opacity = String(Math.max(0, 1 - y / (h * 0.55)));
      }
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    // Su telefono riempie tutta la prima schermata: a 76svh l'inizio della
    // frase dell'introduzione ("Travi a vista, rovere…") spuntava tagliato
    // sotto la foto, dietro la barra delle date.
    <section className="relative h-[100svh] min-h-[520px] w-full overflow-hidden bg-charcoal md:h-[92vh] md:max-h-[1100px]">
      <div ref={imageRef} className="absolute inset-0 will-change-transform">
        <Image
          src={property.heroImage}
          // Descrizione della foto, non lo slogan: a chi non vede
          // l'immagine serve sapere cosa mostra.
          alt={dict.hero.imageAlt}
          fill
          priority
          quality={85}
          sizes="100vw"
          className="hero-settle object-cover object-[50%_60%]"
        />
      </div>
      {/* Due sfumature: in alto per leggere l'intestazione, in basso per il
          nome. Il centro della foto resta pulito. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(20,18,16,0.55)_0%,rgba(20,18,16,0)_22%,rgba(20,18,16,0)_45%,rgba(20,18,16,0.72)_100%)]"
      />

      <div
        ref={titleRef}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-28 text-off-white md:px-10 md:pb-20"
      >
        <p
          className="animate-fade-up mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-off-white/85"
          style={{ "--delay": "700ms" } as CSSProperties}
        >
          <span aria-hidden="true" className="h-px w-8 bg-current" />
          {address.city} · {address.provinceName}
        </p>
        <h1 className="font-display text-[clamp(2.9rem,12.6vw,9rem)] font-medium leading-[0.92] tracking-[-0.015em]">
          <span className="line-mask">
            <span style={{ "--line-delay": "150ms" } as CSSProperties}>{base}</span>
          </span>
          {/* Lo spazio serve a chi legge il titolo come testo: le due righe
              sono blocchi e senza diventerebbe "Campo Marzio47". */}
          {nameAccent && " "}
          {nameAccent && (
            <span className="line-mask">
              <span style={{ "--line-delay": "300ms" } as CSSProperties}>
                <em className="italic">{nameAccent}</em>
              </span>
            </span>
          )}
        </h1>
      </div>

      <div
        aria-hidden="true"
        className="animate-fade-in absolute bottom-10 right-10 z-10 hidden flex-col items-center gap-3 text-off-white/80 md:flex"
        style={{ animationDelay: "1.4s" }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] [writing-mode:vertical-rl]">
          {dict.hero.scroll}
        </span>
        <span className="relative block h-14 w-px overflow-hidden bg-off-white/25">
          <span className="animate-scroll-cue absolute inset-0 bg-off-white" />
        </span>
      </div>
    </section>
  );
}

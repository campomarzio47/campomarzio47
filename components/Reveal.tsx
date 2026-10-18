"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Fa comparire il contenuto quando entra nello schermo.
 *
 * - `fade` (predefinito): sale di poco e si dissolve in entrata.
 * - `mask`: per le foto — un sipario che si alza dal basso mentre
 *   l'immagine si assesta (vedi `.reveal-mask` in globals.css).
 *
 * `delay` sfasa gli elementi vicini (30–150 ms l'uno dall'altro) perché
 * arrivino in sequenza e non tutti insieme.
 *
 * Attenzione: `.reveal` usa `transform`, che rende questo div il
 * contenitore di riferimento per qualunque discendente `position: fixed`.
 * Overlay e finestre modali vanno montati con un portale su document.body.
 */
export default function Reveal({
  children,
  className = "",
  variant = "fade",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "mask";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;

  // Il sipario sta su un elemento interno: Chrome considera "non visibile"
  // per l'IntersectionObserver un elemento con clip-path completamente
  // chiuso, e la foto non si scoprirebbe mai.
  if (variant === "mask") {
    return (
      <div ref={ref} className={`reveal-mask ${visible ? "reveal-visible" : ""} ${className}`} style={style}>
        <div className={`reveal-mask-inner ${visible ? "is-open" : ""}`}>{children}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`reveal ${visible ? "reveal-visible" : ""} ${className}`} style={style}>
      {children}
    </div>
  );
}

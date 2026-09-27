"use client";

import { useLocale } from "@/components/LocaleProvider";

/**
 * Primo elemento focusabile della pagina: permette a chi naviga da
 * tastiera di saltare la sidebar e arrivare al contenuto senza passare
 * per tutte le voci di menu a ogni cambio pagina.
 *
 * Invisibile finché non riceve il focus (`sr-only` + `focus:not-sr-only`),
 * quindi non cambia nulla per chi usa il mouse.
 */
export default function SkipLink() {
  const { dict } = useLocale();

  return (
    <a
      href="#contenuto"
      className="sr-only rounded-md bg-bordeaux px-4 py-2 text-sm font-medium text-off-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
    >
      {dict.a11y.skipToContent}
    </a>
  );
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Tiene montato un elemento per il tempo della sua animazione d'uscita.
 * Con `open` a true è montato subito, nello stesso render: chi gestisce
 * il focus (useDialog) trova già l'elemento nel DOM. Quando `open` torna
 * false resta montato con `closing` a true per `exitMs`, poi sparisce.
 * L'uscita dura meno dell'entrata, di proposito: chi chiude vuole tornare
 * subito a quello che stava guardando.
 */
export function usePresence(open: boolean, exitMs = 320) {
  const [visible, setVisible] = useState(open);

  // Aggiornamento durante il render (il modo indicato da React per uno
  // stato che segue una prop), non in un effetto.
  if (open && !visible) setVisible(true);

  useEffect(() => {
    if (open || !visible) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setVisible(false), reduced ? 0 : exitMs);
    return () => window.clearTimeout(timer);
  }, [open, visible, exitMs]);

  return { mounted: open || visible, closing: !open && visible };
}

const noop = () => () => {};

/** true solo dopo l'idratazione: i portali su document.body non esistono lato server. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

import type { Dictionary } from "@/content/dictionaries";

/** Le quattro voci di navigazione, tutte allo stesso livello: nessuna è un bottone speciale. */
export function navItems(dict: Dictionary) {
  return [
    { href: "/", label: dict.nav.home },
    { href: "/prenota", label: dict.nav.book },
    { href: "/check-in", label: dict.nav.checkin },
    { href: "/contatti", label: dict.nav.contact },
  ];
}

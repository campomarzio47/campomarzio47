import type { Metadata } from "next";
import { dictionaries, type Dictionary } from "@/content/dictionaries";
import { defaultLocale } from "@/lib/locale";
import { property } from "@/content/property";

// URL pubblico del sito, unico punto di verità: lo usano layout.tsx (tag
// canonical/Open Graph), sitemap.ts e robots.ts.
// .trim() + rimozione dello slash finale perché un copia-incolla nella
// dashboard Vercel può lasciare uno spazio o un "/" di troppo, che
// produrrebbe URL canonici sbagliati del tipo "https://sito.it//prenota".
const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://campomarzio47.it";
export const siteUrl = rawSiteUrl.replace(/\/+$/, "");

// Immagine Open Graph dedicata, 1200x630 (il formato che Facebook,
// WhatsApp, LinkedIn e X si aspettano). NON riusare la foto di copertina
// a piena risoluzione: i crawler social scaricano il file originale senza
// passare da next/image, e sopra i ~5 MB rinunciano all'anteprima.
export const ogImage = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  // imageAlt descrive la foto (non è lo slogan): è quello che serve a chi
  // riceve l'anteprima del link con uno screen reader.
  alt: dictionaries[defaultLocale].hero.imageAlt,
};

// Sezioni del dizionario che hanno sia un titolo sia una description
// dedicata in meta.pages — cioè le pagine interne indicizzabili.
type PageKey = keyof Dictionary["meta"]["pages"];

/**
 * Metadati di una pagina interna: titolo, description propria e soprattutto
 * il tag canonical che punta alla pagina stessa.
 *
 * Senza `alternates.canonical` esplicito, Next eredita quello del layout
 * padre ("/"): ogni pagina si dichiarerebbe una copia della home e Google
 * la escluderebbe dall'indice ("Pagina alternativa con tag canonical
 * appropriato" in Search Console). Ogni nuova pagina indicizzabile deve
 * quindi passare da qui.
 */
export function pageMetadata(key: PageKey, path: string): Metadata {
  const dict = dictionaries[defaultLocale];
  const title = `${dict[key].title} — ${property.name}`;
  const description = dict.meta.pages[key].description;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: property.name,
      images: [ogImage],
      locale: "it_IT",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

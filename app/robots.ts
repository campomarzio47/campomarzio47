import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// Da quando le prenotazioni sono richieste via email non esistono più
// pagine private (/host/..., /prenota/conferma): resta escluso solo /api/.
// Le route POST non sono scansionabili comunque; /api/availability è GET
// e restituisce JSON (le date occupate per il calendario), che non ha
// senso far indicizzare. Non contiene contenuto necessario al rendering
// della pagina, quindi escluderla non penalizza la resa lato Google.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

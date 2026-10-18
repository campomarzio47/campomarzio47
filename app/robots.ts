import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// Escluse dalla scansione:
// - /api/: le route POST non sono scansionabili comunque; /api/availability
//   è GET ma restituisce JSON (le date occupate per il calendario), che non
//   ha senso far indicizzare e non serve al rendering della pagina;
// - /host/: la pagina Conferma/Rifiuta delle prenotazioni pagate, che si
//   apre solo dal link firmato dell'email;
// - /prenota/conferma e /offerte/: pagine di passaggio (ritorno da Stripe,
//   disiscrizione), già marcate noindex.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/host/", "/prenota/conferma", "/offerte/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

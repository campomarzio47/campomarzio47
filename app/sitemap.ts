import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// Solo le route canoniche: /foto, /servizi, /recensioni sono redirect
// verso ancore della home e non vanno elencate qui.
// Niente lastModified: sarebbe new Date() a ogni build, cioè "tutte le
// pagine sono cambiate oggi" a ogni deploy. Un lastmod che mente viene
// semplicemente ignorato dai motori, meglio ometterlo.
const routes = [
  "",
  "/prenota",
  "/check-in",
  "/contatti",
  "/privacy",
  "/cookie-policy",
  "/termini",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
  }));
}

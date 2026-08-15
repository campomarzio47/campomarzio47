import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://campomarzio47.vercel.app";

// Solo le route canoniche: /foto, /servizi, /recensioni sono redirect
// verso ancore della home e non vanno elencate qui.
const routes = ["", "/prenota", "/check-in", "/contatti"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));
}

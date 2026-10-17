import path from "node:path";
import type { NextConfig } from "next";

// Dominio ufficiale del sito. Deve combaciare con NEXT_PUBLIC_SITE_URL
// (vedi lib/seo.ts): il tag canonical e questo redirect devono indicare
// lo stesso indirizzo, altrimenti si contraddicono a vicenda.
const CANONICAL_HOST = "campomarzio47.it";

// Altri indirizzi da cui il sito risponde e che devono rimandare (308) al
// dominio ufficiale: il sottodominio tecnico della piattaforma
// (<progetto>.vercel.app su Vercel, <worker>.<sottodominio>.workers.dev su
// Cloudflare) ed eventualmente il www. Servono solo internamente:
// lasciarli raggiungibili significa avere copie identiche del sito a più
// indirizzi, e Google ne sceglie una da solo.
//
// Vanno aggiunti SOLO quando il dominio ufficiale risponde davvero:
// finché CANONICAL_HOST non è collegato, il redirect porterebbe gli ospiti
// su un indirizzo che non esiste.
const ALIAS_HOSTS = ["campomarzio47.vercel.app"];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    qualities: [75, 90],
  },
  async redirects() {
    // Corrispondenza esatta su ciascun host, NON su tutto *.vercel.app o
    // *.workers.dev: le anteprime dei branch (Vercel) e delle versioni
    // (Cloudflare) hanno host diversi e devono restare raggiungibili per
    // poterle controllare prima di pubblicarle.
    return ALIAS_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `https://${CANONICAL_HOST}/:path*`,
      permanent: true,
    }));
  },
};

export default nextConfig;

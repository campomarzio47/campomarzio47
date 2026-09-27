import path from "node:path";
import type { NextConfig } from "next";

// Dominio ufficiale del sito. Deve combaciare con NEXT_PUBLIC_SITE_URL
// (vedi lib/seo.ts): il tag canonical e questo redirect devono indicare
// lo stesso indirizzo, altrimenti si contraddicono a vicenda.
const CANONICAL_HOST = "campomarzio47.it";

// Sottodominio Vercel assegnato al progetto. Serve solo internamente:
// lasciarlo raggiungibile significa avere due copie identiche del sito a
// due indirizzi diversi, e Google ne sceglie una da solo.
const VERCEL_HOST = "campomarzio47.vercel.app";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    qualities: [75, 90],
  },
  async redirects() {
    return [
      {
        // Corrispondenza esatta sull'host di produzione, NON su tutto
        // *.vercel.app: le anteprime dei branch hanno host del tipo
        // campomarzio47-git-<branch>-<utente>.vercel.app e devono restare
        // raggiungibili per poterle controllare prima del deploy.
        source: "/:path*",
        has: [{ type: "host", value: VERCEL_HOST }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

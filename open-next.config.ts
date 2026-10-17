import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Configurazione dell'adapter OpenNext per Cloudflare Workers.
//
// Cache di sola lettura sugli asset statici: serve le poche route
// prerenderizzate alla build (sitemap, robots, icone, redirect delle
// vecchie pagine) senza bisogno di R2, KV o D1 — niente risorse in più da
// creare per ogni nuovo sito. Il prezzo è che la revalidation (ISR) non
// esiste: nessuna route deve affidarsi a `export const revalidate`, che qui
// congelerebbe la risposta al momento della build. Per questo
// /api/availability è dinamica.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});

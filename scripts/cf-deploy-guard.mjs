/**
 * Controllo che precede `npm run deploy` (deploy su Cloudflare dal PC).
 *
 * Perché esiste: l'adapter OpenNext copia DENTRO il bundle del Worker i
 * valori dei file .env del progetto (.env, .env.production, .env.local,
 * .env.production.local), da usare come ripiego quando una variabile non
 * è impostata su Cloudflare. Un deploy lanciato da un PC con un .env.local
 * completo pubblicherebbe quindi la password SMTP dentro il codice del
 * Worker — e, peggio, un secret dimenticato nella dashboard non darebbe
 * nessun errore, perché il sito userebbe in silenzio i valori locali.
 *
 * La strada normale è Workers Builds (deploy automatico da GitHub), dove
 * questi file non esistono perché sono gitignorati. Da qui si può
 * pubblicare solo se nei file .env restano al massimo variabili
 * NEXT_PUBLIC_*, che sono pubbliche per definizione: Next le scrive
 * comunque nel codice mandato al browser.
 *
 *   node scripts/cf-deploy-guard.mjs
 */
import { existsSync, readFileSync } from "node:fs";

const FILES = [".env", ".env.production", ".env.local", ".env.production.local"];

function nonEmptyKeys(file) {
  return readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const eq = line.indexOf("=");
      if (eq === -1) return null;
      const key = line.slice(0, eq).replace(/^export\s+/, "").trim();
      const value = line.slice(eq + 1).trim().replace(/^(['"])(.*)\1$/, "$2");
      return value ? key : null;
    })
    .filter(Boolean);
}

const problems = FILES.filter(existsSync).flatMap((file) =>
  nonEmptyKeys(file)
    .filter((key) => !key.startsWith("NEXT_PUBLIC_"))
    .map((key) => `${file}: ${key}`),
);

if (problems.length > 0) {
  console.error(
    [
      "Deploy fermato: questi valori finirebbero dentro il codice del Worker pubblicato.",
      "",
      ...problems.map((p) => `  - ${p}`),
      "",
      "Usa il deploy automatico da GitHub (Workers Builds), oppure sposta",
      "temporaneamente i file .env fuori dalla cartella prima di ripetere.",
      "Le variabili di produzione vanno impostate su Cloudflare:",
      "Workers & Pages → <sito> → Settings → Variables and Secrets.",
    ].join("\n"),
  );
  process.exit(1);
}

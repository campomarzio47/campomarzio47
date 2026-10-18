/**
 * Supporto alla creazione di un nuovo sito a partire da questo modello
 * (vedi TEMPLATE-SETUP.md e la skill /nuovo-sito). Fa le parti meccaniche,
 * quelle che non richiedono giudizio:
 *
 *   node scripts/new-site.mjs init --foto <cartella> --copertina <file> --nome <slug>
 *
 *     - salva le "impronte" dell'immobile del modello (nome, indirizzo,
 *       contatti, URL, dominio) in .new-site/impronte.json, PRIMA che i
 *       contenuti vengano riscritti: servono a `check`;
 *     - svuota public/photos e ci mette le foto nuove: ruotate secondo
 *       l'EXIF, ridimensionate a max 2560 px, in JPEG, senza metadati (le
 *       foto da telefono contengono le coordinate GPS della casa);
 *     - rigenera public/og-image.jpg (1200x630) dalla copertina;
 *     - crea anteprime da 800 px in .new-site/anteprime, comode da guardare;
 *     - imposta il nome del progetto in package.json e wrangler.jsonc.
 *
 *   node scripts/new-site.mjs check
 *
 *     - cerca nel codice, nei contenuti e nella configurazione i residui
 *       dell'immobile del modello: un telefono o un'email dimenticati
 *       mandano gli ospiti di un sito a un altro host;
 *     - controlla CIN, prezzo, foto referenziate, og-image e coerenza dei
 *       nomi. Esce con codice 1 se c'è qualcosa da sistemare.
 *
 * Dipende da `sharp`, che arriva insieme a Next (come generate-icons.mjs).
 */
import sharp from "sharp";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const WORK_DIR = ".new-site";
const FINGERPRINTS = path.join(WORK_DIR, "impronte.json");
const PHOTOS = "public/photos";
const MAX_SIDE = 2560;
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) out[argv[i].slice(2)] = argv[i + 1];
  }
  return out;
}

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

/** Primo valore stringa di una chiave nel sorgente (`key: "valore"`). */
function field(source, key) {
  return source.match(new RegExp(`\\b${key}:\\s*\\n?\\s*"([^"]*)"`))?.[1] ?? "";
}

function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function captureFingerprints() {
  if (existsSync(FINGERPRINTS)) {
    // Rilanciare init dopo aver già riscritto i contenuti catturerebbe i
    // dati NUOVI come impronte: si tengono quelle della prima volta.
    console.log(`Impronte già presenti in ${FINGERPRINTS}: non le sovrascrivo.`);
    return;
  }
  const property = readFileSync("content/property.ts", "utf-8");
  const values = {
    nome: field(property, "name"),
    via: field(property, "street"),
    citta: field(property, "city"),
    indirizzo: field(property, "full"),
    telefono: field(property, "phone"),
    email: field(property, "email"),
    airbnb: field(property, "airbnbUrl"),
    booking: field(property, "bookingUrl"),
    progetto: JSON.parse(readFileSync("package.json", "utf-8")).name,
    dominio: readFileSync("next.config.ts", "utf-8").match(/CANONICAL_HOST\s*=\s*"([^"]+)"/)?.[1] ?? "",
  };
  // Il telefono si cerca anche senza spazi: nei link tel: compare così.
  if (values.telefono) values.telefonoCompatto = values.telefono.replace(/\s+/g, "");
  mkdirSync(WORK_DIR, { recursive: true });
  writeFileSync(FINGERPRINTS, `${JSON.stringify(values, null, 2)}\n`);
  console.log(`Impronte del modello salvate in ${FINGERPRINTS}.`);
}

async function init(opts) {
  const { foto, copertina, nome } = opts;
  if (!foto || !copertina || !nome) {
    fail("Uso: node scripts/new-site.mjs init --foto <cartella> --copertina <file> --nome <slug>");
  }
  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(nome)) {
    fail(`"${nome}" non va bene come nome: solo minuscole, cifre e trattini (es. villa-rossi).`);
  }
  if (!existsSync(foto) || !statSync(foto).isDirectory()) fail(`Cartella foto non trovata: ${foto}`);

  const files = readdirSync(foto).filter((f) => statSync(path.join(foto, f)).isFile());
  const images = files.filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));
  const skipped = files.filter((f) => !IMAGE_EXT.has(path.extname(f).toLowerCase()));
  const cover = images.find((f) => f === copertina || f === path.basename(copertina));
  if (!cover) fail(`La copertina "${copertina}" non è tra le foto utilizzabili di ${foto}.`);

  captureFingerprints();

  rmSync(PHOTOS, { recursive: true, force: true });
  mkdirSync(PHOTOS, { recursive: true });
  const previews = path.join(WORK_DIR, "anteprime");
  rmSync(previews, { recursive: true, force: true });
  mkdirSync(previews, { recursive: true });

  const used = new Set();
  const gallery = [];
  for (const file of [cover, ...images.filter((f) => f !== cover)]) {
    let base = file === cover ? "copertina" : slugify(path.parse(file).name) || "foto";
    for (let n = 2; used.has(base); n++) base = `${base.replace(/-\d+$/, "")}-${n}`;
    used.add(base);

    const src = path.join(foto, file);
    const out = path.join(PHOTOS, `${base}.jpg`);
    // rotate() senza argomenti applica l'orientamento EXIF; l'output non
    // conserva i metadati (sharp li scarta se non si chiede withMetadata).
    const info = await sharp(src)
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(out);
    await sharp(src)
      .rotate()
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toFile(path.join(previews, `${base}.jpg`));

    const kb = Math.round(statSync(out).size / 1024);
    const note = Math.max(info.width, info.height) < 2000 ? "  ← bassa risoluzione per un'immagine a piena larghezza" : "";
    console.log(`  ${file} → ${out} (${info.width}x${info.height}, ${kb} KB)${note}`);
    if (file !== cover) gallery.push({ src: `/photos/${base}.jpg`, width: info.width, height: info.height });
  }

  await sharp(path.join(foto, cover))
    .rotate()
    .resize({ width: 1200, height: 630, fit: "cover" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile("public/og-image.jpg");
  console.log(`  og-image: public/og-image.jpg (1200x630, ${Math.round(statSync("public/og-image.jpg").size / 1024)} KB)`);

  const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
  pkg.name = nome;
  writeFileSync("package.json", `${JSON.stringify(pkg, null, 2)}\n`);
  const wrangler = readFileSync("wrangler.jsonc", "utf-8");
  writeFileSync("wrangler.jsonc", wrangler.replace(/"name":\s*"[^"]*"/, `"name": "${nome}"`));
  console.log(`  nome progetto/Worker: ${nome}`);

  if (skipped.length) {
    console.log(`\nIgnorati (formato non supportato, es. HEIC: esportarli in JPEG): ${skipped.join(", ")}`);
  }
  console.log(`\nAnteprime da 800 px in ${previews}.`);
  console.log("\nPer content/property.ts:\n");
  console.log(`  heroImage: "/photos/copertina.jpg",`);
  // Larghezza e altezza servono al sito per rispettare il formato di ogni
  // foto e non ingrandirla oltre la sua risoluzione (vedi property.ts).
  const lines = gallery.map(({ src, width, height }) => `    { src: "${src}", width: ${width}, height: ${height} },`);
  console.log(`  gallery: [\n${lines.join("\n")}\n  ],`);
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return full.replace(/\\/g, "/").startsWith("content/data") ? [] : walk(full);
    return /\.(tsx?|mjs|js|json|jsonc|css|md|txt|example)$/.test(entry.name) ? [full] : [];
  });
}

async function check() {
  if (!existsSync(FINGERPRINTS)) fail(`Manca ${FINGERPRINTS}: va lanciato prima \`init\`.`);
  const prints = Object.entries(JSON.parse(readFileSync(FINGERPRINTS, "utf-8"))).filter(
    ([, value]) => value && value.length >= 4,
  );

  // I TEMPLATE-*.md citano il modello di proposito: raccontano da dove
  // viene il codice. Tutto il resto deve parlare del nuovo immobile.
  const files = [
    ...["app", "components", "lib", "content", "scripts"].flatMap(walk),
    ...[
      "next.config.ts",
      "wrangler.jsonc",
      "package.json",
      ".env.local.example",
      "README.md",
      "CLAUDE.md",
      "LEGALE.md",
      "SEO-PROMOZIONE.md",
    ].filter(existsSync),
  ].filter((f) => !/new-site\.mjs$/.test(f));

  const problems = [];
  for (const file of files) {
    const lines = readFileSync(file, "utf-8").split(/\r?\n/);
    lines.forEach((line, i) => {
      for (const [what, value] of prints) {
        if (line.toLowerCase().includes(value.toLowerCase())) {
          problems.push(`${file.replace(/\\/g, "/")}:${i + 1}  ${what} del modello ("${value}")`);
        }
      }
    });
  }

  const blocking = [];
  const warnings = [];
  const legal = readFileSync("content/legal.ts", "utf-8");
  const property = readFileSync("content/property.ts", "utf-8");
  if (!field(legal, "cin")) blocking.push("CIN vuoto in content/legal.ts: il sito non è pubblicabile (art. 13-ter DL 145/2023).");
  if (/pricePerNight:\s*0\b/.test(property)) blocking.push("pricePerNight è 0 in content/property.ts: il preventivo mostrerebbe un totale a zero.");
  if (/name:\s*"Vercel/.test(legal)) warnings.push("providers.hosting in content/legal.ts nomina ancora Vercel: su Cloudflare va \"Cloudflare, Inc.\".");
  if (/vercel\.app/.test(readFileSync("next.config.ts", "utf-8"))) warnings.push("next.config.ts contiene ancora un host *.vercel.app in ALIAS_HOSTS.");
  if (/email:\s*{\s*name:\s*""/.test(legal)) warnings.push("Fornitore SMTP (providers.email.name) vuoto in content/legal.ts: compare nell'informativa privacy.");

  const refs = [...property.matchAll(/"(\/photos\/[^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) if (!existsSync(path.join("public", ref))) blocking.push(`Foto referenziata ma assente: public${ref}`);
  if (existsSync("public/og-image.jpg")) {
    const { width, height } = await sharp("public/og-image.jpg").metadata();
    if (width !== 1200 || height !== 630) warnings.push(`public/og-image.jpg è ${width}x${height}, non 1200x630.`);
  } else {
    blocking.push("Manca public/og-image.jpg.");
  }
  const pkgName = JSON.parse(readFileSync("package.json", "utf-8")).name;
  const workerName = readFileSync("wrangler.jsonc", "utf-8").match(/"name":\s*"([^"]+)"/)?.[1];
  if (pkgName !== workerName) warnings.push(`Nome diverso tra package.json ("${pkgName}") e wrangler.jsonc ("${workerName}").`);

  const section = (title, items) => items.length && console.log(`\n${title}\n${items.map((p) => `  - ${p}`).join("\n")}`);
  section("Residui dell'immobile del modello:", problems);
  section("Bloccanti:", blocking);
  section("Da verificare:", warnings);

  if (problems.length || blocking.length) process.exit(1);
  console.log(warnings.length ? "\nNessun residuo né bloccante." : "\nTutto a posto.");
}

const [command, ...rest] = process.argv.slice(2);
if (command === "init") await init(args(rest));
else if (command === "check") await check();
else fail("Uso: node scripts/new-site.mjs init|check (vedi il commento in cima al file).");

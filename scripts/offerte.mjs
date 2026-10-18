/**
 * Invio delle offerte via email (al massimo tre l'anno) a chi l'ha scelto
 * alla fine del check-in. Si lancia dal PC, quando serve:
 *
 *   node scripts/offerte.mjs <file-offerta.txt>                 anteprima, non invia nulla
 *   node scripts/offerte.mjs <file-offerta.txt> --prova tu@x.it  invia solo a te, in ogni lingua
 *   node scripts/offerte.mjs <file-offerta.txt> --invia          invia a tutto l'elenco
 *
 * Opzioni: --db <nome> (database D1, se non è quello di wrangler.jsonc),
 * --locale (usa la copia del database di `next dev`, per provare lo
 * script), --forza (supera il limite di tre invii in dodici mesi: non farlo).
 *
 * Il file dell'offerta ha una sezione per lingua; la prima riga di ogni
 * sezione è l'oggetto, il resto è il testo. Saluto, firma e link per
 * disiscriversi li aggiunge lo script. Chi ha scelto una lingua che il
 * file non ha riceve l'inglese, o l'italiano.
 *
 *   --- it
 *   Primavera a Marostica: il 15% in meno fino a maggio
 *   Le colline sono in fiore e la piazza si prepara alla Partita a Scacchi...
 *
 *   --- en
 *   Spring in Marostica: 15% off until May
 *   ...
 *
 * Serve: wrangler collegato all'account Cloudflare del sito
 * (`npx wrangler login`) e i dati SMTP in .env.local (gli stessi del sito).
 * Prima di ogni invio vero cancella gli iscritti con l'ultimo soggiorno
 * più vecchio di 24 mesi: è il limite promesso nell'informativa privacy.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import nodemailer from "nodemailer";

const MAX_PER_YEAR = 3;
const PAUSE_MS = 1200;

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith("--") && argv[argv.indexOf(a) - 1] !== "--prova" && argv[argv.indexOf(a) - 1] !== "--db");
const option = (name) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : undefined);
const testTo = option("prova");
const sendAll = argv.includes("--invia");
if (!file || !existsSync(file)) fail("Uso: node scripts/offerte.mjs <file-offerta.txt> [--prova tua@email] [--invia]");

// ── Configurazione del sito ──
function readEnv() {
  const env = { ...process.env };
  if (existsSync(".env.local")) {
    for (const line of readFileSync(".env.local", "utf-8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}
const env = readEnv();
const property = readFileSync("content/property.ts", "utf-8");
const propertyName = property.match(/\bname:\s*"([^"]+)"/)?.[1] ?? "";
const host = readFileSync("next.config.ts", "utf-8").match(/CANONICAL_HOST\s*=\s*"([^"]+)"/)?.[1];
const siteUrl = (env.NEXT_PUBLIC_SITE_URL?.trim() || `https://${host}`).replace(/\/+$/, "");
const dbName =
  option("db") ?? readFileSync("wrangler.jsonc", "utf-8").match(/"database_name":\s*"([^"]+)"/)?.[1];
if (!dbName) fail("Nome del database non trovato: passalo con --db <nome> (lo vedi in Cloudflare → D1).");

// ── Testo dell'offerta ──
const sections = {};
for (const block of readFileSync(file, "utf-8").split(/^---\s*/m).filter((b) => b.trim())) {
  const [langLine, subject, ...rest] = block.split(/\r?\n/);
  const lang = langLine.trim();
  if (!["it", "en", "de"].includes(lang)) fail(`Sezione "--- ${lang}" non riconosciuta: usa it, en o de.`);
  if (!subject?.trim()) fail(`Manca l'oggetto nella sezione "${lang}".`);
  sections[lang] = { subject: subject.trim(), text: rest.join("\n").trim() };
}
if (!Object.keys(sections).length) fail("Il file non ha sezioni: comincia con una riga '--- it'.");

const frame = {
  it: {
    hello: (n) => `Ciao ${n},`,
    why: `Ricevi questa email perché, facendo il check-in a ${propertyName}, hai scelto di ricevere le nostre offerte (al massimo tre l'anno).`,
    stop: "Per non riceverne più",
  },
  en: {
    hello: (n) => `Hi ${n},`,
    why: `You are receiving this email because you chose to receive our offers when checking in at ${propertyName} (at most three a year).`,
    stop: "To stop receiving them",
  },
  de: {
    hello: (n) => `Guten Tag ${n},`,
    why: `Sie erhalten diese E-Mail, weil Sie beim Check-in in ${propertyName} unsere Angebote gewählt haben (höchstens drei im Jahr).`,
    stop: "Abmelden",
  },
};

function compose({ name, locale, token }) {
  const lang = sections[locale] ? locale : sections.en ? "en" : sections.it ? "it" : Object.keys(sections)[0];
  const f = frame[lang];
  const page = `${siteUrl}/offerte/disiscrizione?t=${token}`;
  return {
    subject: sections[lang].subject,
    text: [f.hello(name), "", sections[lang].text, "", propertyName, "", "—", f.why, `${f.stop}: ${page}`].join("\n"),
    headers: {
      // Clic unico dei programmi di posta (RFC 8058): Gmail e Yahoo lo
      // mostrano accanto al mittente.
      "List-Unsubscribe": `<${siteUrl}/api/newsletter/unsubscribe?t=${token}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

// ── Database (via wrangler, sul database remoto) ──
// wrangler lanciato con node e un elenco di argomenti, senza shell: il
// testo della query (con l'oggetto dell'offerta) non passa mai da cmd.exe.
function d1(sql) {
  const out = execFileSync(
    process.execPath,
    ["node_modules/wrangler/bin/wrangler.js", "d1", "execute", dbName, argv.includes("--locale") ? "--local" : "--remote", "--json", "--command", sql],
    { encoding: "utf-8", stdio: ["ignore", "pipe", "inherit"] },
  );
  return JSON.parse(out);
}

const ACTIVE = "last_stay >= date('now', '-24 months')";
let subscribers;
try {
  const [result] = d1(`SELECT email, name, locale, token FROM subscribers WHERE ${ACTIVE} ORDER BY locale`);
  subscribers = result.results;
} catch (error) {
  if (String(error.message).includes("no such table")) subscribers = [];
  else fail(`Lettura del database non riuscita. Hai fatto \`npx wrangler login\` con l'account del sito?\n${error.message}`);
}

const byLang = subscribers.reduce((acc, s) => ({ ...acc, [s.locale]: (acc[s.locale] ?? 0) + 1 }), {});
console.log(`\nIscritti attivi: ${subscribers.length}`, byLang);
console.log(`Lingue nel file: ${Object.keys(sections).join(", ")}\n`);

// ── SMTP ──
function transport() {
  const port = Number(env.SMTP_PORT?.trim() || 587);
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) fail("Dati SMTP mancanti in .env.local.");
  return nodemailer.createTransport({
    host: env.SMTP_HOST.trim(),
    port,
    secure: port === 465,
    auth: { user: env.SMTP_USER.trim(), pass: env.SMTP_PASSWORD },
  });
}
const from = env.MAIL_FROM?.trim() || env.SMTP_USER?.trim();
const pause = () => new Promise((r) => setTimeout(r, PAUSE_MS));

if (testTo) {
  const mailer = transport();
  for (const lang of Object.keys(sections)) {
    const mail = compose({ name: "Mario", locale: lang, token: "0".repeat(32) });
    await mailer.sendMail({ from, to: testTo, ...mail, subject: `[PROVA ${lang}] ${mail.subject}` });
    console.log(`Prova in ${lang} inviata a ${testTo}.`);
  }
  process.exit(0);
}

if (!sendAll) {
  const sample = compose({ name: "Mario", locale: Object.keys(sections)[0], token: "<token>" });
  console.log(`Oggetto: ${sample.subject}\n\n${sample.text}\n`);
  console.log("Anteprima soltanto. Mandala prima a te con --prova tua@email, poi a tutti con --invia.");
  process.exit(0);
}

// ── Invio vero ──
const [recent] = d1(
  "CREATE TABLE IF NOT EXISTS campaigns (sent_at TEXT NOT NULL, subject TEXT NOT NULL, recipients INTEGER NOT NULL); SELECT COUNT(*) AS n FROM campaigns WHERE sent_at >= date('now', '-12 months')",
).slice(-1);
const sentThisYear = recent.results[0]?.n ?? 0;
if (sentThisYear >= MAX_PER_YEAR && !argv.includes("--forza")) {
  fail(`Negli ultimi dodici mesi sono già partiti ${sentThisYear} invii: l'informativa promette al massimo ${MAX_PER_YEAR} email l'anno.`);
}
d1(`DELETE FROM subscribers WHERE NOT (${ACTIVE})`);

const mailer = transport();
let sent = 0;
for (const subscriber of subscribers) {
  try {
    await mailer.sendMail({ from, to: subscriber.email, ...compose(subscriber) });
    sent++;
    process.stdout.write(`\rInviate ${sent}/${subscribers.length}`);
  } catch (error) {
    console.error(`\nNon inviata a ${subscriber.email}: ${error.message}`);
  }
  await pause();
}
const subject = (sections.it ?? Object.values(sections)[0]).subject.replaceAll("'", "''").replace(/s+/g, " ");
d1(`INSERT INTO campaigns (sent_at, subject, recipients) VALUES (datetime('now'), '${subject}', ${sent})`);
console.log(`\n\nFatto: ${sent} email inviate su ${subscribers.length}.`);

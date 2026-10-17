# Campo Marzio 47 — sito per affitto breve

Sito Next.js per la presentazione di un immobile in affitto breve
(Marostica, VI), con check-in online e prenotazione diretta a pagamento.
Progettato per essere anche un **modello riusabile** per altri host: vedi
"Riuso come modello" in fondo a questo file.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + React 19.
Campo Marzio 47 è su Vercel, con auto-deploy da GitHub (repo
`campomarzio47/campomarzio47`, branch `main`). Lo stesso codice si
pubblica anche su **Cloudflare Workers** tramite l'adapter OpenNext: è la
piattaforma dei nuovi siti creati dal modello (vedi "Hosting su
Cloudflare"). Nessun database, nessun ORM.

Comandi: `npm run dev`, `npm run build`, `npm run lint`; `npm run preview`
(build OpenNext + anteprima sul runtime Workers, porta 8787). Nessuna
suite di test.

`npm run lint` riporta migliaia di problemi provenienti da
`.claude/worktrees/`, un vecchio worktree con dentro il proprio `.next`:
è rumore preesistente, non codice del progetto. Guardare solo i file
sotto `app/`, `components/`, `lib/`, `content/`.

## Design

- Font: **Cormorant Garamond** (`font-display`, titoli) + **DM Sans**
  (`font-sans`, corpo), caricati via `next/font/google` in
  `app/layout.tsx`.
- Palette (CSS variables in `app/globals.css`, esposte a Tailwind v4 via
  `@theme inline`):
  - `--color-off-white: #f7f5f2` — sfondo
  - `--color-bordeaux: #8b2635` / `--color-bordeaux-dark: #6e1e2a` —
    accento primario (CTA, link attivi)
  - `--color-charcoal: #1e1e1e` — testo
  - `--color-mid: #6b6560` — testo secondario
  - `--color-beam: #d4c5b0` — accento secondario
  - `--color-divider: #e2ddd8` — bordi/separatori
- Icone del sito: `app/favicon.ico` (16/32/48), `app/icon.png` (512) e
  `app/apple-icon.png` (180) — marchio "47" off-white su bordeaux, coerente
  con l'accento del logo in sidebar. Sono generati da
  `scripts/generate-icons.mjs` (da lanciare a mano, gli asset sono
  committati); Next emette i `<link>` da solo in base al nome dei file,
  `layout.tsx` non c'entra. Alle dimensioni piccole il marchio usa il serif
  **in grassetto**: a 16 px il peso normale si sfalda nell'antialiasing.
- Layout: sidebar fissa a sinistra su desktop (`components/Sidebar.tsx`),
  drawer su mobile, bottone check-in flottante (`CheckInFab`). Pagine
  brevi, niente scroll infinito — è una scelta esplicita del progetto,
  non solo un dettaglio estetico.
- Nav della sidebar: solo 4 voci, tutte allo stesso livello (nessun
  bottone speciale) — La Casa, Prenota ora, Check-in online, Contatti.
  Foto/Servizi/Recensioni non sono più voci di nav (vedi sotto: sono
  ancore dentro la home, raggiungibili solo scorrendo o da link diretto
  `/#foto` ecc., non dalla sidebar).
- Home (`app/page.tsx` + `components/Hero.tsx`): hero minimale, solo foto
  a piena larghezza + nome della proprietà — niente facts (mq/camere/
  ospiti) né bottoni nell'hero. `hero.tagline`/`hero.description`
  vivono subito sotto, in una sezione a parte. La CTA di prenotazione è
  `components/AvailabilityBar.tsx`: barra fissa in fondo pagina, **solo
  nella home** (non nelle altre pagine), con selezione Arrivo/Partenza
  che porta a `/prenota?from=...&to=...` (BookingForm legge questi query
  param per precompilare il calendario). Su desktop è affiancata alla
  sidebar (`md:left-64`); su mobile è un bottone full-width fisso in
  basso che apre un pannello con il calendario — per questo `CheckInFab`
  si nasconde in home su mobile (altrimenti si sovrapporrebbero).
- Foto, Servizi e Recensioni **non sono più pagine separate**: sono
  sezioni della home (`id="foto"`/`"servizi"`/`"recensioni"` in
  `app/page.tsx`), con `components/PhotoCarousel.tsx` (scroll
  orizzontale nativo con snap + `Lightbox.tsx` riusato per l'ingrandimento
  — niente libreria di carousel esterna), `components/Amenities.tsx`
  (griglia compatta 4 colonne, pensata per stare senza troppo scroll) e
  `components/ReviewsSection.tsx` (invariato). Le vecchie route
  `/foto`, `/servizi`, `/recensioni` restano come redirect verso le
  rispettive ancore (`permanentRedirect("/#foto")` ecc., 308) per non rompere link
  salvati, ma non compaiono più nella sidebar.
- Micro-interazioni (tutte in `app/globals.css`, rispettano
  `prefers-reduced-motion`): `.animate-kenburns` (zoom lentissimo sulla
  foto hero), `components/Reveal.tsx` + `.reveal`/`.reveal-visible`
  (fade+slide-up all'ingresso in viewport via IntersectionObserver,
  usato per le sezioni della home), `.animate-pop-in`/`.animate-sheet-in`/
  `.animate-fade-in` (popover, pannello mobile, lightbox). Il calendario
  (`react-day-picker`) è restilizzato in stile minimalista via le CSS
  custom property della libreria sotto `.rdp-root` — eredita
  automaticamente la palette del sito.
  **Attenzione ai `transform` su antenati di elementi `fixed`**: un
  antenato con `transform` (anche `.reveal`) ridefinisce il contenitore
  di riferimento per `position: fixed` nei discendenti. `Lightbox.tsx`
  ci è cascato (era annidato dentro `Reveal`) ed è per questo che si
  monta con `createPortal` su `document.body` invece che nell'albero
  normale — pattern da riusare per qualunque futuro overlay/modale
  potenzialmente annidato in un `Reveal`.

### Accessibilità

Il sito rientra nell'esenzione per microimprese del D.Lgs. 82/2022: non è
un obbligo di legge, ma i difetti che sono stati corretti escludevano
persone davvero. Cose da non rompere:

- `components/PlaceAutocomplete.tsx` implementa il pattern ARIA combobox
  (`aria-activedescendant`, frecce/Invio/Esc). Le opzioni sono `<li
  role="option">` e **non** bottoni focusabili: col pattern combobox il
  focus resta sull'input. Erano bottoni, e il `blur` chiudeva la lista
  prima che il Tab potesse raggiungerli — il check-in, cioè la funzione
  principale del sito, era impossibile da completare senza mouse.
- `Lightbox`, drawer della `Sidebar` e pannello date di `AvailabilityBar`
  sono finestre modali: `role="dialog"`, Esc, trappola del focus e focus
  restituito all'elemento di partenza. Se aggiungi un overlay, seguili.
- `LocaleProvider` aggiorna `document.documentElement.lang` a ogni cambio
  lingua: l'HTML iniziale arriva dal cookie, ma il cambio è solo client.
- Ogni campo ha un'etichetta associata: i placeholder non danno un nome
  accessibile e spariscono appena si digita.
- `.rdp-busy` (date occupate) **deroga alla scelta di design** "attenuate
  invece che barrate": con opacità 0.4 il contrasto era circa 2:1 e la
  sola differenza di tono affidava l'informazione al solo colore. Ora
  0.85 più una riga. Se si torna a barrarle di meno, serve un altro
  segnale non cromatico.

## Contenuti e i18n

- `content/property.ts` — unico posto per i fatti dell'immobile (nome,
  indirizzo, host, superficie/ospiti/camere, URL Airbnb/Booking,
  recensioni, foto, `pricing`). È il file da modificare per primo per
  qualsiasi cambio di contenuto "dati".
- `content/dictionaries.ts` — tutte le stringhe UI, tipizzate
  (`Dictionary`), con oggetti paralleli `it`/`en`. Contiene sia UI
  generica sia alcuni testi discorsivi specifici della proprietà (vedi
  `TEMPLATE-SETUP.md` per l'elenco esatto). La sezione `a11y` raccoglie
  le stringhe che vedono solo screen reader e tastiera: vanno tradotte
  come le altre, non lasciate in italiano fisso nei componenti.
- `content/legal.ts` e `content/legal-texts.ts` — dati e testi legali,
  vedi la sezione "Pagine legali e conformità".
- i18n **cookie-based**, non URL-based: nessuna route `/it/`, `/en/`.
  `lib/locale.ts` (`Locale`, `LOCALE_COOKIE`, `defaultLocale="it"`),
  `components/LocaleProvider.tsx` espone `useLocale() -> {locale, dict,
  setLocale}`. Il cookie viene letto server-side solo in
  `app/layout.tsx` (per l'HTML iniziale) e in eventuali API route che
  devono personalizzare un'email nella lingua del cliente (es.
  `app/api/booking/create/route.ts`).
- `components/PageHeader.tsx` è generico: accetta un `section` che deve
  essere una chiave di `Dictionary` con forma `{title, subtitle?}` — le
  nuove pagine che vogliono riusarlo devono seguire questa forma.
- Dati di riferimento ISTAT (comuni/stati) in `content/data/*.json`,
  esposti da `lib/reference-data.ts`.

## Funzionalità principali

- `/check-in` — check-in ospiti. Genera e invia via email all'host **tre**
  allegati, che coprono due adempimenti distinti su due portali diversi:
  - `lib/ross1000.ts` — XML di movimentazione turistica (statistica) per
    il portale Ross1000/GIES. Tracciato confermato contro il manuale
    ufficiale GIES. **Specifico per il Veneto**: non riusare per altre
    regioni senza verificare il tracciato locale.
  - `lib/alloggiati.ts` — file `.txt` a larghezza fissa (168 caratteri per
    riga) per Alloggiati Web (pubblica sicurezza, Questura). Tracciato
    confermato contro il manuale ufficiale della Polizia di Stato.
    **Lo generiamo noi di proposito**: la funzione "Genera file questura"
    di Ross1000 esiste solo per chi inserisce gli ospiti a mano nel
    portale, e il tracciato XML di movimentazione non ha nemmeno i campi
    del documento d'identità, quindi da lì il file non sarebbe
    ricostruibile. Non rimuoverlo pensando che Ross1000 lo produca.
  - `lib/checkin-pdf.ts` — PDF riepilogo leggibile.

  **`<idswh>` nell'XML Ross1000 deve restare invariato** per lo stesso
  check-in (lo impone il manuale GIES: è la chiave con cui il portale
  riconosce un ospite già comunicato). È derivato con un hash dai dati
  anagrafici + data di arrivo, quindi ri-generare lo stesso check-in
  produce lo stesso identificativo. Non tornare mai a un valore casuale:
  ogni ri-caricamento creerebbe ospiti nuovi invece di aggiornare quelli
  esistenti, gonfiando le presenze sul portale.
- `/prenota` — **richiesta** di prenotazione diretta, vedi sotto. Usa il
  feed iCal Airbnb/Booking (`lib/ical.ts`, `lib/hooks/useBusyRanges.ts`)
  solo per disabilitare le date già occupate nel calendario — non esiste
  più una pagina "Disponibilità" a sé stante (rimossa: poco usata e
  duplicava `/prenota`).
- `/contatti` — form di contatto (`app/api/contatti`).
- `/privacy`, `/cookie-policy`, `/termini` — pagine legali, vedi sotto.

## Prenotazione diretta: richiesta via email, nessun pagamento

**Stripe è stato rimosso** (settembre 2026). In due anni non è mai
arrivata una prenotazione diretta dal sito, che di fatto è usato dagli
ospiti già in arrivo per il check-in: il pagamento online portava con sé
obblighi (PSD2, rimborsi, contestazioni) che quel volume non giustifica.
Non reintrodurlo senza una ragione nuova — e, se lo fai, rileggi prima
`/termini`, che oggi dichiara esplicitamente che il sito non raccoglie
dati di pagamento.

Resta la scelta deliberata di **non avere un database**: la richiesta
viene inoltrata via email e non è archiviata da nessuna parte.

- `POST /api/booking/create` valida (date, preavviso, notti minime,
  sovrapposizione con l'iCal) e chiama `sendBookingRequestEmails`
  (`lib/booking-notifications.ts`): email all'host con `replyTo`
  dell'ospite, più una presa in carico all'ospite nella sua lingua.
- Le email dicono a chiare lettere che **la richiesta non è una
  prenotazione** finché l'host non conferma per iscritto. Non è una
  formalità: senza pagamento né calendario condiviso, l'unica difesa
  contro il doppio impegno è che l'ospite non dia per scontato nulla.
- Il calendario di `/prenota` mostra occupate solo le date bloccate su
  Airbnb/Booking (iCal) — non le altre richieste dirette in attesa di
  conferma. Compromesso consapevole, non un bug.
- `property.pricing.minAdvanceDays` (default 2, in `content/property.ts`)
  blocca sempre come "occupati" oggi e i giorni successivi fino a quel
  numero, sia sul calendario sia lato server in `/api/booking/create`
  (`lib/pricing.ts`, `earliestCheckinIso`/`leadTimeBusyRange`) —
  necessario perché Booking.com non riporta nel proprio export iCal il
  preavviso minimo impostato sulla piattaforma, solo le prenotazioni
  vere e proprie.
## Pagine legali e conformità

Non sono contenuto decorativo: rispondono a obblighi precisi, e chi le
modifica dovrebbe sapere quale.

- `content/legal.ts` — identità dell'impresa, **CIN/CIR**, condizioni di
  pagamento, imposta di soggiorno, fornitori. I campi vuoti vengono
  **omessi**, mai mostrati come segnaposto: il sito sembra a posto anche
  quando non lo è, ed è per questo che esiste `LEGALE.md`.
- `content/legal-texts.ts` — prosa di privacy, cookie e termini (it/en),
  resa da `components/LegalPage.tsx`. Sta fuori da `dictionaries.ts`, che
  resta per le stringhe di UI. I valori variabili sono interpolati da
  `legal.ts`, **incluso il nome del cookie** letto da `lib/locale.ts`:
  una cookie policy che nomina un cookie diverso da quello reale è essa
  stessa un'informazione falsa.
- `components/Footer.tsx` — su ogni pagina. Il **CIN va indicato in ogni
  annuncio ovunque pubblicato**, sito diretto compreso (art. 13-ter DL
  145/2023, sanzione 500-5.000 €): non spostarlo in una pagina sola.
- **Niente Google Analytics, niente banner cookie.** GA era l'unico terzo
  a scrivere cookie; rimosso lui, resta il solo cookie tecnico della
  lingua, esente da consenso. Reintrodurre GA significa reintrodurre un
  banner che lo blocchi *prima* del consenso e riscrivere la cookie
  policy: non è una variabile d'ambiente in più.
- **Nessun riferimento alla piattaforma ODR europea**: dismessa il 20
  luglio 2025, obbligo di link decaduto. Quasi tutti i template italiani
  la citano ancora.
- `components/PrivacyAck.tsx` — presa visione, **non consenso**. Per il
  check-in la base giuridica è l'obbligo di legge (art. 6.1.c GDPR), per
  gli altri moduli le misure precontrattuali (6.1.b): chiedere un
  "consenso" implicherebbe un diritto di revoca che non esiste.

### Email

`lib/mailer.ts`: `sendMail({subject, text, to?, replyTo?, attachments?})`
via nodemailer su **SMTP generico** (`SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/
`SMTP_PASSWORD`/`MAIL_FROM`). `to` è opzionale, default `HOST_EMAIL`. Solo
testo semplice (niente HTML) per coerenza con lo stile esistente.

Non era Gmail per caso ed è stato cambiato di proposito: le email portano
dati personali fino agli estremi di un documento d'identità, e chi li
trasporta dev'essere un responsabile del trattamento con accordo art. 28
GDPR — che un account Gmail gratuito non ha. Non tornare a
`service: "gmail"`.

Due conseguenze nel corpo delle email, da non "semplificare":
- l'email di check-in **non ripete i dati personali** già presenti negli
  allegati (minimizzazione, art. 5.1.c GDPR) e ricorda di cancellarla
  dopo il caricamento sui portali;
- gli errori SMTP finiscono nei log, **mai nella risposta al client**:
  possono contenere host, utenza e motivo del rifiuto.

`lib/checkin-attachments.ts` può impacchettare i tre allegati in un unico
ZIP AES-256 se `CHECKIN_ZIP_PASSWORD` è impostata (spento di default: lo
ZIP AES non si apre col doppio clic su Windows, serve 7-Zip).
**Richiede `archiver` 7.x**: la 8 è ESM pura e ha rimosso
`registerFormat`, su cui si appoggia `archiver-zip-encrypted`. Aggiornare
archiver rompe la cifratura a runtime, non in compilazione.

## Variabili d'ambiente

Vedi `.env.local.example` per l'elenco completo e commentato. `.env.local`
è **sempre** ignorato da git (`.gitignore`: `.env*`, con eccezione solo
per `.env.local.example`) — mai committare segreti reali.

Punti da ricordare:
- Un copia-incolla nella dashboard Vercel può includere uno spazio o un
  a-capo finale invisibile, che rompe le richieste costruite con quel
  valore. Per questo `lib/mailer.ts` fa `.trim()` su host, porta, utenza
  e mittente: vale la pena tenerlo a mente per qualunque altro env var
  futuro usato per costruire richieste di rete.
- `HOST_EMAIL` non è un dettaglio operativo: è la casella che riceve i
  documenti d'identità degli ospiti. Vedi `LEGALE.md` §5.1.
- **Il piano Hobby di Vercel vieta l'uso commerciale** e la loro
  definizione include «pubblicizzare un prodotto o servizio a pagamento»:
  togliere Stripe ha ridotto il rischio, non l'ha eliminato. Punto aperto
  documentato in `LEGALE.md` §6; Cloudflare non ha questo limite.

## Hosting su Cloudflare

Configurazione: `wrangler.jsonc`, `open-next.config.ts`,
`public/_headers` (Vercel li ignora). Collaudata sul runtime Workers con
build, pagine, `next/image` (binding `IMAGES`), iCal, check-in con i tre
allegati, ZIP AES e SMTP TLS verso Brevo/Mailjet (465 e 587). Cose da
sapere:

- **Next e `@opennextjs/cloudflare` sono fissati a versioni esatte e si
  aggiornano insieme**: ogni versione dell'adapter dichiara le versioni di
  Next che accetta (peer dependency), e npm rifiuta l'installazione se non
  combaciano. Le Next 16.0–16.3.7 hanno advisory critici: non scendere
  sotto la 16.3.8.
- **I file `.env` finiscono nel Worker**: OpenNext ne copia i valori nel
  bundle come ripiego per le variabili mancanti. Il deploy si fa da
  GitHub (Workers Builds), dove quei file non esistono;
  `scripts/cf-deploy-guard.mjs` blocca `npm run deploy` dal PC se trova
  valori non `NEXT_PUBLIC_*`. Anche `.open-next/` contiene quei valori in
  chiaro: è gitignorata, ma va cancellata dopo le prove.
- **Niente `export const revalidate`**: la cache configurata è di sola
  lettura (nessuna risorsa R2/KV/D1 da creare per sito), quindi una route
  con revalidate resterebbe congelata alla build. `/api/availability` è
  `force-dynamic` per questo.
- **Piano Free: 10 ms di CPU per richiesta.** Le pagine renderizzate dal
  server e il check-in (PDF + XML + ZIP) rischiano l'errore 1102: per i
  siti veri si consiglia Workers Paid.
- Il nome in `wrangler.jsonc` deve coincidere con quello del Worker
  collegato al repo, o la build di Workers Builds fallisce. `keep_vars`
  evita che un deploy cancelli le variabili impostate in dashboard.
- OpenNext su Windows avvisa di non essere supportato: per le prove in
  locale funziona, le build di produzione le fa Workers Builds su Linux.
- Per provare le email senza SMTP vero: `scripts/smtp-sink.mjs` salva i
  messaggi come `.eml`, e un `.env.production.local` temporaneo, che vince
  su `.env.local`, ci punta (`TEMPLATE-SETUP.md` §8).

## SEO

- `lib/seo.ts` è l'unico posto dove vive `siteUrl` (lo importano
  `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`) e dove si
  costruiscono i metadati delle pagine interne con `pageMetadata()`.
- **Il dominio ufficiale è `campomarzio47.it`** (apex, senza www) e deve
  combaciare in tre posti: `NEXT_PUBLIC_SITE_URL` nelle env var di
  Vercel, `CANONICAL_HOST` in `next.config.ts` (da cui nascono i redirect
  308 dagli host elencati in `ALIAS_HOSTS`, oggi
  `campomarzio47.vercel.app`) e il dominio primario impostato su
  Vercel. Se divergono, il sito funziona lo stesso ma dichiara col
  canonical un indirizzo diverso da quello che serve le pagine, e Google
  indicizza quello sbagliato: è già successo con il sottodominio
  `.vercel.app`. Il redirect in `next.config.ts` fa match sull'host
  **esatto** di produzione, non su tutto `*.vercel.app`, per non rompere
  le anteprime dei branch.
- `NEXT_PUBLIC_SITE_URL` è letta a **build time**: cambiarla su Vercel
  senza rifare il deploy non ha alcun effetto.
- **I metadati in Next si ereditano**: il layout dichiara
  `alternates: { canonical: "/" }`, quindi una pagina che imposta solo
  `title` eredita il canonical della home e si autodichiara un duplicato
  — Google la esclude dall'indice. Ogni pagina indicizzabile deve quindi
  usare `pageMetadata(key, path)`, mai un `metadata` scritto a mano con
  il solo titolo. Stessa cosa per la `description`: senza override, tutte
  le pagine condividono quella della home.
- Aggiungendo una pagina indicizzabile: description in
  `dictionaries.meta.pages` (it + en, max ~160 caratteri), metadati via
  `pageMetadata()`, route in `app/sitemap.ts`.
- Le vecchie route `/foto`, `/servizi`, `/recensioni` usano
  `permanentRedirect` (308, non 307): sono redirect definitivi e il 307
  lascerebbe il vecchio URL nell'indice.
- `public/og-image.jpg` è 1200x630 e va tenuta leggera. Non puntare
  l'Open Graph alla foto di copertina originale: i crawler social
  scaricano il file grezzo senza passare da `next/image` e oltre ~5 MB
  rinunciano all'anteprima. Le foto in `public/photos/` vanno
  ridimensionate (max ~2560px) prima del commit; gli originali stanno in
  `foto_campomarzio/`, gitignorata.
- Niente `AggregateRating`/`Review` nei dati strutturati: le recensioni
  vengono da Airbnb/Booking e marcarle come proprie ricade nelle
  recensioni auto-referenziali vietate da Google per le strutture
  ricettive.
- `SEO-PROMOZIONE.md` — la parte non tecnica (Search Console, Google
  Business Profile, link locali, aspettative sui tempi). È il documento
  da dare all'host: il codice da solo non fa comparire un sito nuovo su
  Google.

## Gotcha di framework

- Next.js 16 App Router: `params`/`searchParams` nelle pagine sono
  `Promise` — vanno sempre `await`ati.
- `react-day-picker` v10, modalità `mode="range"`: serve
  `excludeDisabled` per impedire che un intervallo selezionato scavalchi
  una data disabilitata/occupata.

## Riuso come modello

Il progetto è pensato per essere clonato per altri host/immobili senza
toccare il codice, solo `content/`:
- **skill `/nuovo-sito`** (`~/.claude/skills/nuovo-sito/SKILL.md`, fuori
  dal repo) — dalle foto e dalle informazioni del cliente al sito
  pubblicato su Cloudflare. È un rimando a `TEMPLATE-NUOVO-SITO.md`.
- `TEMPLATE-NUOVO-SITO.md` — la procedura completa, fase per fase, con le
  regole (una sola tornata di domande, mai dati inventati, niente azioni
  esterne senza un sì).
- `TEMPLATE-BRIEF.md` — questionario da far compilare a un nuovo cliente.
- `TEMPLATE-SETUP.md` — passaggi tecnici per adattare il codice a un
  brief compilato.
- `LEGALE.md` — cosa il cliente deve compilare e decidere perché il sito
  sia in regola, e cosa resta in capo a lui e non al codice.
- `scripts/new-site.mjs` — `init` (foto, og-image, nomi, impronte del
  modello) e `check` (residui di Campo Marzio 47, CIN, foto mancanti).
  `scripts/smtp-sink.mjs` — SMTP finto per collaudare le email.

Il modello deve reggere anche gli immobili senza recensioni o presenti su
una sola piattaforma: `reviews: []` nasconde la sezione (il tipo `Review`
esplicito in `property.ts` serve proprio a far compilare l'elenco vuoto),
un URL Airbnb/Booking vuoto toglie il link.

**Regola permanente**: ogni volta che si aggiunge una funzionalità o si
introduce una nuova variabile/passaggio di setup, aggiornare anche questi
file, non solo il codice — `TEMPLATE-NUOVO-SITO.md` compreso, che è ciò
che la skill esegue. Un nuovo sito copia l'ultimo **commit** di `main`
(`git archive`): le modifiche non committate qui non arrivano. Per un nuovo immobile, `LEGALE.md` va rifatto
da capo: CIN, P.IVA e condizioni di soggiorno sono diversi per ciascuno,
e un CIN sbagliato è peggio di un CIN assente.

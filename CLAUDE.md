# Campo Marzio 47 — sito per affitto breve

Sito Next.js per la presentazione di un immobile in affitto breve
(Marostica, VI), con check-in online e prenotazione diretta a pagamento.
Progettato per essere anche un **modello riusabile** per altri host: vedi
"Riuso come modello" in fondo a questo file.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + React 19.
Deploy su Vercel, auto-deploy da GitHub (repo `campomarzio47/campomarzio47`,
branch `main`). Nessun database, nessun ORM.

Comandi: `npm run dev`, `npm run build`, `npm run lint`. Nessuna suite di
test.

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
  rispettive ancore (`redirect("/#foto")` ecc.) per non rompere link
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

## Contenuti e i18n

- `content/property.ts` — unico posto per i fatti dell'immobile (nome,
  indirizzo, host, superficie/ospiti/camere, URL Airbnb/Booking,
  recensioni, foto, `pricing`). È il file da modificare per primo per
  qualsiasi cambio di contenuto "dati".
- `content/dictionaries.ts` — tutte le stringhe UI, tipizzate
  (`Dictionary`), con oggetti paralleli `it`/`en`. Contiene sia UI
  generica sia alcuni testi discorsivi specifici della proprietà (vedi
  `TEMPLATE-SETUP.md` per l'elenco esatto).
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

- `/check-in` — check-in ospiti, genera XML Ross1000/GIES
  (`lib/ross1000.ts`, tracciato ufficiale Regione Veneto, confermato
  contro il manuale tecnico ufficiale) + PDF riepilogo
  (`lib/checkin-pdf.ts`), inviati via email all'host.
  **`lib/ross1000.ts` è specifico per il Veneto**: non riusare per altre
  regioni senza verificare il tracciato ufficiale locale.
- `/prenota` — prenotazione diretta **a pagamento**, vedi sotto. Usa il
  feed iCal Airbnb/Booking (`lib/ical.ts`, `lib/hooks/useBusyRanges.ts`)
  solo per disabilitare le date già occupate nel calendario — non esiste
  più una pagina "Disponibilità" a sé stante né un form di richiesta
  senza pagamento (rimossi: erano poco usati e duplicavano `/prenota`).
- `/contatti` — form di contatto (`app/api/contatti`).

## Prenotazione diretta con pagamento (Stripe, senza database)

Scelta architetturale deliberata: **nessun database**. L'host conferma o
rifiuta ogni prenotazione a mano (Stripe Checkout con
`capture_method: "manual"` — la carta viene solo autorizzata, l'addebito
avviene solo alla conferma), quindi è l'host stesso a evitare il doppio
addebito; un database sarebbe servito solo a mostrare come "occupate" sul
calendario le richieste dirette non ancora confermate, ritenuto non
necessario al volume atteso (1-2 prenotazioni dirette/mese).

- I dati della prenotazione vivono **solo** nei metadata del
  `PaymentIntent` Stripe (`lib/booking-metadata.ts`) — Stripe è l'unico
  "archivio".
- I link email di conferma/rifiuto per l'host sono **firmati (HMAC)**,
  non basati su sessione/login (`lib/booking-tokens.ts`,
  `BOOKING_TOKEN_SECRET`). Pagina di destinazione
  `/host/prenotazioni/azione` (GET, senza effetti collaterali) con due
  form POST (`/api/host/bookings/confirm`, `.../decline`).
  **Mai** rendere l'azione (cattura/annullamento pagamento) eseguibile
  da una richiesta GET diretta: gli scanner email (es. Outlook Safe
  Links) prefetchano i link nelle email.
- Webhook Stripe (`app/api/stripe/webhook/route.ts`) ascolta **solo**
  `checkout.session.completed`.
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
- Dettaglio completo del piano architetturale in
  `C:\Users\fv28\.claude\plans\stateful-prancing-hamming.md` se serve
  ricostruire il ragionamento.

### Email

`lib/mailer.ts`: `sendMail({subject, text, to?, replyTo?, attachments?})`
via nodemailer + Gmail SMTP. `to` è opzionale, default `HOST_EMAIL`. Solo
testo semplice (niente HTML) per coerenza con lo stile esistente.

## Variabili d'ambiente

Vedi `.env.local.example` per l'elenco completo e commentato. `.env.local`
è **sempre** ignorato da git (`.gitignore`: `.env*`, con eccezione solo
per `.env.local.example`) — mai committare segreti reali.

Punti da ricordare:
- `STRIPE_SECRET_KEY` è la chiave **segreta** (`sk_...`), non quella
  pubblicabile — questo sito usa Stripe Checkout ospitata, mai Stripe.js
  lato client.
- Testare sempre in modalità Stripe **test** prima di passare alle
  chiavi live.
- Un copia-incolla nella dashboard Vercel può includere uno spazio o un
  a-capo finale invisibile, che rompe l'header HTTP verso Stripe
  (`ERR_INVALID_CHAR`) — `lib/stripe.ts` fa `.trim()` sulla chiave per
  difendersi da questo, ma vale la pena tenerlo a mente per qualunque
  altro env var futuro usato per costruire richieste HTTP.

## Gotcha di framework

- Next.js 16 App Router: `params`/`searchParams` nelle pagine sono
  `Promise` — vanno sempre `await`ati.
- `react-day-picker` v10, modalità `mode="range"`: serve
  `excludeDisabled` per impedire che un intervallo selezionato scavalchi
  una data disabilitata/occupata.

## Riuso come modello

Il progetto è pensato per essere clonato per altri host/immobili senza
toccare il codice, solo `content/`:
- `TEMPLATE-BRIEF.md` — questionario da far compilare a un nuovo cliente.
- `TEMPLATE-SETUP.md` — passaggi tecnici per adattare il codice a un
  brief compilato.

**Regola permanente**: ogni volta che si aggiunge una funzionalità o si
introduce una nuova variabile/passaggio di setup, aggiornare anche questi
due file, non solo il codice.

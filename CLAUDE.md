# Campo Marzio 47 — sito per affitto breve

Sito Next.js per la presentazione di un immobile in affitto breve
(Marostica, VI), con check-in online, prenotazione diretta (pagata con
Stripe, o semplice richiesta via email) e offerte via email per chi le
sceglie.
Progettato per essere anche un **modello riusabile** per altri host: vedi
"Riuso come modello" in fondo a questo file.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + React 19.
Campo Marzio 47 era su Vercel, con auto-deploy da GitHub (repo
`campomarzio47/campomarzio47`, branch `main`), e **si sposta su
Cloudflare Workers** (deciso il 18 ottobre 2026, per rimettere i
pagamenti: il piano Hobby di Vercel vieta l'uso commerciale), su un
account Cloudflare intestato a Campo Marzio 47. Finché il dominio non è
passato, `main` si pubblica su entrambi. Cloudflare, tramite l'adapter
OpenNext, è anche la piattaforma dei nuovi siti creati dal modello (vedi
"Hosting su Cloudflare"). Un solo database, D1, per l'elenco delle
offerte via email; niente ORM.

Comandi: `npm run dev`, `npm run build`, `npm run lint`; `npm run preview`
(build OpenNext + anteprima sul runtime Workers, porta 8787). Nessuna
suite di test.

`npm run lint` riporta migliaia di problemi provenienti da
`.claude/worktrees/`, un vecchio worktree con dentro il proprio `.next`:
è rumore preesistente, non codice del progetto. Guardare solo i file
sotto `app/`, `components/`, `lib/`, `content/`.

## Design

Rifatto da capo a ottobre 2026: l'accusa era che il sito "sembrava fatto
dall'AI" (griglia di icone, card generiche, carosello di foto anonimo).
La direzione è editoriale e costruita sulla casa, non applicata da fuori:
non tornare a icone decorative, card tutte uguali o effetti da modello.

- **Identità**: la palette viene dai materiali della casa (il bordeaux
  delle sedie, il rovere del pavimento, il bianco caldo delle travi, il
  nero della scala in acciaio); il motivo grafico è la **scacchiera** —
  Marostica è la città della Partita a Scacchi, e sul tavolo del
  soggiorno c'è davvero una scacchiera (si vede nella foto di copertina).
  Va usata come firma, con parsimonia: `.checker` (fascia in cima al
  footer, fondo del menu) e il segno davanti alle etichette di sezione
  (`.eyebrow::before`).
- Font: **Libre Bodoni** (`font-display`, titoli; carattere italiano) +
  **Instrument Sans** (`font-sans`, testo), via `next/font/google` in
  `app/layout.tsx` (`--font-bodoni`, `--font-instrument`). Era Bodoni
  Moda: bello ma con filetti così sottili che la gamba sinistra della M e
  la diagonale del 4 sparivano, e l'utente ha trovato poco leggibili sia
  il nome in copertina sia i testi grandi sotto (fermare l'asse ottico non
  bastava). Libre Bodoni è lo stesso disegno con tratti più robusti: non
  tornare a un didone ad alto contrasto senza provarlo a 375 px sopra la
  foto. Nei titoli del dizionario il testo fra asterischi
  va in corsivo (`"Dentro *la casa*"`, `components/Emphasis.tsx`): il
  ritmo tondo/corsivo è parte dell'identità.
- Palette (CSS variables in `app/globals.css`, esposte a Tailwind v4 via
  `@theme inline`):
  - `--color-off-white: #f5f1ea` — sfondo
  - `--color-paper: #fbf9f5` — superfici rialzate (schede, campi)
  - `--color-sand: #ebe4d9` — superfici secondarie, banda delle date
  - `--color-bordeaux: #8b2635` / `--color-bordeaux-dark: #6e1e2a` —
    accento primario (CTA, date scelte)
  - `--color-charcoal: #1c1a19` — testo e sezioni scure
  - `--color-mid: #67615b` — testo secondario (5:1 sullo sfondo)
  - `--color-beam: #cdb89c` — accento secondario (rovere)
  - `--color-divider: #e0d8cc` — bordi/separatori
- **Classi di componente in `@layer components`** (`.btn`, `.field`,
  `.field-label`, `.eyebrow`, `.link-draw`, `.checker`...). Fuori da un
  layer vincevano sulle utility di Tailwind a prescindere dalla
  specificità: `hidden` non nascondeva un `.btn`. Nuove classi di questo
  tipo vanno lì.
- **Campi a 16 px minimo** (`.field`): sotto, Safari su iPhone ingrandisce
  la pagina a ogni tocco su un campo.
- Icone del sito: `app/favicon.ico` (16/32/48), `app/icon.png` (512) e
  `app/apple-icon.png` (180) — marchio "47" off-white su bordeaux. Sono
  generati da `scripts/generate-icons.mjs` (da lanciare a mano, gli asset
  sono committati); Next emette i `<link>` da solo in base al nome dei
  file. Alle dimensioni piccole il marchio usa il serif **in grassetto**:
  a 16 px il peso normale si sfalda nell'antialiasing.
- **Il sito è usato soprattutto da telefono**: ogni modifica va provata
  prima a 375 px. Bersagli di tocco ≥ 44 px, niente doppio tap.
- Layout: **intestazione in alto** (`components/Header.tsx`), non più la
  sidebar a sinistra (rubava 256 px a un sito di fotografie). In home è
  trasparente sopra la foto e diventa carta semitrasparente scendendo;
  si nasconde scorrendo verso il basso e ricompare risalendo. Su telefono
  "Check-in" resta sempre a vista accanto a "Menu": è il motivo per cui
  la maggior parte delle persone apre il sito. Il menu su telefono è a
  tutto schermo (`components/MobileMenu.tsx`), con le lingue per esteso.
  Pagine brevi, niente scroll infinito.
- Nav: solo 4 voci, tutte allo stesso livello (nessun bottone speciale) —
  La Casa, Prenota ora, Check-in online, Contatti (`components/nav-items.ts`).
- Home (`app/page.tsx`), in ordine: copertina (`Hero.tsx`: solo foto e
  nome, con città/provincia sopra — niente facts né bottoni), introduzione
  (`Intro.tsx`: `hero.tagline` in grande, descrizione, numeri della casa,
  richiamo al check-in), Foto (`#foto`), Servizi (`#servizi`), Dove siamo
  (`#dove`, sezione scura: la foto aerea della Partita a Scacchi, che
  essendo orizzontale va a tutta larghezza sopra il testo; una foto
  verticale gli starebbe accanto), Recensioni (`#recensioni`). Le vecchie route
  `/foto`, `/servizi`, `/recensioni` restano come redirect alle ancore
  (`permanentRedirect`, 308).
- **Foto** (`components/PhotoMosaic.tsx` + `PhotoViewer.tsx`): in home
  quattro foto in composizione a zig-zag (orizzontale, due verticali
  sfalsate, orizzontale), scelte da `property.gallery` **rispettando
  l'orientamento** — una verticale tagliata in orizzontale perde metà
  stanza. Se mancano verticali, un posto verticale prende un'orizzontale
  tagliata sul suo `focus` (object-position in `gallery`): va bene per
  un dettaglio come l'angolo del caffè. Le foto in testa alla galleria
  sono le nuove da 2000 px (ottobre 2026); delle vecchie da telefono
  l'utente ha tenuto solo cinque. Nella facciata la targa dell'auto
  parcheggiata è sfocata: gli originali sono in `foto_campomarzio/`. Il tocco apre la galleria a schermo intero: scorrimento nativo
  con scroll-snap (segue il dito, nessuna libreria), miniature, contatore,
  frecce e tastiera su desktop. Ogni foto è mostrata al massimo a 1,25
  volte la sua larghezza reale (`width`/`height` in `property.ts`): le
  foto della galleria sono scatti da telefono a 911/512 px, e ingrandite a
  tutto schermo diventavano pastose. Il tasto "indietro" del telefono
  chiude la galleria (una voce in più nella cronologia, stesso URL).
- **Servizi** (`components/Amenities.tsx`): elenco tipografico nome +
  dettaglio, in gruppi (`amenities.groups`), **senza icone**.
- **Recensioni**: voto mostrato in decimi com'è ("10/10"), mai stelle;
  gruppo e mese tradotti (`group` è una chiave, `date` è `"AAAA-MM"`).
- **Barra delle date** (`components/AvailabilityBar.tsx`), solo in home:
  su telefono barra fissa in basso con prezzo a notte e bottone che apre
  un pannello dal basso col calendario; su desktop "pillola" fluttuante
  con calendario a due mesi. Porta a `/prenota?from=...&to=...`. È
  montata con un portale (vedi sotto, `transform`).
- **Calendario** (`components/DateRangeCalendar.tsx`, condiviso da barra
  e `/prenota`): un mese su telefono, due affiancati da 768 px. Tutte le
  etichette per screen reader passano da `labels` (giorno, "oggi",
  "selezionato", navigazione): le predefinite della libreria restano in
  inglese qualunque sia la lingua. Le date brevi usano
  `formatWeekdayDayMonth`/`formatDayMonth` (`lib/date-locale.ts`), che
  hanno la punteggiatura di ogni lingua ("Fr., 20. Nov."). **Il
  foglio di stile di react-day-picker non va importato**: dichiarava
  `--rdp-accent-color: blue` su `.rdp-root` e, caricato dopo
  `globals.css`, sovrascriveva la palette — da lì il blu dei giorni
  scelti e delle frecce. Tutto lo stile è nella sezione "Calendario" di
  `globals.css`. Dopo un intervallo completo il tocco successivo
  ricomincia dall'arrivo (come Airbnb). `RangeHint` dice cosa fare
  adesso (arrivo → partenza → "5 notti").
- **Movimento** (tutto in `app/globals.css`, un solo ritmo: `--ease-out`
  per le entrate, `--ease-curtain` per i sipari; tutto rispetta
  `prefers-reduced-motion`): ingresso di ogni pagina (`.page-enter`, da
  `app/template.tsx`), titoli che salgono riga per riga (`.line-mask`),
  comparsa allo scorrimento (`components/Reveal.tsx`: `.reveal` e, per le
  foto, `variant="mask"` — un sipario che si alza mentre l'immagine si
  assesta), foto di copertina che si assesta una volta (`.hero-settle`,
  non più lo zoom infinito) con parallasse leggera, menu a sipario,
  pannelli dal basso, passi del check-in che scorrono nella direzione di
  marcia. Le finestre hanno anche un'animazione d'uscita
  (`lib/hooks/usePresence.ts`).
  **Due trappole già pagate**:
  - Il sipario (`clip-path` chiuso) sta su un elemento **interno**
    (`.reveal-mask-inner`): Chrome considera "non visibile" per
    l'IntersectionObserver un elemento con `clip-path` completamente
    chiuso, e la foto non si scopriva mai. Inoltre il compilatore CSS
    riduceva il selettore `.reveal-mask.reveal-visible .reveal-mask-inner`
    a `.reveal-mask.reveal-visible`: per questo l'apertura usa la classe
    `.is-open` direttamente sull'elemento interno.
  - **`transform` su antenati di elementi `fixed`**: un antenato con
    `transform` (`.reveal`, `.page-enter` durante l'ingresso,
    l'intestazione quando si nasconde) diventa il contenitore di
    riferimento per `position: fixed`. Per questo menu, galleria, barra
    delle date e pannello si montano con `createPortal` su
    `document.body`, e `.page-enter` finisce con `transform: none`.
    Pattern da riusare per qualunque futuro overlay.

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
- Galleria (`PhotoViewer`), menu (`MobileMenu`) e pannello date di
  `AvailabilityBar` sono finestre modali: `role="dialog"`, Esc, trappola
  del focus e focus restituito all'elemento di partenza, tutto in
  `lib/hooks/useDialog.ts`. Se aggiungi un overlay, usa quello.
- Il check-in a passi sposta il focus sul titolo di ogni nuovo passo:
  chi usa uno screen reader deve sentire dove si trova.
- Il nome in copertina è su due righe (blocchi): fra le due c'è uno
  spazio esplicito, o il titolo verrebbe letto "Campo Marzio47".
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
  (`Dictionary`), con oggetti paralleli **`it`/`en`/`de`** (il tedesco è
  stato aggiunto a ottobre 2026). Helper `plural()` per singolare/plurale
  (`{ one, other }`) e `fill()` per i segnaposto `{chiave}`. Contiene sia UI
  generica sia alcuni testi discorsivi specifici della proprietà (vedi
  `TEMPLATE-SETUP.md` per l'elenco esatto). La sezione `a11y` raccoglie
  le stringhe che vedono solo screen reader e tastiera: vanno tradotte
  come le altre, non lasciate in italiano fisso nei componenti.
- `content/legal.ts` e `content/legal-texts.ts` — dati e testi legali,
  vedi la sezione "Pagine legali e conformità".
- i18n **cookie-based**, non URL-based: nessuna route `/it/`, `/en/`.
  `lib/locale.ts` (`locales`, `Locale`, `LOCALE_COOKIE`,
  `defaultLocale="it"`, `intlLocale` per prezzi e date, `localeNames`),
  `lib/date-locale.ts` (locale date-fns: inglese **britannico**, settimana
  che parte di lunedì). Aggiungere una lingua significa: `locales`, un
  oggetto completo in `dictionaries.ts`, le tre funzioni in
  `legal-texts.ts`, i campi `*De`-like in `legal.ts`, un ramo in
  `lib/booking-notifications.ts` (email all'ospite) e `country-names.ts`.
  `components/LocaleProvider.tsx` espone `useLocale() -> {locale, dict,
  setLocale}`. Il cookie viene letto server-side solo in
  `app/layout.tsx` (per l'HTML iniziale) e in eventuali API route che
  devono personalizzare un'email nella lingua del cliente (es.
  `app/api/booking/create/route.ts`).
- `components/PageHeader.tsx` è generico: accetta un `section` che deve
  essere una chiave di `Dictionary` con forma `{title, subtitle?}` — le
  nuove pagine che vogliono riusarlo devono seguire questa forma.
- Dati di riferimento ISTAT (comuni/stati) in `content/data/*.json`,
  esposti da `lib/reference-data.ts`. Gli stati hanno anche il nome
  inglese e tedesco (`lib/country-names.ts`), solo per cercare e mostrare:
  la tabella ufficiale conosce "GERMANIA", un ospite tedesco scrive
  "Deutschland". Il valore salvato resta codice + nome ufficiale.
- I metadati SEO restano in italiano (lingua predefinita); il titolo
  delle pagine principali è il nome della voce di menu ("Contatti"), non
  l'h1 discorsivo ("Scrivici, o chiamaci"): vedi `pageMetadata()`.

## Funzionalità principali

- `/check-in` — check-in ospiti, **a passi** (`components/CheckInForm.tsx`):
  soggiorno → chi prenota → documento → un passo per ogni altro ospite →
  conferma con riepilogo e "Modifica" per sezione. Ogni passo è un
  `<form>` a sé (la validazione del browser controlla solo quel passo); i
  dati restano in memoria, **mai** in localStorage (sono documenti
  d'identità). Il sesso parte vuoto e va scelto, mai preimpostato. La
  data di nascita è in tre campi — giorno, mese per nome, anno —
  (`components/BirthDateField.tsx`), non il calendario nativo: per chi è
  nato decenni fa voleva dire scorrere anno per anno. Le date impossibili
  (31 febbraio, future, prima del 1900) bloccano il passo, e quella
  valida viene riscritta per esteso con l'età per far notare i refusi.
  All'ospite principale si chiede anche il **CAP** (obbligatorio se
  risiede in Italia): con via, comune e stato fa l'indirizzo della
  fattura. All'ultimo passo, se c'è il database, una casella facoltativa
  e mai spuntata in partenza per le offerte via email (vedi sotto). Motivo
  del viaggio e mezzo di trasporto si chiedono una volta e si applicano a
  tutti gli ospiti. Gli errori mostrati all'ospite sono quelli del
  dizionario, mai il testo del server (che è in italiano). Genera e invia
  via email all'host **tre** allegati, che coprono due adempimenti
  distinti su due portali diversi:
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
  - `lib/checkin-pdf.ts` — PDF riepilogo leggibile, ordinato per l'uso:
    soggiorno, intestatario della ricevuta con l'indirizzo tutto insieme
    (prima via e comune stavano lontani), documento, ospiti. Lo stile
    resta semplice. L'intestazione sta in `content/checkin-pdf-header.ts`
    perché è **per casa**: i nuovi siti ne disegnano una loro, mai quella
    di Campo Marzio 47 (richiesta dell'utente). I caratteri standard del
    PDF conoscono solo Windows-1252: le lettere che mancano ("ř", "ł")
    perdono l'accento invece di far fallire il check-in.

  **`<idswh>` nell'XML Ross1000 deve restare invariato** per lo stesso
  check-in (lo impone il manuale GIES: è la chiave con cui il portale
  riconosce un ospite già comunicato). È derivato con un hash dai dati
  anagrafici + data di arrivo, quindi ri-generare lo stesso check-in
  produce lo stesso identificativo. Non tornare mai a un valore casuale:
  ogni ri-caricamento creerebbe ospiti nuovi invece di aggiornare quelli
  esistenti, gonfiando le presenze sul portale.
- `/prenota` — prenotazione diretta, pagata o richiesta via email (vedi
  sotto). Tre passi numerati (date, ospiti con − e +, dati) e un
  riepilogo col prezzo che su desktop resta di lato e su telefono diventa
  una barra in fondo con totale e invio (un unico `<form>`). Usa il
  feed iCal Airbnb/Booking (`lib/ical.ts`, `lib/hooks/useBusyRanges.ts`)
  solo per disabilitare le date già occupate nel calendario — non esiste
  più una pagina "Disponibilità" a sé stante (rimossa: poco usata e
  duplicava `/prenota`).
- `/contatti` — form di contatto (`app/api/contatti`).
- `/privacy`, `/cookie-policy`, `/termini` — pagine legali, vedi sotto.

## Prenotazione diretta: con Stripe o richiesta via email

Storia: Stripe c'era, è stato tolto a settembre 2026 (nessuna
prenotazione diretta in due anni, e Vercel Hobby vieta l'uso
commerciale) ed è tornato a ottobre 2026 su richiesta dell'utente,
insieme al trasloco su Cloudflare. Il sito ora sa fare **entrambe le
cose** e sceglie da solo: `paymentsEnabled()` (`lib/stripe.ts`) è vero
solo con `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e
`BOOKING_TOKEN_SECRET` tutte impostate. `lib/features.ts` lo passa a
pagine e testi legali, che si adeguano: il sito non descrive mai un
pagamento che non fa (e su Vercel, senza chiavi, resta una richiesta).

**Con Stripe** — addebito alla conferma, non subito (scelta dell'utente):

1. `POST /api/booking/create` crea una sessione Stripe Checkout con
   `capture_method: "manual"`: la carta viene **autorizzata**, non
   addebitata. I dati della prenotazione stanno nei metadata del
   PaymentIntent (`lib/booking-metadata.ts`): sono l'unico archivio,
   insieme alla dashboard Stripe. Il messaggio dell'ospite è limitato a
   500 caratteri per questo.
2. Il webhook (`/api/stripe/webhook`, eventi
   `checkout.session.completed` e `payment_intent.canceled`) manda
   all'host il link firmato (`lib/booking-tokens.ts`, HMAC, 7 giorni) a
   `/host/prenotazioni/azione` e all'ospite la ricevuta della richiesta.
   Stripe ripete gli eventi: `metadata.notified` evita le email doppie.
3. L'host apre la pagina (che ricontrolla l'iCal e avvisa se le date
   risultano prese) e preme Conferma (cattura → email di conferma) o
   Rifiuta (annulla → nessun addebito). Se non fa nulla prima di
   `capture_before` l'autorizzazione scade e il webhook avvisa entrambi.
4. Cancellazione gratuita fino a `legal.stay.freeCancellationDays` (7)
   giorni prima dell'arrivo; i rimborsi l'host li fa dalla dashboard
   Stripe. Le email all'ospite hanno `replyTo` = `HOST_EMAIL`, perché
   lo invitano a rispondere.

Il client Stripe usa `createFetchHttpClient` e la verifica del webhook
`createSubtleCryptoProvider`: girano uguali in Node e su Workers
(collaudato sul runtime Workers). `stripe` è fissato a una versione
esatta.

**Senza Stripe** — `sendBookingRequestEmails`
(`lib/booking-notifications.ts`): email all'host con `replyTo`
dell'ospite e presa in carico all'ospite nella sua lingua. Le email
dicono che **la richiesta non è una prenotazione** finché l'host non
conferma per iscritto.

In entrambi i casi:

- Dopo una conferma l'host deve bloccare le date su Airbnb e Booking a
  mano: il sito non scrive nei loro calendari.
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
- `content/legal-texts.ts` — prosa di privacy, cookie e termini
  (it/en/de; il tedesco dichiara che in caso di dubbio fa fede l'italiano),
  resa da `components/LegalPage.tsx`. `legalTexts(locale, features)` è
  una funzione: Termini con o senza pagamento Stripe, informativa con o
  senza la sezione sulle offerte, a seconda di cosa è attivo
  (`lib/features.ts`, deciso dalla pagina server a ogni richiesta). Sta fuori da `dictionaries.ts`, che
  resta per le stringhe di UI. I valori variabili sono interpolati da
  `legal.ts`, **incluso il nome del cookie** letto da `lib/locale.ts`:
  una cookie policy che nomina un cookie diverso da quello reale è essa
  stessa un'informazione falsa. Allo stesso modo i valori possibili del
  cookie ("it, en oppure de") vengono da `locales`.
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
- **Il piano Hobby di Vercel vieta l'uso commerciale**: è il motivo del
  trasloco su Cloudflare (`LEGALE.md` §6), che non ha questo limite.
- `.env.local` dell'utente contiene ancora una chiave Stripe **live**:
  in `next dev` i pagamenti risultano attivi con quella. Per provare
  /prenota in locale serve un `.env.development.local` che la
  sostituisca con una di test (o finta, senza inviare).

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
  lettura (nessuna risorsa R2/KV da creare per sito), quindi una route
  con revalidate resterebbe congelata alla build. `/api/availability` è
  `force-dynamic` per questo.
- **D1** (binding `DB`, `database_name` senza ID in `wrangler.jsonc`):
  Cloudflare lo crea e lo collega al primo deploy (provisioning
  automatico). `getDb()` (`lib/db.ts`) usa `getCloudflareContext` in
  modalità **sincrona**: quella asincrona fuori da Workers avvierebbe
  wrangler, su Vercel a ogni richiesta. Senza binding restituisce null e
  le offerte si spengono. In `next dev` i binding arrivano da
  `initOpenNextCloudflareForDev()` in `next.config.ts` (copia locale
  in `.wrangler/`); `wrangler d1 execute campomarzio47 --local` la legge.
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

## Offerte via email (D1)

L'utente vuole poter mandare 2-3 volte l'anno delle offerte a chi le ha
scelte. Regole, tutte promesse nell'informativa:

- **Solo con consenso esplicito** (art. 6.1.a GDPR): casella all'ultimo
  passo del check-in, separata dalla presa visione della privacy e mai
  spuntata in partenza. Il check-in funziona identico senza.
- `lib/newsletter.ts` salva email, nome, lingua, data del soggiorno,
  **testo esatto del consenso** (dal dizionario, non dal browser) con la
  data, e un token casuale. La tabella si crea da sola.
- Disiscrizione: link in ogni email a `/offerte/disiscrizione`, che
  chiede un clic su un bottone (gli antispam aprono i link: un GET che
  cancella toglierebbe chi non l'ha chiesto), più `List-Unsubscribe` e
  `List-Unsubscribe-Post` (RFC 8058) verso `/api/newsletter/unsubscribe`.
  Disiscriversi **cancella** la riga.
- Invio: `node scripts/offerte.mjs <file>` dal PC (anteprima, `--prova`,
  `--invia`; wrangler lanciato senza shell). Cancella gli iscritti con
  l'ultimo soggiorno oltre 24 mesi e rifiuta il quarto invio in dodici
  mesi (tabella `campaigns`). Collaudato sul database locale con
  `--locale` e `scripts/smtp-sink.mjs`.

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
- `robots.ts` esclude `/api/`, `/host/` (Conferma/Rifiuta),
  `/prenota/conferma` e `/offerte/` (disiscrizione), tutte noindex.
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
  modello) e `check` (residui di Campo Marzio 47, CIN, foto mancanti;
  segnala anche l'intestazione del PDF finché non è ridisegnata).
  `scripts/offerte.mjs` — invio delle offerte via email.
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

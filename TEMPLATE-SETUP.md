# Come adattare questo repo a un nuovo host/immobile

Questo sito è stato costruito per "Campo Marzio 47" ma il codice non ha
più riferimenti hardcoded al nome/città/host: tutto il contenuto
specifico dell'immobile vive in `content/`. Per generare un nuovo sito a
partire da un brief compilato con `TEMPLATE-BRIEF.md`, seguire questi
passaggi in ordine.

## 1. Clonare il progetto

Copiare l'intera cartella (o `git clone` di questo repo) in una nuova
cartella/repo per il nuovo cliente. Non riusare lo stesso repo Vercel/
GitHub del cliente precedente. Rinominare anche il campo `name` in
`package.json` (di default `"campomarzio47"`) con un nome coerente col
nuovo progetto — non è visibile agli utenti ma compare nei log di build
e in eventuali `npm ls`.

## 2. `content/property.ts`

Sostituire tutti i valori con quelli del brief: `name`, `nameAccent`,
`type`, `address`, `host`, `facts`, `booking`, `reviews`, `heroImage`,
`gallery`, `pricing` (incluso `minAdvanceDays`, il preavviso minimo in
giorni prima dell'arrivo — di default 2). Questo file guida logo, hero,
meta title delle pagine, PDF di check-in e il nome "prodotto" di default
nell'XML Ross1000 — va sempre aggiornato per primo.

## 3. `content/dictionaries.ts`

A differenza di `property.ts`, questo file contiene sia UI generica
(riusabile senza modifiche: label dei form, bottoni, testi del check-in)
sia testi discorsivi specifici dell'immobile che vanno riscritti a mano,
in entrambe le lingue (`it` e `en`):

- `meta.title` / `meta.description`
- `hero.tagline` / `hero.description`
- `photos.subtitle` (cita il nome della proprietà) e `photos.items`
  (alt/caption di ogni foto della galleria)
- `amenities.items` (titolo/descrizione/categoria di ogni servizio — vedi
  §4bis per l'icona)
- `contact.subtitle` (cita il nome dell'host)
- messaggio di conferma del form di check-in (cita la città)

Cercare nel file le occorrenze del vecchio nome proprietà/città per non
dimenticarne nessuna prima di considerare la traduzione completa.

## 3bis. Home page: hero minimale + barra "Verifica disponibilità"

La home (`app/page.tsx` + `components/Hero.tsx`) è volutamente minimale:
l'hero mostra solo foto a piena larghezza + nome della proprietà; `hero.tagline`
e `hero.description` (da `dictionaries.ts`) vengono renderizzati subito sotto,
in una sezione separata, non nell'hero stesso. Sotto, le sezioni Foto
(`components/PhotoCarousel.tsx`), Servizi (`components/Amenities.tsx`) e
Recensioni (`components/ReviewsSection.tsx`) — non sono pagine a sé, sono
ancore `#foto`/`#servizi`/`#recensioni` nella stessa pagina.
`components/AvailabilityBar.tsx` aggiunge una barra fissa in fondo pagina
(solo nella home) con selezione Arrivo/Partenza che reindirizza a
`/prenota?from=...&to=...` — non richiede setup aggiuntivo, ma se il nuovo
host non vuole i pagamenti diretti (vedi `TEMPLATE-BRIEF.md`) va rimossa o
puntata altrove.

## 3ter. Personalizzare lo stile visivo

**Importante**: lo stile "boutique elegante" di Campo Marzio 47 (palette
bordeaux/off-white, serif Cormorant Garamond, animazioni discrete) è una
scelta per QUESTA proprietà, non un vincolo del codice. In base al brief
(§3, "Stile visivo"), il nuovo sito potrebbe aver bisogno di un registro
diverso — es. più giovane/vivace per una casa per gruppi, più sobrio per
un B&B di montagna. Punti da toccare:

- **Palette**: `app/globals.css`, variabili CSS in `:root` (`--color-*`)
  — sono l'unico posto da cambiare, sono già esposte a Tailwind v4 via
  `@theme inline` e usate ovunque nel sito (nessun colore hardcoded nei
  componenti).
- **Font**: `app/layout.tsx` (import da `next/font/google`, attualmente
  Cormorant Garamond + DM Sans) — cambiare gli import e aggiornare le
  variabili CSS `--font-cormorant`/`--font-dmsans` referenziate in
  `globals.css` (o rinominarle per chiarezza se si cambiano i font).
- **Animazioni/motion**: in `app/globals.css` — `.animate-kenburns` (zoom
  lento sulla foto hero), `.reveal`/`.reveal-visible` (comparsa graduale
  delle sezioni scorrendo, via `components/Reveal.tsx`), `.animate-pop-in`/
  `.animate-sheet-in`/`.animate-fade-in` (popover, pannelli, lightbox).
  Sono pensate per essere discrete e coerenti con uno stile boutique; per
  un sito più sobrio si possono anche rimuovere del tutto (togliere le
  classi dai componenti che le usano) senza rompere nulla — non sono
  legate a nessuna logica funzionale.
- **Calendario** (`react-day-picker`, usato da `components/BookingCalendar.tsx`
  e `components/AvailabilityBar.tsx`): stile in `app/globals.css` sotto
  `.rdp-root` e classi correlate, basato sulle CSS custom property della
  libreria — eredita automaticamente `--color-bordeaux` ecc., quindi
  cambiando la palette si aggiorna da solo; non serve toccarlo a meno di
  voler cambiare la forma (es. punto "oggi", raggio degli angoli).

## 4. Foto

Sostituire i file in `public/photos/` con quelli del nuovo immobile,
mantenendo `heroImage` e `gallery` in `property.ts` allineati ai nomi
file effettivi. Preferire sempre foto ad alta risoluzione per l'hero (le
foto scaricate direttamente da Airbnb/Booking sono spesso troppo
compresse per un'immagine a piena larghezza).

## 4bis. Icone dei servizi

`components/Amenities.tsx` ha una mappa `icons` che associa una stringa
(il campo `icon` di ogni voce in `dictionaries.ts` → `amenities.items`) a
un'icona [Lucide](https://lucide.dev/icons/). Se un nuovo servizio non
rientra tra le icone già presenti nella mappa (Wifi, Car, Thermometer,
ChefHat, Tv, Trees, WashingMachine, DoorOpen), importare l'icona Lucide
corrispondente e aggiungerla alla mappa prima di referenziarla nel
dizionario — altrimenti va in fallback su `Wifi`.

## 5. Variabili d'ambiente

Copiare `.env.local.example` in `.env.local` e compilare con i dati del
brief (account Gmail, App Password, indirizzo destinatario, URL iCal se
disponibili, codice struttura Ross1000 se in Veneto). Impostare le
stesse variabili nelle Environment Variables del progetto Vercel prima
del primo deploy.

## 6. Check-in / Ross1000

`lib/ross1000.ts` implementa il tracciato ufficiale GIES/Ross1000 per la
Regione Veneto. Se il nuovo immobile è in Veneto, basta impostare
`ROSS1000_CODICE_STRUTTURA`. Se è in un'altra regione con un sistema di
movimentazione turistica diverso, il generatore XML va rivisto secondo
la documentazione ufficiale di quella regione — non riusare Ross1000
assumendo che sia lo stesso formato ovunque. Il resto del flusso di
check-in (form, validazione, PDF di riepilogo, invio email) è generico e
riusabile senza modifiche indipendentemente dalla regione.

Il check-in genera anche `lib/alloggiati.ts` — il file `.txt` per
**Alloggiati Web** (Questura, pubblica sicurezza): adempimento nazionale,
distinto da quello statistico regionale e valido per qualunque regione,
quindi non va adattato per un nuovo cliente. L'host deve caricare i due
file su due portali diversi.

Attenzione a non "semplificare" queste due cose, che sembrano ridondanti
ma non lo sono:
- il file Questura **non** è scaricabile da Ross1000 quando i dati
  arrivano da un gestionale esterno (le FAQ ufficiali GIES: *"Tale
  funzione è disponibile solo per chi carica da check-in"*), e il
  tracciato XML di movimentazione non prevede affatto i campi del
  documento d'identità — per questo lo generiamo direttamente noi;
- `<idswh>` nell'XML Ross1000 deve restare **invariato** per lo stesso
  check-in (lo impone il manuale GIES). È un hash dei dati anagrafici +
  data di arrivo: se diventasse casuale, ogni ri-caricamento dello stesso
  soggiorno verrebbe registrato dal portale come ospiti nuovi, gonfiando
  le presenze.

## 6b. Prenotazione diretta con pagamento (Stripe)

`content/property.ts` ha un blocco `pricing` (`pricePerNight`,
`cleaningFee`, `minNights`, `minAdvanceDays`, `currency`) da compilare
con i valori del brief prima di attivare `/prenota` — di default
`pricePerNight` è `0`, che mostrerebbe un totale a zero se lasciato così.

Non serve altro codice: `/prenota`, le email di richiesta/conferma/
rifiuto e la pagina host `/host/prenotazioni/azione` funzionano già,
senza database (i dati della prenotazione vivono nei metadata del
PaymentIntent Stripe — vedi il piano archiviato in questo file per il
dettaglio architetturale).

Variabili d'ambiente da impostare (`.env.local` in locale, poi le stesse
su Vercel):
- `STRIPE_SECRET_KEY` — dalla Dashboard Stripe
  (`dashboard.stripe.com/test/apikeys` per la chiave di TEST,
  `dashboard.stripe.com/apikeys` per quella live). È la chiave
  **segreta** (`sk_...`), non quella pubblicabile (`pk_...`) — questo
  sito non la usa mai, perché il pagamento avviene su una pagina ospitata
  da Stripe (Checkout), non con un form carta custom nel sito.
- `STRIPE_WEBHOOK_SECRET` — creato quando si configura l'endpoint
  webhook su Stripe (`dashboard.stripe.com/webhooks`, endpoint puntato a
  `https://<dominio>/api/stripe/webhook`, sottoscritto SOLO all'evento
  `checkout.session.completed`). **Senza questo valore configurato, dopo
  che un ospite paga l'host non riceve alcuna email di notifica: il
  flusso si interrompe silenziosamente.** Da non dimenticare.
- `BOOKING_TOKEN_SECRET` — generato una tantum con `openssl rand -hex
  32`, non deve mai cambiare dopo il primo deploy (invaliderebbe i link
  di conferma/rifiuto già inviati agli host in attesa).

**Sempre testare in modalità TEST prima di passare alle chiavi live**:
chiavi che iniziano con `sk_test_`/`pk_test_`, webhook di test, carta di
prova `4242 4242 4242 4242`. Solo dopo aver verificato l'intero flusso
(autorizzazione → email host → conferma o rifiuto → email finali) si
passa alle chiavi `sk_live_...` e a un endpoint webhook live separato.

## 7. Dominio e deploy

Creare un nuovo repo GitHub dedicato, importarlo su Vercel come nuovo
progetto (non riusare il progetto Vercel del cliente precedente),
collegare il dominio del brief o lasciare il sottodominio
`<nome-progetto>.vercel.app`.

## 7b. SEO

`NEXT_PUBLIC_SITE_URL` (env var) va impostato al dominio reale scelto al
punto 7 **prima** del lancio — è usato per `sitemap.xml`, `robots.txt`,
il tag `canonical` e Open Graph (`app/layout.tsx`). Se lasciato vuoto il
sito usa come fallback `https://campomarzio47.vercel.app`, sbagliato per
qualunque nuovo progetto.

`meta.title`/`meta.description` in `content/dictionaries.ts` (sezione
`it`) vanno riscritti per includere naturalmente termini che un host
locale userebbe per cercare l'immobile (tipo di alloggio + "affitto
breve"/"casa vacanze" + città) — non limitarsi al nome della proprietà.
I dati strutturati JSON-LD (`LodgingBusiness`, generati automaticamente
da `content/property.ts`) non richiedono modifiche manuali.

Fuori dal codice, indispensabile e più efficace di qualunque
ottimizzazione on-page per ricerche locali: registrare/verificare una
scheda **Google Business Profile** per l'immobile e sottomettere il
sito su **Google Search Console** (richiede accesso Google dell'host,
non automatizzabile) — un sito nuovo, per quanto ben ottimizzato, spesso
non compare nei risultati finché non viene scoperto/indicizzato.

## 7c. Google Analytics (facoltativo)

Già integrato via `@next/third-parties` in `app/layout.tsx`: non serve
incollare nessuno snippet. Basta impostare la variabile
`NEXT_PUBLIC_GA_ID` con l'ID misurazione dell'host (`G-XXXXXXXXXX`).

Impostarla **solo nell'ambiente Production** di Vercel: se la variabile è
assente lo script non viene caricato affatto, così le visite fatte in
locale e nelle anteprime non falsano le statistiche reali.

Attenzione: Analytics installa cookie di profilazione. Per un sito
rivolto a visitatori UE servirebbe un banner di consenso cookie, che
**questo modello non include** — se l'host attiva Analytics, va valutato
se aggiungerlo (o se restare senza Analytics).

## 8. Verifica finale

- `npm run build` senza errori.
- Controllo visivo di ogni pagina in locale (home — incluse le sezioni
  Foto/Servizi/Recensioni —, prenota, check-in, contatti), sia IT che EN,
  sia con lo stile scelto (§3ter) verificato in chiaro che tutti i testi
  restino leggibili con la nuova palette (contrasto testo/sfondo).
- Un check-in di prova end-to-end per confermare che l'email arrivi con
  XML + PDF allegati.
- Se Ross1000 è attivo: caricamento di prova dell'XML generato sul
  portale ufficiale prima di usarlo con ospiti reali.
- Se la prenotazione diretta è attiva: una prenotazione di prova in
  modalità Stripe TEST end-to-end, prima di attivare le chiavi live
  (vedi §6b).

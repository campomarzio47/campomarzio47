# Come adattare questo repo a un nuovo host/immobile

Questo sito è stato costruito per "Campo Marzio 47" ma il codice non ha
più riferimenti hardcoded al nome/città/host: tutto il contenuto
specifico dell'immobile vive in `content/`. Per generare un nuovo sito a
partire da un brief compilato con `TEMPLATE-BRIEF.md`, seguire questi
passaggi in ordine.

> **Il modo più rapido è la skill `/nuovo-sito`** di Claude Code, che
> segue `TEMPLATE-NUOVO-SITO.md`: dalle foto e dalle informazioni del
> cliente fino al sito pubblicato su Cloudflare. Questo file resta il
> riferimento tecnico di ogni passaggio.

## 1. Creare il progetto

Nella cartella del nuovo cliente, copiare l'ultimo commit del modello con
`git archive` invece di clonarlo:

```bash
git -C "C:/Users/fv28/campomarzio_website" archive --format=tar main | tar -xf - -C .
git init -b main
npm ci
```

Rispetto a una copia della cartella non porta `node_modules`, `.next`,
`.env.local` né le foto originali; rispetto a `git clone` non porta la
storia di Campo Marzio 47 e soprattutto **nessun remote**. Il repo di
Campo Marzio ha l'auto-deploy: con un clone, un push distratto
pubblicherebbe il sito di un host sopra quello di un altro.

Poi `scripts/new-site.mjs init` (§4) imposta il nome del progetto in
`package.json` e in `wrangler.jsonc`, dove è anche il nome del Worker
Cloudflare. Non riusare repo GitHub o Worker di un cliente precedente.

## 2. `content/property.ts`

Sostituire tutti i valori con quelli del brief: `name`, `nameAccent`,
`type`, `address` (compreso `provinceName`, la provincia per esteso che
compare sopra il nome in copertina), `host`, `facts`, `booking`,
`reviews`, `heroImage`, `gallery`, `surroundings`, `pricing` (incluso
`minAdvanceDays`, il preavviso minimo in giorni prima dell'arrivo — di
default 2). Questo file guida logo, hero, meta title delle pagine, PDF di
check-in e il nome "prodotto" di default nell'XML Ross1000 — va sempre
aggiornato per primo.

- `gallery`: ogni foto con `width` e `height` reali (li stampa
  `new-site.mjs init`). Servono a mostrarla nel suo formato e a non
  ingrandirla oltre la sua risoluzione.
- `surroundings`: la foto della sezione "Dove siamo" (vista, paese) e
  l'indirizzo per il link "Apri in Mappe". Con `photo.src` vuoto la
  sezione mostra solo il testo.
- `reviews`: `group` è una chiave (`family`, `couple`, `group`, `solo`,
  `friends`, `business`) e `date` è `"AAAA-MM"`: etichetta e mese vengono
  scritti nella lingua di chi legge. `lang` solo se la recensione non è
  in italiano.

## 3. `content/dictionaries.ts`

A differenza di `property.ts`, questo file contiene sia UI generica
(riusabile senza modifiche: label dei form, bottoni, testi del check-in)
sia testi discorsivi specifici dell'immobile che vanno riscritti a mano,
in **tutte e tre le lingue** (`it`, `en`, `de`):

- `meta.title` / `meta.description` / `meta.pages.*`
- `hero.tagline` (la frase grande sotto la copertina), `hero.description`,
  `hero.imageAlt` (descrive la foto di copertina, non lo slogan)
- `photos.title`/`subtitle` e `photos.items` (alt e didascalia di ogni
  foto, nello stesso ordine di `gallery`)
- `amenities.groups` (vedi §4bis)
- `place`: la sezione "Dove siamo" — titolo, paragrafi, didascalia della
  foto e tre `points` brevi (es. "Centro storico — pochi minuti"). Solo
  fatti verificabili: niente distanze o minuti inventati. Con `title`
  vuoto la sezione sparisce.
- `contact.title`/`subtitle` (cita il nome dell'host) e `contact.languages`
- `checkin.sentBody` (cita la città)

Nei titoli il testo fra asterischi va in corsivo (`"Dentro *la casa*"`,
reso da `components/Emphasis.tsx`): è il ritmo tondo/corsivo del sito.
Gli asterischi non vanno in alt, aria-label e metadati.

Cercare nel file le occorrenze del vecchio nome proprietà/città per non
dimenticarne nessuna prima di considerare la traduzione completa.

## 3bis. Home page

La home (`app/page.tsx`) è una sequenza di sezioni, tutte nella stessa
pagina (le vecchie route `/foto`, `/servizi`, `/recensioni` sono redirect
alle ancore):

1. **Copertina** (`components/Hero.tsx`): solo foto e nome, con città e
   provincia sopra. Niente bottoni né numeri.
2. **Introduzione** (`components/Intro.tsx`): `hero.tagline` in grande,
   `hero.description`, i numeri della casa (da `property.facts`) e un
   richiamo al check-in online per chi ha già prenotato altrove.
3. **Foto** (`#foto`, `components/PhotoMosaic.tsx`): quattro foto scelte
   per orientamento (orizzontale, due verticali, orizzontale) e la
   galleria a schermo intero (`components/PhotoViewer.tsx`).
4. **Servizi** (`#servizi`, `components/Amenities.tsx`).
5. **Dove siamo** (`#dove`, `components/Place.tsx`): la sezione scura,
   da `dictionaries.place` e `property.surroundings`.
6. **Recensioni** (`#recensioni`): sparisce con `reviews: []`.

`components/AvailabilityBar.tsx` aggiunge in home la barra delle date
(fissa in basso su telefono, "pillola" fluttuante su desktop) che porta a
`/prenota?from=...&to=...`. Se il nuovo host non vuole richieste dirette
(vedi `TEMPLATE-BRIEF.md`) va rimossa da `app/page.tsx`.

## 3ter. Personalizzare lo stile visivo

**Importante**: lo stile di Campo Marzio 47 è costruito sulla casa — la
palette viene dai suoi materiali (il bordeaux delle sedie, il rovere, il
bianco delle travi, il nero della scala) e la scacchiera da Marostica,
la città della Partita a Scacchi. Per un altro immobile vanno ripensati
palette e motivo, non copiati. Punti da toccare:

- **Palette**: `app/globals.css`, variabili `--color-*` in `:root`
  (`off-white`, `paper`, `sand`, `bordeaux`, `charcoal`, `mid`, `beam`,
  `divider`). Sono l'unico posto da cambiare: nessun colore è scritto nei
  componenti. Verificare il contrasto (≥ 4,5:1) di `--color-mid` sullo
  sfondo.
- **Font**: `app/layout.tsx` — Bodoni Moda (titoli, con asse ottico) e
  Instrument Sans (testo), esposti come `--font-bodoni`/`--font-instrument`
  e mappati su `font-display`/`font-sans` in `globals.css`.
- **Motivo della scacchiera**: classe `.checker` e il segno davanti alle
  etichette (`.eyebrow::before`). Per un altro immobile si sostituisce
  con un segno che abbia un senso per quel luogo, o si toglie.
- **Movimento**: tutto in `app/globals.css` — ingresso delle pagine
  (`.page-enter`, da `app/template.tsx`), comparsa allo scorrimento
  (`.reveal`, e `.reveal-mask` per le foto che si scoprono come un
  sipario, via `components/Reveal.tsx`), titoli che salgono riga per riga
  (`.line-mask`), menu, pannelli e passi del check-in. Tutto rispetta
  `prefers-reduced-motion`.
- **Classi di componente** (`.btn`, `.field`, `.eyebrow`...): stanno in
  `@layer components`. Fuori da un layer vincerebbero sulle utility di
  Tailwind (`hidden`, `px-*`...) a prescindere dalla specificità.
- **Calendario** (`react-day-picker`, in `components/DateRangeCalendar.tsx`):
  il foglio di stile della libreria **non** si importa — ridefiniva
  l'accento in `blue` e, caricato dopo `globals.css`, lo sovrascriveva.
  Lo stile completo è nella sezione "Calendario" di `globals.css` e usa
  le variabili della palette.

## 4. Foto

```bash
node scripts/new-site.mjs init --foto materiale/foto --copertina <file> --nome <slug>
```

Lo script svuota `public/photos/` e ci mette le foto nuove già pronte:
ruotate secondo l'EXIF, ridimensionate a max 2560 px di lato lungo, in
JPEG e **senza metadati** (le foto da telefono contengono le coordinate
GPS della casa). Rigenera `public/og-image.jpg` dalla copertina, crea
anteprime da 800 px in `.new-site/anteprime/` e stampa l'elenco
`heroImage`/`gallery` (con larghezza e altezza) da incollare in
`property.ts`. Segnala le foto
troppo piccole per un'immagine a piena larghezza: quelle scaricate da
Airbnb/Booking sono spesso troppo compresse, meglio gli originali del
fotografo o dell'host. HEIC non è supportato: esportare prima in JPEG.

Gli originali restano fuori dal repo (`materiale/`, gitignorata).
`photos.items` in `dictionaries.ts` (alt e didascalie) è abbinato a
`gallery` **per posizione**: stesso ordine, stesso numero di voci.

L'ordine conta anche per la home: `PhotoMosaic` prende le prime foto
orizzontali e verticali che trova per riempire i quattro posti della
composizione. Mettere in testa le più belle, e almeno due verticali se
ci sono.

Lo stesso script, con `check`, cerca nel progetto i residui
dell'immobile del modello (nome, indirizzo, telefono, email, URL,
dominio, salvati da `init` prima di qualunque modifica) e i bloccanti
come il CIN vuoto. Va lanciato prima di considerare finito il sito.

## 4bis. Servizi

I servizi sono un elenco tipografico — nome e dettaglio — diviso in
gruppi (`amenities.groups` in `dictionaries.ts`, es. "Dentro" e "Fuori"),
**senza icone**: le icone generiche erano la parte del sito che sembrava
più fatta in serie. Il valore sta nel dettaglio scritto bene
("gratuito, davanti all'ingresso"), quindi ogni voce va scritta per
quella casa, nelle tre lingue, e solo con servizi confermati dal brief.

## 5. Variabili d'ambiente

Copiare `.env.local.example` in `.env.local` per lo sviluppo in locale.
In produzione le variabili stanno **su Cloudflare**, in due posti
diversi:

- **Build variables** (Worker → Settings → Builds): solo
  `NEXT_PUBLIC_SITE_URL` e `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, lette
  alla build e scritte nel codice;
- **Variables and Secrets** (Worker → Settings): tutte le altre, lette a
  runtime. Come *Secret* le credenziali (`SMTP_USER`, `SMTP_PASSWORD`,
  `CHECKIN_ZIP_PASSWORD`) e gli URL iCal, che contengono un token; come
  *Text* le altre. `keep_vars` in `wrangler.jsonc` evita che un deploy
  cancelli quelle impostate a mano.

**I file `.env` non vanno mai in un deploy fatto dal PC**: l'adapter
OpenNext ne copia i valori dentro il bundle del Worker, come ripiego per
le variabili mancanti. Per questo il deploy passa da Workers Builds, dove
quei file non esistono, e `npm run deploy` è preceduto da
`scripts/cf-deploy-guard.mjs`, che si ferma se trova valori non
`NEXT_PUBLIC_*`.

L'invio usa **SMTP generico**, non Gmail: le email portano dati personali
degli ospiti fino agli estremi del documento, e serve un fornitore con
accordo art. 28 GDPR, che un Gmail gratuito non ha. Brevo e Mailjet lo
includono anche nel piano gratuito. Stesso discorso per `HOST_EMAIL`, la
casella che *riceve*: vedi `LEGALE.md` §5.1.

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

## 6b. Richiesta di prenotazione diretta

`content/property.ts` ha un blocco `pricing` (`pricePerNight`,
`cleaningFee`, `minNights`, `minAdvanceDays`, `currency`) da compilare
con i valori del brief prima di attivare `/prenota` — di default
`pricePerNight` è `0`, che mostrerebbe un totale a zero se lasciato così.

Non serve altro codice né alcuna variabile d'ambiente oltre all'SMTP:
`/prenota` invia la richiesta via email all'host (con `replyTo`
dell'ospite) e una presa in carico all'ospite. Nessun pagamento, nessun
database.

**Stripe è stato rimosso dal modello** e non va reintrodotto per inerzia:
portava obblighi (PSD2, rimborsi, contestazioni) sproporzionati al volume
tipico di questi siti, e i Termini oggi dichiarano espressamente che il
sito non raccoglie dati di pagamento. Se un nuovo cliente li vuole
davvero, vanno riscritti anche `/termini` e l'informativa privacy.

## 6c. Dati legali (obbligatorio, vedi `LEGALE.md`)

Compilare `content/legal.ts` con i dati del §6c del brief. **Il CIN è il
campo che non si può saltare**: va indicato in ogni annuncio, sito
diretto compreso, con sanzione da 500 a 5.000 € se manca (art. 13-ter DL
145/2023). Compare automaticamente nel footer, nei Termini e nei dati
strutturati.

Attenzione a una trappola del modello: **i campi vuoti non vengono
mostrati**, quindi un sito senza CIN sembra a posto. Prima di consegnare,
verificare a video che il footer mostri davvero il codice.

Da compilare anche: `business` (ragione sociale, P.IVA, REA, sede, PEC),
`stay` (ore per il saldo, mezzi di pagamento, imposta di soggiorno) e
`providers.email`/`providers.mailbox` con il nome del fornitore SMTP e
della casella scelti al §5 — finiscono nell'elenco dei responsabili del
trattamento dell'informativa privacy.

Infine rileggere `content/legal-texts.ts` **insieme al cliente**:
descrivono come lavora lui (quando incassa, come cancella, quanti ospiti
accetta), e se non corrispondono il problema non è il testo.

## 7. Hosting su Cloudflare e dominio

I nuovi siti si pubblicano su **Cloudflare Workers**, tramite l'adapter
OpenNext (`@opennextjs/cloudflare`): esegue la build vera di Next, quindi
il codice è lo stesso che gira su Vercel, dove resta Campo Marzio 47.
Il piano gratuito di Cloudflare ammette l'uso commerciale (quello di
Vercel no, vedi `LEGALE.md` §6) e il contratto self-serve incorpora il
DPA art. 28 GDPR.

Cosa è già predisposto nel modello: `wrangler.jsonc` (nome del Worker,
`nodejs_compat` per nodemailer e archiver, binding `IMAGES` per
`next/image`, `keep_vars`), `open-next.config.ts` (cache di sola lettura
sugli asset statici: niente R2/KV/D1 da creare), `public/_headers`, e gli
script `npm run preview` (anteprima in locale sul runtime Workers) e
`npm run deploy` (protetto, vedi §5).

Passaggi:

1. Repo GitHub privato dedicato, con push del primo commit.
2. **Piano**: con Workers Free ogni richiesta ha 10 ms di CPU, pochi per
   una pagina Next renderizzata dal server e per il check-in (PDF + XML
   + ZIP), che rischiano l'errore 1102. **Workers Paid** costa 5 $/mese
   per account e copre tutti i Worker dell'account.
3. Workers & Pages → Create → **Import a repository**. Il nome del Worker
   deve coincidere con `name` in `wrangler.jsonc`, altrimenti la build
   fallisce. Build command `npx opennextjs-cloudflare build`, deploy
   command `npx opennextjs-cloudflare deploy`, build variables come al §5.
   Da qui ogni push su `main` ripubblica il sito, come faceva Vercel.
4. Variabili di runtime come al §5.
5. **Dominio**: va aggiunto a Cloudflare come zona (piano Free, cambio dei
   nameserver presso il registrar). Poi Worker → Domains → due Custom
   Domain, l'apex e il `www`: Cloudflare crea DNS e certificati da sé.
   Già che il DNS è su Cloudflare, aggiungere lì i record di
   autenticazione richiesti dal fornitore SMTP (SPF/DKIM), o le email
   del sito finiscono in spam. Senza dominio il sito resta su
   `<nome>.<sottodominio>.workers.dev`.

Due avvertenze:

- **Niente `export const revalidate`** nelle route: con la cache di sola
  lettura la risposta resterebbe congelata alla build. Per questo
  `/api/availability` è `force-dynamic`. Se un giorno servisse l'ISR, va
  configurata una cache R2 (vedi la documentazione OpenNext).
- **OpenNext su Windows funziona ma non è supportato ufficialmente**:
  `npm run preview` va bene per le prove, ma le build di produzione le fa
  Workers Builds su Linux.

## 7b. SEO

`NEXT_PUBLIC_SITE_URL` (build variable) va impostato al dominio reale
scelto al punto 7 **prima** del lancio — è usato per `sitemap.xml`,
`robots.txt`, il tag `canonical` e Open Graph (`app/layout.tsx`).

**È l'errore che costa di più**, perché non rompe niente e quindi non si
nota: il sito sul dominio nuovo continua a funzionare, ma ogni pagina
dichiara col canonical che l'originale sta sul vecchio indirizzo, e
Google mostra quello nei risultati. Tre cose devono dire lo stesso
indirizzo, o si contraddicono:

1. `NEXT_PUBLIC_SITE_URL` nelle build variables (Cloudflare) o nelle env
   var di produzione (Vercel);
2. `CANONICAL_HOST` in `next.config.ts`;
3. `ALIAS_HOSTS` in `next.config.ts`: gli altri indirizzi da cui il sito
   risponde (`<nome>.<sottodominio>.workers.dev`, `www.<dominio>`; su
   Vercel `<progetto>.vercel.app`), rediretti con 308 al dominio vero.
   Senza, restano in giro copie identiche del sito e i motori ne scelgono
   una a caso. Vanno aggiunti **solo quando il dominio risponde
   davvero**: prima, il redirect manderebbe gli ospiti su un indirizzo
   che non esiste.

Decidere se si vuole vedere nei risultati l'apex o il www, e allineare
tutti e tre: un canonical che punta a un URL che rimbalza viene ignorato.

`meta.title`/`meta.description` in `content/dictionaries.ts` (sezione
`it`) vanno riscritti per includere naturalmente termini che un host
locale userebbe per cercare l'immobile (tipo di alloggio + "affitto
breve"/"casa vacanze" + città) — non limitarsi al nome della proprietà.
Tenere `meta.description` **entro ~160 caratteri**: oltre, Google taglia
il testo nei risultati. Lo stesso vale per le description dedicate di
ogni pagina interna in `meta.pages` (`booking`, `checkin`, `contact` e
le tre pagine legali `privacy`, `cookies`, `terms`). La description di
`/prenota` e quella della home non devono promettere una prenotazione
immediata: il sito raccoglie **richieste** (vedi §6b).
I dati strutturati JSON-LD (`LodgingBusiness`, generati automaticamente
da `content/property.ts`) non richiedono modifiche manuali.

**Tag canonical — trappola da conoscere.** `app/layout.tsx` dichiara
`alternates: { canonical: "/" }`. In Next i metadati si ereditano: una
pagina che non lo sovrascrive dichiara di essere una copia della home e
Google la esclude dall'indice ("Pagina alternativa con tag canonical
appropriato" in Search Console). Per questo ogni pagina indicizzabile
prende i suoi metadati da `pageMetadata()` in `lib/seo.ts`:

```ts
export const metadata: Metadata = pageMetadata("booking", "/prenota");
```

Aggiungendo una nuova pagina indicizzabile: aggiungere la sua
description in `meta.pages` (it + en), usare `pageMetadata()` e
inserire la route in `app/sitemap.ts`. `lib/seo.ts` è anche l'unico
posto dove vive `siteUrl` (lo importano `sitemap.ts` e `robots.ts`).

**Immagine Open Graph.** `public/og-image.jpg` deve essere **1200x630**
e pesare poche decine di KB. Non puntare `ogImage` alla foto di
copertina a piena risoluzione: i crawler social (Facebook, WhatsApp,
LinkedIn, X) scaricano il file originale senza passare da `next/image`
e sopra i ~5 MB rinunciano del tutto all'anteprima. Per rigenerarla da
una foto nuova, con `sharp`:

```js
sharp("public/photos/copertina.jpg")
  .resize({ width: 1200, height: 630, fit: "cover" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/og-image.jpg");
```

**Favicon e icone del sito.** È l'icona che Google mostra accanto al
risultato di ricerca e il browser nella scheda: se resta quella di
default di `create-next-app`, il sito si presenta col logo di
Vercel. Tre file, tutti in `app/` (Next li riconosce dal nome e
genera da solo i `<link>`, non serve toccare `layout.tsx`):

| file                 | dimensioni  | dove si vede                          |
| -------------------- | ----------- | ------------------------------------- |
| `app/favicon.ico`    | 16/32/48 px | risultati Google, schede del browser  |
| `app/icon.png`       | 512 px      | schermi ad alta densità, anteprime    |
| `app/apple-icon.png` | 180 px      | schermata Home di iOS                 |

Per rigenerarli: `node scripts/generate-icons.mjs`, dopo aver cambiato
in cima allo script il testo del marchio (`MARK`, di solito
`property.nameAccent` o le iniziali) e i colori (`BG`/`FG`, da tenere
allineati alle variabili CSS di `app/globals.css`). Lo script è
commentato e va lanciato a mano: gli asset prodotti sono committati e
non entrano nella build.

Due vincoli da non perdere se si rifà il marchio a mano: deve reggere
a **16 px** (niente tratti sottili né testo lungo — alle dimensioni
piccole lo script usa il serif in grassetto proprio per questo), e
`apple-icon.png` deve essere un **quadrato pieno senza angoli
arrotondati**, perché iOS applica da sé la propria maschera.

Se il nuovo host ha già un logo suo, sostituire direttamente i tre
file (stesse dimensioni) e ignorare lo script.

**Peso delle foto.** Le foto in `public/photos/` vanno ridimensionate a
max ~2560px di lato lungo prima di committarle. `next/image` le
ottimizza comunque al volo, ma un originale da fotocamera (6000x4000,
12 MB) resta nel repo, rallenta build e prima ottimizzazione, e viene
servito intero a chiunque apra l'URL diretto del file.

Fuori dal codice, indispensabile e più efficace di qualunque
ottimizzazione on-page per ricerche locali: registrare/verificare una
scheda **Google Business Profile** per l'immobile e sottomettere il
sito su **Google Search Console** (richiede accesso Google dell'host,
non automatizzabile) — un sito nuovo, per quanto ben ottimizzato, spesso
non compare nei risultati finché non viene scoperto/indicizzato.

Per la verifica in Search Console il codice è già predisposto: impostare
`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` con il solo valore `content`
del tag proposto da Google (metodo "Tag HTML"), fare il deploy, poi
premere "Verifica". Se la variabile è vuota il meta tag non viene
emesso. Vedi §7c per la procedura completa.

`SEO-PROMOZIONE.md` raccoglie tutta la parte non tecnica (Search
Console, Google Business Profile, come ottenere link locali legittimi,
tempi realistici): è pensato per essere consegnato direttamente
all'host. Per un nuovo progetto va adattato ai riferimenti locali del
suo territorio (comune, pro loco, IAT, eventi).

**Dominio proprio, non `*.workers.dev` (o `*.vercel.app`).** Un
sottodominio della piattaforma è indicizzabile, ma per ricerche locali
competitive parte in forte svantaggio: non trasmette il brand, non è
collegabile a un Google Business Profile e non può essere verificato in
Search Console come proprietà di dominio (`workers.dev` e `vercel.app`
sono nella Public Suffix List, quindi si può usare solo una proprietà
"Prefisso URL"). Se l'host vuole davvero essere trovato su Google, il
dominio proprio è il primo investimento, prima di qualunque altra
ottimizzazione.

## 7c. Google Search Console (da fare a ogni nuovo sito)

Senza questo passaggio un sito nuovo può restare mesi fuori dall'indice.
Richiede l'account Google dell'host: non è automatizzabile dal codice.

1. [search.google.com/search-console](https://search.google.com/search-console)
   → "Aggiungi proprietà" → **Prefisso URL** → l'URL completo del sito
   (con `https://`). Con un dominio proprio si può usare anche
   "Dominio"; con un sottodominio `*.workers.dev` o `*.vercel.app` solo
   "Prefisso URL".
2. Metodo di verifica **Tag HTML**: Google mostra
   `<meta name="google-site-verification" content="ABC123..." />`.
   Copiare **solo** il valore di `content`. (Con la proprietà "Dominio" e
   il DNS su Cloudflare, la verifica via record TXT è ancora più rapida.)
3. Incollarlo in `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` nelle build
   variables di Cloudflare (su Vercel: Environment Variables, ambiente
   Production) e fare un nuovo deploy — la variabile è letta a build
   time, senza deploy il tag non compare.
4. Tornare su Search Console e premere "Verifica".
5. Menu **Sitemap** → inserire `sitemap.xml` → Invia.
6. Menu **Controllo URL** → incollare l'URL della home → "Richiedi
   indicizzazione". Ripetere per le pagine principali.

Poi, nelle settimane successive, controllare in **Indicizzazione →
Pagine** che le pagine risultino "Indicizzata" e non escluse. L'esclusione
più comune su questo modello è "Pagina alternativa con tag canonical
appropriato": significa che una pagina punta col canonical a un'altra
(vedi §7b).

## 7d. Statistiche di visita (facoltativo)

**Google Analytics è stato rimosso dal modello**, ed è una scelta
deliberata: era l'unico terzo a scrivere cookie, e la sua presenza
obbliga a un banner di consenso preventivo. Senza di lui resta solo il
cookie tecnico della lingua, esente da consenso, e la cookie policy può
dire con verità che il sito non traccia nessuno.

Se il cliente vuole delle statistiche, proporre uno strumento **senza
cookie**: su Cloudflare c'è Web Analytics, gratuito (Vercel Web Analytics
su Vercel Pro, oppure Plausible). Nessun banner; va però aggiunta una riga
all'informativa privacy, perché lo script di Cloudflare Web Analytics è
una richiesta a un dominio esterno (`static.cloudflareinsights.com`).

Reintrodurre GA non è "rimettere una variabile d'ambiente": servono un
banner che blocchi lo script fino al consenso, con rifiuto allo stesso
livello dell'accettazione, un modo per cambiare idea dopo, e la
riscrittura della cookie policy (che oggi afferma il contrario).

## 8. Verifica finale

- `node scripts/new-site.mjs check` senza residui né bloccanti.
- `npm run build` senza errori.
- Prova sul runtime Cloudflare **prima** del deploy: un
  `.env.production.local` che punta a `scripts/smtp-sink.mjs`
  (`SMTP_HOST=127.0.0.1`, `SMTP_PORT=2525`, utente e password qualsiasi,
  indirizzi `@example.test`), poi `npx opennextjs-cloudflare build` e
  l'anteprima su `localhost:8787`. Le email del sito finiscono come file
  `.eml` in `.smtp-sink/`, allegati compresi, senza un account SMTP vero
  e senza scrivere a nessuno. Alla fine cancellare
  `.env.production.local`, `.smtp-sink/` e `.open-next/` (che contiene
  in chiaro i valori dei file `.env`).
- Controllo visivo di ogni pagina in locale (home — incluse le sezioni
  Foto/Servizi/Dove siamo/Recensioni —, prenota, check-in, contatti), in
  IT, EN e DE, soprattutto su telefono,
  sia con lo stile scelto (§3ter) verificato in chiaro che tutti i testi
  restino leggibili con la nuova palette (contrasto testo/sfondo).
- Un check-in di prova end-to-end per confermare che l'email arrivi con
  i tre allegati (XML Ross1000, TXT Alloggiati, PDF) e **senza dati
  personali nel corpo del messaggio**.
- Se Ross1000 è attivo: caricamento di prova dell'XML generato sul
  portale ufficiale prima di usarlo con ospiti reali.
- Una richiesta di prenotazione di prova: devono arrivare due email
  (host e ospite) e l'host deve poter rispondere con "Rispondi".
- **Il footer mostra il CIN** su ogni pagina. Se non compare, il campo in
  `content/legal.ts` è vuoto e il sito non è pubblicabile (vedi §6c).
- `/privacy`, `/cookie-policy` e `/termini` rese in tutte e tre le lingue,
  senza righe vuote o segnaposto.
- Con gli strumenti di rete del browser: nessuna richiesta a domini
  esterni (`google-analytics.com`, `fonts.gstatic.com`) e, in
  `document.cookie`, solo il cookie della lingua.
- Percorso completo del check-in **solo da tastiera**, compreso il
  completamento di comune e stato: è il difetto di accessibilità che
  rendeva il sito inutilizzabile senza mouse.
- SEO, dal sorgente HTML di ogni pagina (tasto destro → "Visualizza
  sorgente"): `<link rel="canonical">` deve puntare **alla pagina
  stessa**, non alla home (§7b); `<title>` e `<meta name="description">`
  diversi da pagina a pagina; `og:image` che punta a `/og-image.jpg`.
  Poi `/sitemap.xml` deve elencare tutte e solo le pagine indicizzabili
  col dominio giusto, e `/robots.txt` puntare a quella sitemap.

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

Alta risoluzione sì, ma **non il file originale della fotocamera**:
ridimensionare a max ~2560px di lato lungo prima di committare (vedi
§7b). Tenere gli originali fuori dal repo, in `foto_campomarzio/`, che è
gitignorata apposta. Dopo aver cambiato la foto di copertina va
rigenerata anche `public/og-image.jpg` (§7b).

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
brief (credenziali SMTP e mittente, indirizzo destinatario, URL iCal se
disponibili, codice struttura Ross1000 se in Veneto). Impostare le
stesse variabili nelle Environment Variables del progetto Vercel prima
del primo deploy.

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

## 7. Dominio e deploy

Creare un nuovo repo GitHub dedicato, importarlo su Vercel come nuovo
progetto (non riusare il progetto Vercel del cliente precedente),
collegare il dominio del brief o lasciare il sottodominio
`<nome-progetto>.vercel.app`.

## 7b. SEO

`NEXT_PUBLIC_SITE_URL` (env var) va impostato al dominio reale scelto al
punto 7 **prima** del lancio — è usato per `sitemap.xml`, `robots.txt`,
il tag `canonical` e Open Graph (`app/layout.tsx`).

**È l'errore che costa di più**, perché non rompe niente e quindi non si
nota: il sito sul dominio nuovo continua a funzionare, ma ogni pagina
dichiara col canonical che l'originale sta sul vecchio indirizzo, e
Google mostra quello nei risultati. Tre cose devono dire lo stesso
indirizzo, o si contraddicono:

1. `NEXT_PUBLIC_SITE_URL` nelle env var di Vercel (ambiente Production);
2. `CANONICAL_HOST` in `next.config.ts`, da cui nasce il redirect
   permanente dal sottodominio `<progetto>.vercel.app` al dominio vero —
   senza, resta in giro una copia identica del sito a un secondo
   indirizzo, e i motori ne scelgono una a caso;
3. il **dominio primario** impostato su Vercel (Settings → Domains).

Sul punto 3: se Vercel ha come primario `www.tuosito.it`, l'apex
`tuosito.it` risponde 308 verso il www. Mettere l'apex in
`NEXT_PUBLIC_SITE_URL` significherebbe allora far puntare il canonical a
un URL che rimbalza. Decidere quale dei due si vuole vedere nei
risultati e allineare tutti e tre.

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

**Dominio proprio, non `*.vercel.app`.** Un sottodominio Vercel è
indicizzabile, ma per ricerche locali competitive parte in forte
svantaggio: non trasmette il brand, non è collegabile a un Google
Business Profile e non può essere verificato in Search Console come
proprietà di dominio (`vercel.app` è nella Public Suffix List, quindi
si può usare solo una proprietà "Prefisso URL"). Se l'host vuole
davvero essere trovato su Google, il dominio proprio è il primo
investimento, prima di qualunque altra ottimizzazione.

## 7c. Google Search Console (da fare a ogni nuovo sito)

Senza questo passaggio un sito nuovo può restare mesi fuori dall'indice.
Richiede l'account Google dell'host: non è automatizzabile dal codice.

1. [search.google.com/search-console](https://search.google.com/search-console)
   → "Aggiungi proprietà" → **Prefisso URL** → l'URL completo del sito
   (con `https://`). Con un dominio proprio si può usare anche
   "Dominio"; con un sottodominio `*.vercel.app` solo "Prefisso URL".
2. Metodo di verifica **Tag HTML**: Google mostra
   `<meta name="google-site-verification" content="ABC123..." />`.
   Copiare **solo** il valore di `content`.
3. Incollarlo in `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` nelle
   Environment Variables di Vercel (ambiente Production) e fare un nuovo
   deploy — la variabile è letta a build time, senza deploy il tag non
   compare.
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
cookie**: Vercel Web Analytics (incluso nel piano Pro) o Plausible.
Nessun banner, nessuna modifica ai testi legali.

Reintrodurre GA non è "rimettere una variabile d'ambiente": servono un
banner che blocchi lo script fino al consenso, con rifiuto allo stesso
livello dell'accettazione, un modo per cambiare idea dopo, e la
riscrittura della cookie policy (che oggi afferma il contrario).

## 8. Verifica finale

- `npm run build` senza errori.
- Controllo visivo di ogni pagina in locale (home — incluse le sezioni
  Foto/Servizi/Recensioni —, prenota, check-in, contatti), sia IT che EN,
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
- `/privacy`, `/cookie-policy` e `/termini` rese in entrambe le lingue,
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

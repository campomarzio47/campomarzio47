# Farsi trovare su Google — piano per Campo Marzio 47

Documento operativo per l'host. Il lavoro tecnico sul sito (meta tag,
sitemap, dati strutturati, velocità) è già fatto e descritto in
`TEMPLATE-SETUP.md` §7b. Quello che segue è la parte che **non si
risolve scrivendo codice**: farsi scoprire, farsi linkare, farsi
indicizzare.

## Premessa onesta

Un sito piccolo per un singolo immobile non competerà mai con
Airbnb e Booking.com sulle ricerche generiche tipo "casa vacanze
Marostica": quei portali hanno decenni di autorità e migliaia di link.

L'obiettivo realistico è diverso, e raggiungibile:

1. **Ricerche col nome** ("Campo Marzio 47", "campo marzio 47 marostica")
   → il sito deve essere il primo risultato. Questo è del tutto alla
   nostra portata.
2. **Ricerche locali a coda lunga** ("casa con giardino Marostica",
   "alloggio partita a scacchi Marostica") → qui si può competere.
3. **Traffico di ritorno**: chi vi ha scoperto su Airbnb e poi cerca il
   vostro nome per chiedervi le date direttamente, senza commissioni.

Sul punto 3 meglio non farsi illusioni: finora dal sito non è arrivata
nessuna richiesta diretta, e oggi lo usano soprattutto gli ospiti già
prenotati per il check-in. Per quegli ospiti conta il punto 1: chi cerca
"Campo Marzio 47" deve trovare il sito subito, non un risultato di terzi.
Le richieste dirette sono un possibile guadagno in più, non la ragione
per cui il sito esiste.

## Ordine di priorità

### 1. Google Business Profile — il passo più importante

Più efficace di qualunque ottimizzazione on-page per le ricerche locali,
e gratuito. Crea la scheda che compare a destra nei risultati e su Maps.

- Registrarla su [google.com/business](https://www.google.com/business/)
  come struttura ricettiva, all'indirizzo di Via Campo Marzio 47.
- Inserire il sito come URL ufficiale → è anche un link verso il sito.
- Caricare le stesse foto del sito, orari di check-in/out, contatti.
- Chiedere agli ospiti soddisfatti una recensione Google (diversa da
  quelle Airbnb): pesano molto nel ranking locale.

La verifica richiede di solito una cartolina con codice all'indirizzo
fisico: mettere in conto 1-2 settimane.

### 2. Search Console — senza questo si resta invisibili

Procedura completa in `TEMPLATE-SETUP.md` §7c. In sintesi: verificare la
proprietà, inviare `sitemap.xml`, chiedere l'indicizzazione della home.

Un sito nuovo che nessuno linka può restare **mesi** fuori dall'indice
semplicemente perché Google non sa che esiste. Questo passaggio è quello
che risolve il problema "Google non mostra il mio sito".

### 3. Dominio proprio — fatto, ma va detto a Google

`campomarzio47.it` è registrato e collegato a Vercel. Attenzione però:
collegare il dominio **non basta**, ed è un errore che non dà nessun
segnale di allarme.

Per un periodo il sito ha risposto sul dominio nuovo continuando a
dichiarare, in ogni pagina, che l'indirizzo ufficiale era
`campomarzio47.vercel.app` (tag `canonical`, sitemap e `robots.txt`).
Google ha fatto quello che gli veniva detto e mostrava il sottodominio
Vercel nei risultati.

Quando si cambia dominio devono cambiare insieme:

1. `NEXT_PUBLIC_SITE_URL` nelle env var di Vercel, **con un nuovo
   deploy** (è letta al momento della build: senza deploy non cambia
   nulla);
2. il redirect permanente dal vecchio indirizzo al nuovo
   (`next.config.ts`), per non lasciare due copie identiche del sito;
3. una nuova proprietà in Search Console per il dominio nuovo, con la
   sua sitemap.

Tempi: dopo il deploy Google impiega **da qualche giorno a qualche
settimana** a sostituire il vecchio indirizzo col nuovo. Chiedere
l'indicizzazione della home in Search Console accorcia l'attesa.

## I link: cosa cercare, in che ordine

Regola generale: pochi link **pertinenti e locali** valgono molto più di
molti link generici. Non comprare mai pacchetti di backlink — nel
migliore dei casi sono inutili, nel peggiore fanno penalizzare il sito.

### Link facili e legittimi, da fare subito

- **I vostri canali**: la firma email, un eventuale account
  Instagram/Facebook della casa. Sono link "nofollow" (non passano
  autorità diretta) ma portano persone reali, che è il punto.
- **Attenzione, NON negli annunci Airbnb/Booking.** Le regole delle
  piattaforme vietano di inserire link esterni o contatti nell'annuncio
  e nei messaggi prima della prenotazione, proprio per impedire di
  dirottare gli ospiti fuori piattaforma: la violazione può costare la
  sospensione dell'annuncio, cioè molto più di quanto qualunque link
  possa rendere. Mandare il link del check-in a un ospite con
  prenotazione già confermata è un'altra cosa, ma prima di farlo
  verificate le regole correnti della piattaforma.
- **Google Business Profile** (vedi sopra).
- **Comune di Marostica / Pro Loco**: molti comuni e pro loco tengono un
  elenco delle strutture ricettive del territorio. Chiedere di essere
  inseriti: è il link più pertinente che possiate ottenere.
- **Consorzi e IAT turistici**: l'ufficio IAT di Marostica e i consorzi
  di promozione dell'area Bassano/Altopiano di Asiago/Vicenza. Spesso
  l'inserimento è gratuito per le strutture del territorio.
- **Associazioni di categoria**: se aderite a un'associazione di host o
  di affitti brevi, quasi sempre c'è un elenco soci pubblico.

### Link che richiedono un po' di lavoro

- **Eventi del territorio**: Marostica ha richiami forti e ricorrenti —
  la Partita a Scacchi a personaggi viventi, la Ciliegia di Marostica
  IGP, i castelli e le mura. I siti degli eventi e i blog che li
  raccontano spesso elencano "dove dormire". Proporsi nei mesi
  precedenti all'evento, non durante.
- **Attività locali complementari**: ristoranti, cantine, noleggio bici,
  guide escursionistiche. Uno scambio onesto ("io segnalo voi ai miei
  ospiti, voi segnalate me") è utile a entrambi e del tutto legittimo.
- **Blog di viaggio** che coprono il Veneto minore. Un'ospitalità
  offerta in cambio di una recensione sincera è una pratica accettata,
  purché la recensione resti indipendente.

### Da evitare

- Pacchetti di backlink a pagamento, scambi link massivi, commenti nei
  forum con link. Google li riconosce e possono costare una
  penalizzazione.
- Directory generiche di bassa qualità che accettano qualunque sito:
  inutili.
- Recensioni finte, su Google o altrove. Oltre a essere vietate, sono
  facilmente riconoscibili.

## Contenuto: il modo più sostenibile di guadagnare link

Il sito oggi è volutamente breve — è una scelta di design, non un
difetto. Ma se in futuro si volesse competere su più ricerche, la via è
aggiungere contenuto che qualcuno abbia motivo di linkare, per esempio
una pagina "Cosa fare a Marostica" scritta davvero bene (dove
parcheggiare, quando c'è la Partita a Scacchi, i sentieri, le ciliegie a
giugno).

Attenzione: una pagina così va aggiunta **come nuova route
indicizzabile**, con i suoi metadati via `pageMetadata()` e la route in
`app/sitemap.ts` — vedi `CLAUDE.md`, sezione SEO. Non basta creare il
file.

## Aspettative sui tempi

- **Giorni**: indicizzazione della home dopo la richiesta in Search
  Console.
- **2-6 settimane**: comparsa stabile sulle ricerche col nome della
  proprietà; verifica del Google Business Profile.
- **3-6 mesi**: primi risultati sulle ricerche locali a coda lunga, se
  nel frattempo sono arrivati link locali e recensioni.

Se dopo un mese dalla verifica in Search Console la home non compare
cercando "Campo Marzio 47", qualcosa non va: controllare in
**Indicizzazione → Pagine** il motivo dell'esclusione.

## Checklist

- [ ] Search Console verificata, sitemap inviata, indicizzazione richiesta
- [ ] Google Business Profile creato e verificato, con link al sito
- [ ] Dominio proprio acquistato e collegato, `NEXT_PUBLIC_SITE_URL` aggiornata
- [ ] Sito inserito negli elenchi di Comune / Pro Loco / IAT
- [ ] Link dai profili social e dalla firma email
- [ ] Prime recensioni Google chieste agli ospiti
- [ ] Controllo in Search Console dopo un mese

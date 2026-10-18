# Procedura: da foto e informazioni a sito pubblicato

È la procedura che segue la skill `/nuovo-sito`
(`~/.claude/skills/nuovo-sito/SKILL.md`, che rimanda qui). Sta nel
modello, e non nella skill, perché cambia insieme al codice: chi modifica
il modello aggiorna anche questo file. È scritta per Claude ma si legge
anche da persone: è l'elenco completo, nell'ordine giusto, di cosa serve
per passare da "ecco le foto e due righe sulla casa" a un sito online su
Cloudflare.

I dettagli tecnici di ogni passaggio stanno in `TEMPLATE-SETUP.md`; le
domande per il cliente in `TEMPLATE-BRIEF.md`; gli obblighi legali in
`LEGALE.md`. Qui c'è l'ordine e le decisioni.

## Regole che valgono per tutta la procedura

- **Il codice del modello non si tocca.** Cambiano contenuti (`content/`),
  foto, palette e font, configurazione. L'unica eccezione prevista è il
  motivo grafico della scacchiera (`TEMPLATE-SETUP.md` §3ter), che è di
  Marostica e per un altro luogo va sostituito o tolto. Se un brief
  richiede altro codice (una regione diversa dal Veneto, prezzi
  stagionali, una lingua in più), fermati e dillo: è lavoro sul modello,
  da fare lì e poi riportare qui, non una variante locale.
- **Una sola tornata di domande.** Prima leggi tutto il materiale, poi
  chiedi in un colpo solo quello che manca. Mai una domanda alla volta.
- **Mai inventare dati.** CIN, P.IVA, prezzi, recensioni, servizi, orari:
  se non li hai, il campo resta vuoto. Il sito omette i campi vuoti e
  `node scripts/new-site.mjs check` li segnala; un dato inventato invece
  passa inosservato fino a quando un ospite ci fa affidamento. Un CIN
  sbagliato è peggio di un CIN assente.
- **Fuori dalla cartella solo con un sì esplicito**: creare il repo
  GitHub, fare push, pubblicare, inviare email vere. Approvare un passo
  non vale per il successivo.
- **Le credenziali non passano da te.** Password SMTP, password dello ZIP
  e URL iCal (contengono un token) l'utente li inserisce direttamente
  nella dashboard Cloudflare. Tu prepari l'elenco di cosa inserire.

## Fase 0 — Cartella di lavoro

1. Il modello è in `C:\Users\fv28\campomarzio_website`, branch `main`.
   Viene copiato **l'ultimo commit**: se
   `git -C <modello> status --porcelain` non è vuoto, avvisa che le
   modifiche non committate non verranno copiate.
2. Il nuovo sito nasce nella **cartella corrente**. Deve contenere solo
   il materiale del cliente. Fermati e chiedi se contiene già un
   `package.json` o se è il modello stesso.
3. Sposta il materiale in `materiale/`, con le foto in `materiale/foto/`.
   Resterà fuori da git: contiene originali pesanti e a volte documenti
   personali.

## Fase 1 — Leggere tutto il materiale

- Testi: un brief compilato (`TEMPLATE-BRIEF.md`), note libere, email
  incollate, PDF, link agli annunci. Se c'è un link Airbnb o Booking prova
  a leggerlo per descrizione, servizi e capienza. I dati legali non si
  prendono mai da lì.
- Foto: per ora basta l'elenco. Le guardi dopo, nelle anteprime (Fase 3).
- Scrivi `BRIEF.md` nella cartella, con la struttura di
  `TEMPLATE-BRIEF.md`: quello che sai è compilato, quello che manca è
  marcato `[MANCA]`. Diventa la memoria del progetto, anche se il lavoro
  riprende in un'altra sessione.

## Fase 2 — Domande, tutte insieme

Per **costruire** il sito servono: nome, tipo di alloggio, indirizzo;
host (nome, telefono, email pubblica, lingue); capienza (ospiti, camere,
letti, bagni, m²); servizi; prezzo per notte, pulizie, notti minime;
nome tecnico (slug, es. `villa-rossi`: diventa il nome del Worker e del
repo).

Per **pubblicarlo** servono, ma possono arrivare dopo: il CIN; i dati
dell'impresa, se c'è P.IVA; l'imposta di soggiorno; per le email il
fornitore SMTP, il mittente e la casella che riceve; l'account Cloudflare;
il dominio.

Le decisioni vanno proposte con le opzioni pronte (AskUserQuestion):

- **Stile**: tenere quello di Campo Marzio 47 o una proposta ricavata
  dalle foto (palette, font). Vedi `TEMPLATE-SETUP.md` §3ter.
- **Regione**: in Veneto basta `ROSS1000_CODICE_STRUTTURA`. Fuori dal
  Veneto l'XML Ross1000 **non va usato**: il file per la Questura
  (Alloggiati) e il PDF valgono ovunque, mentre la comunicazione
  statistica regionale ha un tracciato diverso. Il sito si può fare lo
  stesso, ma l'host deve saperlo e serve un lavoro a parte sul modello
  (proponilo come attività separata).
- **ZIP cifrato** degli allegati del check-in: di default spento, perché
  per aprirlo serve 7-Zip.
- **Account Cloudflare**: quello dell'host (consigliato: il contratto è
  suo) o quello di chi gestisce il sito (allora serve un accordo art. 28
  tra le parti, vedi `LEGALE.md`).

Valori predefiniti, da non chiedere salvo indicazioni contrarie: 2 notti
minime, 2 giorni di preavviso, saldo 24 ore prima dell'arrivo,
cancellazione gratuita fino al saldo, animazioni attuali.

## Fase 3 — Creare il progetto

```bash
git -C "C:/Users/fv28/campomarzio_website" archive --format=tar main | tar -xf - -C .
```

`git archive` porta solo i file del repository: niente `node_modules`,
`.next`, `.env.local`, foto originali, né la storia di Campo Marzio 47.
Per lo stesso motivo il nuovo repo non ha alcun remote, quindi un push
non può finire per sbaglio sul sito di un altro host. Poi:

```bash
printf '\n# materiale originale del cliente (foto, testi)\n/materiale/\n' >> .gitignore
git init -b main
npm ci
node scripts/new-site.mjs init --foto materiale/foto --copertina <file> --nome <slug>
```

`init` salva le impronte del modello (servono a `check`), sostituisce le
foto, rigenera l'immagine Open Graph e imposta lo slug in `package.json` e
`wrangler.jsonc`. Guarda le anteprime in `.new-site/anteprime/`: se un'altra
foto è una copertina migliore, rilancia `init` con quella (le impronte
restano quelle originali). Segnala all'utente le foto che `init` marca come
a bassa risoluzione.

Rinomina le configurazioni in `.claude/launch.json` (`campomarzio-*` →
`<slug>-*`).

## Fase 4 — Contenuti

Nell'ordine di `TEMPLATE-SETUP.md`:

1. **`content/property.ts`**: tutti i campi, compresi `pricing`, `heroImage`
   e `gallery` (incolla l'elenco stampato da `init`). Le recensioni vanno
   messe solo se reali e verificabili, nella lingua originale. Senza
   recensioni: `reviews: [] as readonly Review[]`, e la sezione sparisce
   da sola. Un URL Airbnb o Booking vuoto toglie il link corrispondente.
2. **`content/dictionaries.ts`**, in `it`, `en` **e** `de`: le chiavi di
   `TEMPLATE-SETUP.md` §3, più ogni riga che `check` segnala. Il tedesco
   non è facoltativo: il selettore di lingua lo offre su ogni pagina.
   `photos.items` va **nello stesso ordine di `gallery`**, perché è
   abbinato per indice. Le description restano entro ~160 caratteri e non
   devono promettere una prenotazione immediata.
3. **Servizi e luogo**: `amenities.groups` e `place` nelle tre lingue
   (§3 e §4bis), solo con dati del brief. Se il brief non dice nulla del
   luogo, `place.title` resta vuoto e la sezione sparisce.
4. **`content/legal.ts`**: `business`, `codes`, `stay` dai dati del brief.
   `providers.hosting` diventa `Cloudflare, Inc.`, con paese «Stati Uniti,
   con data center anche nell'Unione Europea», in inglese «United States,
   with data centres also in the European Union» e in tedesco
   «Vereinigte Staaten, mit Rechenzentren auch in der Europäischen Union»
   (campi `*En` e `*De`, anche per finalità e conservazione). Poi
   `providers.email` e
   `providers.mailbox` dal brief, e `privacy.lastUpdated` alla data di
   oggi.
5. **`content/legal-texts.ts`**: leggilo tutto, confrontalo con il brief
   (saldo, cancellazione, numero di ospiti) e segnala le differenze invece
   di correggerle in silenzio. Sono le condizioni che l'host propone agli
   ospiti.
6. **Stile**: palette in `app/globals.css` (`:root`), font in
   `app/layout.tsx`. Verifica il contrasto (almeno 4,5:1 per il testo)
   tra `--color-charcoal` e `--color-mid` sullo sfondo, e tra il bianco e
   l'accento dei bottoni.
7. **Icone**: `MARK`/`BG`/`FG` in `scripts/generate-icons.mjs`, poi
   `node scripts/generate-icons.mjs`.
8. **Configurazione**: in `next.config.ts` metti `CANONICAL_HOST` al
   dominio definitivo e lascia **`ALIAS_HOSTS = []`** finché il dominio
   non risponde (Fase 6). Imposta l'URL di ripiego in `lib/seo.ts`. Crea
   `.env.local` da `.env.local.example` con i soli valori non segreti.
9. **Documenti del nuovo sito**:
   - `CLAUDE.md`: titolo, immobile, città, repo, dominio, hosting
     Cloudflare;
   - `LEGALE.md`: **rifatto da capo** per questo host, con la stessa
     struttura, e al posto del §6 su Vercel una sezione hosting: su quale
     account Cloudflare sta il sito; se non è dell'host, chi lo gestisce
     diventa responsabile del trattamento e serve un accordo art. 28; il
     piano scelto;
   - `SEO-PROMOZIONE.md`: riferimenti locali (comune, pro loco, IAT);
   - `README.md`: due righe su cos'è e i comandi.

## Fase 5 — Verifica in locale

1. `node scripts/new-site.mjs check`: zero residui. L'unico bloccante
   ammesso a questo punto è il CIN, se l'utente ha detto che arriva dopo.
2. `npm run lint` (solo i file del progetto, vedi CLAUDE.md) e
   `npm run build`.
3. Prova sul runtime Cloudflare con email finte:
   - crea `.env.production.local` con `SMTP_HOST=127.0.0.1`,
     `SMTP_PORT=2525`, `SMTP_USER=prova`, `SMTP_PASSWORD=prova`,
     `MAIL_FROM=sito@example.test`, `HOST_EMAIL=host@example.test`,
     `NEXT_PUBLIC_SITE_URL=http://localhost:8787`. Vince su `.env.local`
     e non spedisce niente a nessuno;
   - in background, `node scripts/smtp-sink.mjs`;
   - `npx opennextjs-cloudflare build`, poi l'anteprima con la
     configurazione `<slug>-cloudflare` di `.claude/launch.json`
     (porta 8787).
4. Nell'anteprima controlla:
   - tutte le pagine, in italiano, inglese e tedesco, su desktop e
     soprattutto su telefono (è da lì che arriva la maggior parte degli
     ospiti);
   - il footer con il CIN;
   - un check-in completo **solo da tastiera**, comune e stato compresi;
   - un messaggio di contatto e una richiesta di prenotazione.

   Nei file `.eml` salvati in `.smtp-sink/` devono esserci i tre allegati
   del check-in, e il corpo **non** deve contenere i dati del documento.
5. Cancella `.env.production.local`, `.smtp-sink/` e `.open-next/`:
   `.open-next/` contiene in chiaro i valori dei file `.env`.
6. Mostra gli screenshot all'utente e correggi testi e stile finché non
   va bene.

## Fase 6 — Pubblicazione su Cloudflare

Ogni punto che esce dalla cartella va fatto solo dopo un sì.

1. **Commit** iniziale nel nuovo repo.
2. **GitHub**: chiedi proprietario e nome, poi
   `gh repo create <proprietario>/<slug> --private --source . --remote origin --push`.
3. **Piano Cloudflare.** Col piano Free un Worker ha **10 ms di CPU per
   richiesta**: una pagina Next renderizzata dal server ci sta a fatica, e
   il check-in (PDF, XML ed eventuale ZIP) rischia l'errore 1102. Consiglia
   **Workers Paid** (5 $/mese per account, copre tutti i Worker
   dell'account). Il Free resta possibile, ma dillo all'utente.
4. **Collegare il repo** (lo fa l'utente; tu gli dai i valori esatti).
   Workers & Pages → Create → Import a repository, poi:
   - nome del Worker = slug (deve coincidere con `wrangler.jsonc`);
   - build command `npx opennextjs-cloudflare build`;
   - deploy command `npx opennextjs-cloudflare deploy`;
   - build variables: `NEXT_PUBLIC_SITE_URL` (e più avanti
     `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`). Si leggono alla build:
     cambiarle senza un nuovo deploy non ha effetto.
5. **Variabili di runtime**: Settings → Variables and Secrets. Prepara
   una tabella con i valori non segreti già compilati:
   - come *Secret*: `SMTP_USER`, `SMTP_PASSWORD`, `AIRBNB_ICAL_URL`,
     `BOOKING_ICAL_URL`, `CHECKIN_ZIP_PASSWORD`;
   - come *Text*: `SMTP_HOST`, `SMTP_PORT`, `MAIL_FROM`, `HOST_EMAIL`,
     `ROSS1000_*`.

   Non usare `npm run deploy` dal PC: OpenNext metterebbe nel Worker i
   valori dei file `.env` locali, ed è per questo che
   `scripts/cf-deploy-guard.mjs` lo blocca.
6. **Primo deploy**: parte al primo push dopo il collegamento. Leggi
   l'indirizzo `https://<slug>.<sottodominio>.workers.dev` e controlla le
   pagine. Se il connettore Cloudflare è disponibile, verifica che il
   Worker esista nell'account giusto.
7. **Dominio.**
   - **Con dominio**: va aggiunto a Cloudflare come zona (piano Free) e i
     nameserver vanno cambiati presso il registrar. Poi, nel Worker, scheda
     Domains: due Custom Domain, l'apex e il `www`. Nel codice:
     `CANONICAL_HOST` = dominio, `ALIAS_HOSTS` = `["<slug>.<sottodominio>.workers.dev", "www.<dominio>"]`;
     nella build variable, `NEXT_PUBLIC_SITE_URL=https://<dominio>`.
     Commit e push. Controlla con `curl -I` che gli alias rispondano 308
     verso il dominio. Già che il DNS è su Cloudflare, aggiungi i record
     di autenticazione del dominio richiesti dal fornitore SMTP (Brevo:
     Senders & Domains), altrimenti le email finiscono in spam.
   - **Senza dominio**: `CANONICAL_HOST` = l'host `workers.dev`,
     `ALIAS_HOSTS = []`, `NEXT_PUBLIC_SITE_URL` lo stesso indirizzo.
     Spiega all'utente i limiti per la SEO (`TEMPLATE-SETUP.md` §7b).
8. **Prova reale**, previo sì: un check-in con dati fittizi, un contatto,
   una richiesta di prenotazione. L'host deve ricevere le email e poter
   rispondere con "Rispondi".
9. **Google**: Search Console e Google Business Profile si fanno con
   l'account Google dell'host (`TEMPLATE-SETUP.md` §7c). Consegna
   `SEO-PROMOZIONE.md`.

## Fase 7 — Consegna

Riassumi all'utente:

- l'indirizzo del sito;
- cosa resta in capo all'host: CIN esposto anche fuori dallo stabile,
  i punti aperti di `LEGALE.md` e Search Console;
- i costi ricorrenti: Workers Paid se scelto, dominio (10-15 € l'anno),
  SMTP (gratuito nei piani base);
- dove sono le cose: il repo, `BRIEF.md`, `LEGALE.md`.

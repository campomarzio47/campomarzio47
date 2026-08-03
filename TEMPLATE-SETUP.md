# Come adattare questo repo a un nuovo host/immobile

Questo sito è stato costruito per "Campo Marzio 47" ma il codice non ha
più riferimenti hardcoded al nome/città/host: tutto il contenuto
specifico dell'immobile vive in `content/`. Per generare un nuovo sito a
partire da un brief compilato con `TEMPLATE-BRIEF.md`, seguire questi
passaggi in ordine.

## 1. Clonare il progetto

Copiare l'intera cartella (o `git clone` di questo repo) in una nuova
cartella/repo per il nuovo cliente. Non riusare lo stesso repo Vercel/
GitHub del cliente precedente.

## 2. `content/property.ts`

Sostituire tutti i valori con quelli del brief: `name`, `nameAccent`,
`type`, `address`, `host`, `facts`, `booking`, `reviews`, `heroImage`,
`gallery`. Questo file guida logo, hero, meta title delle pagine, PDF di
check-in e il nome "prodotto" di default nell'XML Ross1000 — va sempre
aggiornato per primo.

## 3. `content/dictionaries.ts`

A differenza di `property.ts`, questo file contiene sia UI generica
(riusabile senza modifiche: label dei form, bottoni, testi del check-in)
sia testi discorsivi specifici dell'immobile che vanno riscritti a mano,
in entrambe le lingue (`it` e `en`):

- `home.meta.title` / `home.meta.description`
- `home.tagline`
- `home.description`
- `photos.subtitle` (cita il nome della proprietà)
- `contact.subtitle` (cita il nome dell'host)
- messaggio di conferma del form di check-in (cita la città)

Cercare nel file le occorrenze del vecchio nome proprietà/città per non
dimenticarne nessuna prima di considerare la traduzione completa.

## 3bis. Home page: hero minimale + barra "Verifica disponibilità"

La home (`app/page.tsx` + `components/Hero.tsx`) è volutamente minimale:
l'hero mostra solo foto a piena larghezza + nome della proprietà; `hero.tagline`
e `hero.description` (da `dictionaries.ts`) vengono renderizzati subito sotto,
in una sezione separata, non nell'hero stesso. `components/AvailabilityBar.tsx`
aggiunge una barra fissa in fondo pagina (solo nella home) con selezione
Arrivo/Partenza che reindirizza a `/prenota?from=...&to=...` — non richiede
setup aggiuntivo, ma se il nuovo host non vuole i pagamenti diretti (vedi
`TEMPLATE-BRIEF.md`) va rimossa o puntata altrove (es. `/disponibilita`).

## 4. Foto

Sostituire i file in `public/photos/` con quelli del nuovo immobile,
mantenendo `heroImage` e `gallery` in `property.ts` allineati ai nomi
file effettivi. Preferire sempre foto ad alta risoluzione per l'hero (le
foto scaricate direttamente da Airbnb/Booking sono spesso troppo
compresse per un'immagine a piena larghezza).

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
assumendo che sia lo stesso formato ovunque.

## 6b. Prenotazione diretta con pagamento (Stripe)

`content/property.ts` ha un blocco `pricing` (`pricePerNight`,
`cleaningFee`, `minNights`, `currency`) da compilare con i valori del
brief prima di attivare `/prenota` — di default `pricePerNight` è `0`,
che mostrerebbe un totale a zero se lasciato così.

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

## 8. Verifica finale

- `npm run build` senza errori.
- Controllo visivo di ogni pagina in locale (home, foto, servizi,
  recensioni, disponibilità, contatti, check-in), sia IT che EN.
- Un check-in di prova end-to-end per confermare che l'email arrivi con
  XML + PDF allegati.
- Se Ross1000 è attivo: caricamento di prova dell'XML generato sul
  portale ufficiale prima di usarlo con ospiti reali.
- Se la prenotazione diretta è attiva: una prenotazione di prova in
  modalità Stripe TEST end-to-end, prima di attivare le chiavi live
  (vedi §6b).

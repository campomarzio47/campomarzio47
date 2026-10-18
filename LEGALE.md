# Cosa compilare prima di pubblicare

Il sito è predisposto per essere in regola, ma **non lo è finché non
compili i campi qui sotto**. I campi vuoti non vengono mostrati agli
ospiti (meglio una riga in meno che un segnaposto), quindi a occhio il
sito sembra a posto anche quando non lo è: questa pagina serve proprio a
non fidarsi di quell'apparenza.

---

## 1. Urgente: il CIN

> **Senza CIN indicato sul sito la sanzione va da 500 a 5.000 €**, con
> rimozione dell'annuncio irregolare. Dal 2 gennaio 2025 il Codice
> Identificativo Nazionale va indicato in *ogni* annuncio ovunque
> pubblicato — Airbnb, Booking.com **e il tuo sito diretto** (art. 13-ter
> DL 145/2023).

Apri [`content/legal.ts`](content/legal.ts) e compila:

```ts
codes: {
  cin: "IT024065...",   // ← il tuo CIN dalla BDSR
  cir: "",              // Codice Identificativo Regionale (Veneto)
}
```

Il CIN compare subito nel footer di ogni pagina, nei Termini e nei dati
strutturati per i motori di ricerca. Il CIR lo trovi su Ross1000 alla voce
"CODICE REGIONE" nell'anagrafica: in Veneto non è obbligatorio negli
annunci, ma indicarlo non costa nulla.

**Questo non basta:** il CIN va esposto anche fisicamente all'esterno
dello stabile, vicino al nome dell'immobile. Il codice non può farlo per te.

---

## 2. Dati dell'impresa

Sempre in [`content/legal.ts`](content/legal.ts), sezione `business`.
Servono all'art. 7 del D.Lgs. 70/2003 (obblighi informativi di chi presta
un servizio online) e all'art. 2250 del codice civile.

| Campo | Cosa mettere | Dove lo trovi |
|---|---|---|
| `legalName` | Ragione sociale o denominazione | Visura camerale |
| `vatNumber` | Partita IVA | Visura camerale |
| `taxCode` | Codice fiscale | Visura camerale |
| `rea` | Ufficio e numero REA, es. `Vicenza, REA VI-123456` | Visura camerale |
| `registeredOffice` | Sede legale completa | Visura camerale |
| `pec` | Indirizzo PEC | Il tuo gestore PEC |

Finché `legalName` è vuoto il sito ripiega sul nome dell'host
(`Francesco`) e sull'indirizzo dell'immobile: funziona, ma non è l'identità
dell'impresa e non soddisfa l'obbligo.

---

## 3. Condizioni di soggiorno

Sezione `stay` di [`content/legal.ts`](content/legal.ts). Questi valori
finiscono **testualmente nei Termini e condizioni**, quindi cambiarli
cambia il contratto che proponi agli ospiti. Leggili prima di pubblicare.

| Campo | Ora | Nota |
|---|---|---|
| `paymentDueHoursBeforeArrival` | `24` | Ore entro cui deve arrivare il saldo, cioè quando generi il codice d'accesso |
| `paymentMethods` | vuoto | Es. `"bonifico bancario"`. Se resta vuoto i Termini dicono che li comunichi nell'email di conferma |
| `freeCancellationDays` | `7` | Solo con i pagamenti Stripe attivi: fino a quanti giorni prima dell'arrivo l'ospite cancella con rimborso totale (deciso il 18 ottobre 2026). Dopo, nessun rimborso |
| `checkInFrom` / `checkOutBy` | vuoti | Orari, se vuoi dichiararli |
| `touristTax.applies` | `null` | **Da verificare in Comune.** Vedi sotto |

### Imposta di soggiorno

Finché `touristTax.applies` resta `null`, i Termini usano una formula
prudente: «se il Comune applica l'imposta di soggiorno, non è compresa nel
prezzo e si versa sul posto». È corretta ma vaga. Chiedi all'ufficio
tributi del Comune di Marostica e poi imposta:

- `applies: false` → i Termini dichiarano che il prezzo è tutto compreso;
- `applies: true` + `details: "1,50 € a persona per notte, max 5 notti"` →
  i Termini riportano l'importo esatto.

---

## 4. Variabili d'ambiente cambiate

Vedi [`.env.local.example`](.env.local.example) per i commenti completi.
Rispetto a prima:

**Tornate (ottobre 2026), per i pagamenti** — `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `BOOKING_TOKEN_SECRET`. Finché non sono tutte e
tre impostate sul sito pubblicato, /prenota resta una semplice richiesta
via email, e Termini e informativa lo dicono. **Rimossa** —
`NEXT_PUBLIC_GA_ID`.

> Nel tuo `.env.local` c'è ancora una chiave Stripe **live** di prima. In
> locale, con quella, una prova su /prenota creerebbe pagamenti veri:
> sostituiscila con la chiave di test (`sk_test_...`) e tieni la live solo
> su Cloudflare.

**Sostituite** — `GMAIL_USER` e `GMAIL_APP_PASSWORD` diventano
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`.

**Nuova, facoltativa** — `CHECKIN_ZIP_PASSWORD`.

> Il tuo `.env.local` attuale ha ancora le vecchie `GMAIL_*`: finché non lo
> aggiorni, **il sito non invia più nessuna email**. Va fatto sia in locale
> sia nelle Environment Variables su Vercel.

---

## 5. Quello che il codice non può risolvere

### 5.1 La casella che riceve le email

Sistemato l'invio, resta il punto più scomodo: se le email di check-in
arrivano su un **Gmail personale**, Google tratta i dati dei tuoi ospiti —
compresi gli estremi dei documenti d'identità — per conto tuo, senza alcun
accordo ai sensi dell'art. 28 GDPR. Gmail gratuito è un servizio per uso
personale e non prevede quell'accordo; Google Workspace sì, così come
qualsiasi casella su dominio.

Costa 15-25 € l'anno (es. una casella su dominio Aruba) e non richiede una
riga di codice: cambi `HOST_EMAIL` e hai finito. È la singola voce con il
miglior rapporto costo/rischio di tutto questo elenco.

### 5.2 Cancellare le email di check-in

Ogni email di check-in ti porta in casella i documenti d'identità dei tuoi
ospiti. Conservarle per sempre non serve a niente e moltiplica i danni di
un eventuale accesso abusivo alla casella. L'email ora te lo ricorda in
fondo; per automatizzare, in Gmail: *Impostazioni → Filtri → Crea filtro*
su oggetto `Check-in online`, azione *Elimina* dopo l'archiviazione
periodica.

### 5.3 Cifrare gli allegati (facoltativo)

Se imposti `CHECKIN_ZIP_PASSWORD`, i tre file arrivano dentro un unico ZIP
cifrato AES-256 invece che in chiaro. La password non viene mai scritta
nell'email.

Il prezzo da pagare: lo ZIP AES-256 **non si apre col doppio clic** di
Esplora file su Windows, serve [7-Zip](https://www.7-zip.org/). Dato che
avevi chiesto di non complicare la consultazione, è spento di default e la
scelta resta tua.

### 5.4 Leggere i testi legali

[`content/legal-texts.ts`](content/legal-texts.ts) contiene privacy, cookie
policy e termini. **Descrivono come lavori tu**: il saldo 24 ore prima,
il codice d'accesso, la cancellazione gratuita fino al saldo, il massimo di
4 ospiti. Se una di queste cose non corrisponde a come lavori davvero, il
problema non è il testo — è che stai promettendo agli ospiti qualcosa di
diverso da quello che fai. Rileggili.

Per la stessa ragione questo lavoro non sostituisce il parere del tuo
commercialista sugli adempimenti fiscali.

---

## 6. Da Vercel a Cloudflare (deciso il 18 ottobre 2026)

Il piano **Hobby (gratuito) di Vercel vieta l'uso commerciale**, a maggior
ragione con un sito che incassa. Per rimettere i pagamenti il sito si
sposta su **Cloudflare Workers**, su un account Cloudflare intestato a
Campo Marzio 47: il piano gratuito ammette l'uso commerciale e il
contratto self-serve incorpora l'accordo art. 28 GDPR (Cloudflare è già
indicata come fornitore di hosting nell'informativa). Il piano Workers
Paid (5 $/mese) è consigliato: quello gratuito concede 10 ms di CPU per
richiesta, stretti per il check-in.

Ordine dei passaggi (dettagli tecnici in `TEMPLATE-SETUP.md` §7):

1. Worker collegato al repo GitHub con Workers Builds, variabili e secret
   copiati da Vercel (più le tre di Stripe).
2. Prova completa sull'indirizzo `.workers.dev` con le chiavi Stripe **di
   test**: prenotazione, conferma, rifiuto, check-in, offerte.
3. `campomarzio47.it` su Cloudflare (cambio dei nameserver dal registrar),
   Custom Domain sul Worker, webhook Stripe sul dominio, chiavi live.
4. Solo allora si cancella il progetto Vercel e si toglie
   `campomarzio47.vercel.app` da `ALIAS_HOSTS` in `next.config.ts`.

## 6b. Pagamenti con Stripe: cosa resta a te

- **L'account Stripe è tuo** e va verificato a tuo nome (o dell'impresa):
  i soldi arrivano lì, e da lì fai i rimborsi (Pagamenti → Rimborsa).
- **Il sito non emette ricevute né fatture**: la ricevuta di Stripe non è
  un documento fiscale. Ricevuta o fattura le fai tu, come per le altre
  prenotazioni; il PDF del check-in ha l'indirizzo completo apposta.
- **Conferma entro la scadenza**: la carta è solo autorizzata. Se non
  confermi in tempo (la data è nell'email), l'autorizzazione decade e
  l'ospite viene avvisato.
- **Blocca le date su Airbnb e Booking dopo ogni conferma**: il sito non
  scrive nei loro calendari, e finché non lo fai le piattaforme le
  vendono ancora.
- **Contestazioni (chargeback)**: le gestisce Stripe con te; tieni le
  email di conferma, sono la prova del contratto.
- **Commissioni**: Stripe trattiene una percentuale su ogni incasso; vale
  la pena tenerne conto nel prezzo diretto.

## 6c. Offerte via email: le regole che il sito promette

Chi lo sceglie alla fine del check-in (casella facoltativa, mai spuntata
in partenza) riceve **al massimo tre email l'anno**. L'informativa lo
promette, e `scripts/offerte.mjs` rifiuta il quarto invio in dodici mesi.

- Il consenso si può revocare con un clic dal link in fondo a ogni
  email: la revoca cancella l'indirizzo. Se qualcuno te lo chiede per
  email, cancellalo tu (o scrivimi).
- Gli indirizzi si cancellano da soli 24 mesi dopo l'ultimo soggiorno.
- **Solo offerte per tornare a Campo Marzio 47**: niente terzi, niente
  liste comprate, niente indirizzi di chi non ha spuntato la casella
  (neppure quelli delle prenotazioni o dei contatti).
- Verifica che il fornitore SMTP consenta email promozionali e quanti
  invii al giorno permette il tuo piano.

---

## 7. Cosa è già a posto

Per non riaprire discussioni chiuse:

- **Niente banner cookie, e va bene così.** Google Analytics è stato
  rimosso: era l'unico terzo a scrivere cookie. Resta il solo cookie
  tecnico della lingua (`locale`), esente da consenso ex art. 122 del
  Codice privacy. I caratteri tipografici sono serviti dal nostro server,
  quindi il browser non contatta Google.
- **Recensioni.** Sono accompagnate dalla dichiarazione di provenienza
  richiesta dall'art. 22 comma 4-bis del Codice del consumo. Il voto è
  mostrato com'è, in decimi, e non convertito in stelle sempre piene.
- **Testi in tedesco.** Privacy, cookie e termini esistono anche in
  tedesco: sono traduzioni di cortesia e lo dichiarano ("im Zweifel gilt
  die italienische Fassung"). Se cambia la versione italiana va
  aggiornata anche quella tedesca (e inglese).
- **Diritto di recesso.** Escluso per legge (art. 59 c. 1 lett. n del
  Codice del consumo) e spiegato nei Termini, non semplicemente negato.
- **Nessun riferimento alla piattaforma ODR europea**, dismessa il 20
  luglio 2025 con il relativo obbligo di link. Quasi tutti i template
  italiani la citano ancora: sarebbe un'informazione falsa.
- **Pagamenti.** I dati della carta li tratta solo Stripe, sulla sua
  pagina: il sito non li vede mai. L'autenticazione forte richiesta dalla
  PSD2 (3-D Secure) la fa Stripe Checkout. Senza le chiavi Stripe il sito
  torna da solo alla semplice richiesta, e i Termini cambiano con lui.

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

**Rimosse** — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`BOOKING_TOKEN_SECRET`, `NEXT_PUBLIC_GA_ID`.

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

## 6. Vercel: punto aperto

Il piano **Hobby (gratuito) di Vercel vieta l'uso commerciale**, e la loro
definizione comprende esplicitamente «pubblicizzare un prodotto o servizio
a pagamento». Togliere Stripe ha ridotto il rischio ma non l'ha eliminato:
un sito che promuove una casa in affitto resta commerciale anche se non
incassa nulla.

Il controllo è sostanzialmente auto-dichiarato e la conseguenza concreta
sarebbe la **sospensione del progetto**, non una sanzione. Due uscite:

- **Vercel Pro**, ~20 $/mese — include anche le Web Analytics senza cookie,
  se un giorno rivuoi le statistiche;
- **un host il cui piano gratuito ammette l'uso commerciale** (Cloudflare
  Pages, Netlify) — costo zero, una migrazione da fare.

Non ho preso questa decisione al posto tuo.

---

## 7. Cosa è già a posto

Per non riaprire discussioni chiuse:

- **Niente banner cookie, e va bene così.** Google Analytics è stato
  rimosso: era l'unico terzo a scrivere cookie. Resta il solo cookie
  tecnico della lingua (`locale`), esente da consenso ex art. 122 del
  Codice privacy. I caratteri tipografici sono serviti dal nostro server,
  quindi il browser non contatta Google.
- **Recensioni.** Sono accompagnate dalla dichiarazione di provenienza
  richiesta dall'art. 22 comma 4-bis del Codice del consumo. Le stelle ora
  derivano dal voto reale invece di essere sempre cinque.
- **Diritto di recesso.** Escluso per legge (art. 59 c. 1 lett. n del
  Codice del consumo) e spiegato nei Termini, non semplicemente negato.
- **Nessun riferimento alla piattaforma ODR europea**, dismessa il 20
  luglio 2025 con il relativo obbligo di link. Quasi tutti i template
  italiani la citano ancora: sarebbe un'informazione falsa.
- **Pagamenti.** Il sito non raccoglie più dati di pagamento di nessun
  tipo, quindi non ti riguardano gli obblighi PSD2 né la gestione dei
  rimborsi online.

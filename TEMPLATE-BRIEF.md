# Brief per un nuovo sito (basato sul modello Campo Marzio 47)

Compila questo file con le informazioni del nuovo host/immobile e allegalo
nella cartella del nuovo progetto (clonato da questo repo). Serve a
popolare `content/property.ts`, i testi in `content/dictionaries.ts`, lo
stile in `app/globals.css`/`app/layout.tsx` e le variabili d'ambiente
senza dover ridiscutere ogni volta la struttura del sito.

Più i dati sono completi, più il nuovo sito puo' essere generato in un solo
passaggio.

## 1. Proprietà

- Nome commerciale dell'immobile (es. "Campo Marzio 47"):
- Parte del nome da evidenziare in bordeaux nel logo (es. "47"), se presente:
- Hai già un logo o un marchio tuo (file vettoriale o immagine ad alta
  risoluzione)? Se sì allegalo: diventa l'icona del sito (quella che si
  vede nei risultati Google e nella scheda del browser). Se no, la
  generiamo dal nome — serve solo sapere quale sigla usare, massimo 2-3
  caratteri perché va letta a 16 pixel:
- Tipo di immobile (casa a schiera, appartamento, B&B, villa...):
- Indirizzo completo (via, CAP, città, provincia):
- Superficie (m²):
- N. massimo ospiti:
- Camere da letto:
- Letti totali:
- Bagni:
- Anno ristrutturazione (se rilevante):
- Classe energetica (se disponibile):

## 2. Host

- Nome:
- Telefono (con prefisso internazionale):
- Email di contatto pubblica (mostrata sul sito):
- Lingue parlate:

## 3. Stile visivo

**Il sito Campo Marzio 47 ha uno stile editoriale costruito sulla casa**
(palette presa dai suoi materiali, Bodoni per i titoli, la scacchiera di
Marostica come motivo, foto che si scoprono scorrendo). Non va copiato:
va rifatto partendo da questa casa e da questo luogo. Rispondi per
capire da dove partire (vedi `TEMPLATE-SETUP.md` §3ter):

- Aggettivi che descrivono il mood desiderato (es. "moderno e minimale",
  "caldo e familiare", "montano e rustico", "luminoso e giovane"...):
- Colore principale desiderato, se già in mente (altrimenti lo propongo
  io in base al mood):
- Colori e materiali della casa che la rendono riconoscibile (un
  portone, un pavimento, un tessuto): diventano la palette.
- Qualcosa che il paese o il luogo ha di unico (una festa, un prodotto,
  un monumento visibile da casa): diventa il motivo e la sezione "Dove
  siamo".
- Siti di riferimento o ispirazione (anche solo link):
- Le animazioni (foto che si scoprono, titoli che salgono) vanno bene o
  si preferisce un sito più fermo?

## 4. Servizi/amenità

Elenco puntato di tutto ciò che è incluso (es. Wi-Fi, aria condizionata,
lavatrice, parcheggio, giardino, culla su richiesta, animali ammessi...).
Per ciascuno un dettaglio concreto, se c'è ("parcheggio: gratuito,
davanti all'ingresso"): sul sito non ci sono icone, e il dettaglio è
quello che lo rende credibile.

## 5. Recensioni (facoltative, 2-3 reali se disponibili)

Per ciascuna: nome ospite, gruppo (famiglia/coppia/gruppo/amici/da solo/
lavoro), mese/anno, voto in decimi, testo della recensione (lasciare nella
lingua originale, non tradurre).

## 6. Prenotazioni

- URL annuncio Airbnb:
- URL annuncio Booking.com:
- Altri canali di prenotazione diretta da collegare?

## 6b. Prenotazione diretta

Due possibilità, da scegliere con l'host:

- **Richiesta via email** (default): l'ospite invia una richiesta, l'host
  risponde e il pagamento avviene fuori dal sito.
- **Pagamento con Stripe**: l'ospite autorizza la carta sul sito, l'host
  conferma (e incassa) da un link via email. Serve un account Stripe a
  nome dell'host, verificato, e una politica di cancellazione precisa.

Vuole il pagamento con Stripe? (sì/no) Se sì, fino a quanti giorni prima
dell'arrivo si cancella con rimborso totale?

In entrambi i casi servono prezzi e condizioni, perché finiscono nel
riepilogo del prezzo e nei Termini e condizioni.

- Prezzo per notte (in euro, un unico valore fisso — prezzi diversi per
  stagione/periodo non sono ancora supportati dal sito):
- Costo pulizie finali (facoltativo, 0 se incluso nel prezzo per notte):
- Soggiorno minimo in notti (facoltativo, di default 2):
- Preavviso minimo prima dell'arrivo, in giorni (facoltativo, di default
  2 — oggi e i giorni successivi fino a questo numero risultano sempre
  "occupati" e non prenotabili, per dare tempo all'host di organizzarsi):
- Quando è dovuto il saldo? (di default: entro 24 ore prima dell'arrivo,
  contestualmente all'invio del codice di accesso)
- Con quali mezzi di pagamento (bonifico, contanti all'arrivo, altro):
- Politica di cancellazione applicata davvero (di default: nessuna penale
  fino al momento del saldo):

Offerte via email: vuole poter mandare, a chi lo sceglie alla fine del
check-in, al massimo tre email l'anno con offerte per tornare? (sì/no)

## 6c. Dati legali obbligatori

Senza questi il sito non può essere pubblicato. Dettagli in `LEGALE.md`.

- **CIN** (Codice Identificativo Nazionale, dalla BDSR) — **obbligatorio**:
  va indicato in ogni annuncio, sito diretto compreso. Sanzione 500-5.000 €
  se manca:
- CIR (Codice Identificativo Regionale, per il Veneto su Ross1000):
- L'host affitta come privato o come impresa con P.IVA?
- Se impresa: ragione sociale, P.IVA, codice fiscale, numero REA, sede
  legale, PEC:
- Il Comune applica l'imposta di soggiorno? Se sì, con quale tariffa?
- Le recensioni da pubblicare sono autentiche e verificabili sulle
  piattaforme? (pubblicarne di inventate è una pratica commerciale
  scorretta)
- L'host possiede i diritti sulle foto fornite?

## 7. Foto

- 1 foto di copertina in alta risoluzione (idealmente >3000px sul lato
  lungo — le foto scaricate da Airbnb/Booking sono spesso troppo compresse
  per un hero a piena larghezza; meglio l'originale del fotografo/host).
- 4-6 foto per la galleria (interni, esterni, camere, bagno), stesso
  requisito di risoluzione dove possibile.
- Per ogni foto, se possibile, una riga che dica cosa mostra (diventa il
  testo alternativo per chi usa uno screen reader e la didascalia). Nomi
  file descrittivi (`soggiorno-tavolo.jpg`) aiutano già molto.
- Formato JPEG o PNG: le foto HEIC degli iPhone vanno esportate prima.

## 8. Email (per invio check-in e richieste di prenotazione)

Le email trasportano dati personali degli ospiti, fino agli estremi del
documento d'identità. Chi le veicola è un responsabile del trattamento e
serve un accordo ai sensi dell'art. 28 GDPR: **un account Gmail gratuito
non ne ha uno**, essendo un servizio per uso personale. Vedi `LEGALE.md`.

- Servizio SMTP per l'invio (consigliati Brevo o Mailjet: europei, con DPA
  incluso anche nel piano gratuito; in alternativa la casella SMTP del
  dominio dell'host):
- Indirizzo mittente autorizzato da quel servizio:
- Indirizzo a cui devono **arrivare** le notifiche (check-in, richieste di
  prenotazione, contatti). Non dovrebbe essere una casella personale
  gratuita, per la stessa ragione di cui sopra:
- L'host vuole ricevere gli allegati del check-in dentro uno ZIP cifrato
  AES-256? (più sicuro, ma per aprirlo serve 7-Zip: di default è spento)

## 9. Calendario disponibilità (facoltativo)

- URL "Esporta calendario" (iCal) dal pannello host Airbnb:
- URL "Esporta calendario" (iCal) da Booking.com:

(Se non forniti, il calendario di `/prenota` e la barra "Verifica
disponibilità" in home funzionano comunque, ma senza disabilitare le
date già occupate su Airbnb/Booking — il sito funziona comunque.)

## 10. Check-in online / obbligo flussi turistici (Ross1000-GIES, Veneto)

Necessario solo se l'immobile è in Veneto e la Regione richiede la
movimentazione tramite portale Ross1000/GIES. Per altre regioni la
generazione del file XML va rivista secondo il tracciato richiesto
localmente (non riusare Ross1000 automaticamente) — vedi
`TEMPLATE-SETUP.md` §6.

- Regione dell'immobile (per capire se Ross1000/GIES si applica o va
  sostituito con il sistema locale):
- Codice struttura Ross1000 (CIR regionale, es. "024057-LOC-00037" — NON è
  il CIN nazionale, sono due codici diversi: il CIN sta al §6c):
- Nome "prodotto" da riportare nell'XML (facoltativo, di default deriva dal
  nome della proprietà):

## 11. Dominio

- Dominio personalizzato da collegare (se già acquistato), oppure va bene
  il sottodominio gratuito `<nome-progetto>.<account>.workers.dev`?
- Se c'è un dominio: chi ha accesso al pannello del registrar? Per
  collegarlo al sito il dominio va gestito da Cloudflare (si cambiano i
  nameserver, il dominio resta dove è registrato).
- Se l'obiettivo dell'host è **essere trovato su Google**, spiegargli che
  il dominio proprio non è un vezzo estetico: un sottodominio
  `*.workers.dev` non è collegabile a una scheda Google Business Profile,
  non può essere verificato in Search Console come proprietà di dominio e
  parte svantaggiato nelle ricerche locali. Costo tipico 10-15 €/anno.

## 11-bis. Hosting (Cloudflare)

- Su quale account Cloudflare va il sito: **uno dell'host** (consigliato:
  il contratto con Cloudflare è suo, e chi gestisce il sito non diventa
  responsabile del trattamento) o quello di chi gestisce il sito (serve
  allora un accordo art. 28 GDPR con l'host, vedi `LEGALE.md`)?
- Piano: **Workers Paid** (5 $/mese per account) consigliato, perché il
  piano gratuito concede 10 ms di CPU per richiesta e il check-in rischia
  di superarli. Va bene?

## 11a. Visibilità su Google (da concordare con l'host)

- L'host ha già una scheda **Google Business Profile** per la struttura?
  È il fattore singolo più efficace per le ricerche locali ("casa
  vacanze <città>") e va collegata al sito.
- Serve l'accesso Google dell'host per **Search Console**: chi lo fa,
  l'host o noi con un account condiviso? (Senza, il sito può restare
  mesi fuori dall'indice — vedi `TEMPLATE-SETUP.md` §7c.)
- L'immobile è presente su portali/siti locali (Pro Loco, consorzio
  turistico, comune, associazione albergatori) che possono linkarlo?
  Sono i link più utili e più facili da ottenere.

## 11b. Statistiche di visita (facoltativo)

Il modello **non include più Google Analytics**, ed è una scelta, non una
dimenticanza: era l'unico strumento a scrivere cookie di terze parti, e la
sua presenza obbliga a un banner di consenso preventivo che blocchi lo
script *prima* dell'accettazione (Linee guida cookie del Garante). Senza
di lui il sito usa solo un cookie tecnico ed è esente dal banner.

- L'host vuole comunque delle statistiche? In tal caso proporre uno
  strumento **senza cookie e senza profilazione** (Cloudflare Web
  Analytics, gratuito, oppure Plausible): nessun banner necessario.
- Se l'host insiste per Google Analytics, va messo in conto il lavoro
  aggiuntivo: banner di consenso con rifiuto allo stesso livello
  dell'accettazione, blocco dello script fino al consenso, riscrittura
  della cookie policy e un modo per cambiare idea in seguito. Non è una
  variabile d'ambiente in più.

## 12. Note aggiuntive

Qualsiasi cosa il modello Campo Marzio 47 non copre (es. prezzi da
mostrare, mappa, servizi extra a pagamento, lingue aggiuntive oltre
IT/EN/DE...).

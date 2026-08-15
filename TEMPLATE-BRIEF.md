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

**Il sito Campo Marzio 47 usa uno stile "boutique elegante"** (palette
bordeaux/off-white, font serif Cormorant Garamond + DM Sans, animazioni
discrete come lo zoom lento sulla foto hero). Non è detto che vada bene
per il prossimo immobile: uno chalet di montagna, un appartamento in
città o una casa per famiglie/gruppi possono richiedere un registro
diverso. Rispondi per capire se riusare lo stile esistente o cambiarlo
(vedi `TEMPLATE-SETUP.md` §3bis per cosa è coinvolto nel cambio):

- Aggettivi che descrivono il mood desiderato (es. "moderno e minimale",
  "caldo e familiare", "montano e rustico", "luminoso e giovane"...):
- Colore principale desiderato, se già in mente (altrimenti lo propongo
  io in base al mood):
- Va bene mantenere lo stile "boutique" di Campo Marzio 47 (bordeaux +
  serif elegante), o va cambiato? Se cambiato, siti di riferimento/
  ispirazione (anche solo link) sono utili:
- Le animazioni discrete attuali (zoom lento sulla foto hero, comparsa
  graduale delle sezioni scorrendo) vanno bene, ridotte, o del tutto
  rimosse per un look più sobrio?

## 4. Servizi/amenità

Elenco puntato di tutto ciò che è incluso (es. Wi-Fi, aria condizionata,
lavatrice, parcheggio, giardino, culla su richiesta, animali ammessi...).
Per ciascuno, se possibile indicare anche un'icona di riferimento (es.
"parcheggio" → un'auto) — aiuta a scegliere l'icona giusta in
`components/Amenities.tsx` (vedi `TEMPLATE-SETUP.md` §4bis).

## 5. Recensioni (facoltative, 2-3 reali se disponibili)

Per ciascuna: nome ospite, gruppo (famiglia/coppia/gruppo...), mese/anno,
voto, testo della recensione (lasciare nella lingua originale, non tradurre).

## 6. Prenotazioni

- URL annuncio Airbnb:
- URL annuncio Booking.com:
- Altri canali di prenotazione diretta da collegare?

## 6b. Prenotazione diretta con pagamento (Stripe)

- Prezzo per notte (in euro, un unico valore fisso — prezzi diversi per
  stagione/periodo non sono ancora supportati dal sito):
- Costo pulizie finali (facoltativo, 0 se incluso nel prezzo per notte):
- Soggiorno minimo in notti (facoltativo, di default 2):
- Preavviso minimo prima dell'arrivo, in giorni (facoltativo, di default
  2 — oggi e i giorni successivi fino a questo numero risultano sempre
  "occupati" e non prenotabili, per dare tempo all'host di organizzarsi):
- L'host ha già un account Stripe? Se sì, è verificato/attivo per
  accettare pagamenti reali?
- Nota: la carta dell'ospite viene solo autorizzata al momento della
  prenotazione; l'host conferma o rifiuta a mano entro un paio di
  giorni, e solo alla conferma avviene l'addebito reale.

## 7. Foto

- 1 foto di copertina in alta risoluzione (idealmente >3000px sul lato
  lungo — le foto scaricate da Airbnb/Booking sono spesso troppo compresse
  per un hero a piena larghezza; meglio l'originale del fotografo/host).
- 4-6 foto per la galleria (interni, esterni, camere, bagno), stesso
  requisito di risoluzione dove possibile.

## 8. Email (per invio check-in e richieste di prenotazione)

- Indirizzo Gmail dedicato al sito (o esistente) che invierà le email:
- L'account ha la verifica in due passaggi attiva? (necessaria per generare
  l'App Password su https://myaccount.google.com/apppasswords)
- Indirizzo email a cui devono arrivare le notifiche (check-in, richieste
  di prenotazione, contatti) — può coincidere con quello sopra:

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
  il CIN nazionale, sono due codici diversi):
- Nome "prodotto" da riportare nell'XML (facoltativo, di default deriva dal
  nome della proprietà):

## 11. Dominio

- Dominio personalizzato da collegare (se già acquistato), oppure va bene
  il sottodominio gratuito `<nome-progetto>.vercel.app`?

## 12. Note aggiuntive

Qualsiasi cosa il modello Campo Marzio 47 non copre (es. prezzi da
mostrare, mappa, servizi extra a pagamento, lingue aggiuntive oltre
IT/EN...).

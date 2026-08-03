# Brief per un nuovo sito (basato sul modello Campo Marzio 47)

Compila questo file con le informazioni del nuovo host/immobile e allegalo
nella cartella del nuovo progetto (clonato da questo repo). Serve a
popolare `content/property.ts`, i testi in `content/dictionaries.ts` e le
variabili d'ambiente senza dover ridiscutere ogni volta la struttura del
sito.

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

## 3. Testi (in italiano; verranno poi tradotti in inglese)

- Tagline breve (una riga, sotto il titolo in home):
- Descrizione estesa (2-4 frasi, per la home):
- Titolo pagina / meta description SEO (se diversi dalla tagline):

## 4. Servizi/amenità

Elenco puntato di tutto ciò che è incluso (es. Wi-Fi, aria condizionata,
lavatrice, parcheggio, giardino, culla su richiesta, animali ammessi...).

## 6. Recensioni (facoltative, 2-3 reali se disponibili)

Per ciascuna: nome ospite, gruppo (famiglia/coppia/gruppo...), mese/anno,
voto, testo della recensione (lasciare nella lingua originale, non tradurre).

## 7. Prenotazioni

- URL annuncio Airbnb:
- URL annuncio Booking.com:
- Altri canali di prenotazione diretta da collegare?

## 7b. Prenotazione diretta con pagamento (Stripe)

- Prezzo per notte (in euro, un unico valore fisso — prezzi diversi per
  stagione/periodo non sono ancora supportati dal sito):
- Costo pulizie finali (facoltativo, 0 se incluso nel prezzo per notte):
- Soggiorno minimo in notti (facoltativo, di default 2):
- L'host ha già un account Stripe? Se sì, è verificato/attivo per
  accettare pagamenti reali?
- Nota: la carta dell'ospite viene solo autorizzata al momento della
  prenotazione; l'host conferma o rifiuta a mano entro un paio di
  giorni, e solo alla conferma avviene l'addebito reale.

## 8. Foto

- 1 foto di copertina in alta risoluzione (idealmente >3000px sul lato
  lungo — le foto scaricate da Airbnb/Booking sono spesso troppo compresse
  per un hero a piena larghezza; meglio l'originale del fotografo/host).
- 4-6 foto per la galleria (interni, esterni, camere, bagno), stesso
  requisito di risoluzione dove possibile.

## 9. Email (per invio check-in e richieste di prenotazione)

- Indirizzo Gmail dedicato al sito (o esistente) che invierà le email:
- L'account ha la verifica in due passaggi attiva? (necessaria per generare
  l'App Password su https://myaccount.google.com/apppasswords)
- Indirizzo email a cui devono arrivare le notifiche (check-in, richieste
  di prenotazione, contatti) — può coincidere con quello sopra:

## 10. Calendario disponibilità (facoltativo)

- URL "Esporta calendario" (iCal) dal pannello host Airbnb:
- URL "Esporta calendario" (iCal) da Booking.com:

(Se non forniti, il calendario di `/prenota` e la barra "Verifica
disponibilità" in home funzionano comunque, ma senza disabilitare le
date già occupate su Airbnb/Booking — il sito funziona comunque.)

## 11. Check-in online / obbligo flussi turistici (Ross1000-GIES, Veneto)

Necessario solo se l'immobile è in Veneto e la Regione richiede la
movimentazione tramite portale Ross1000/GIES. Per altre regioni la
generazione del file XML va rivista secondo il tracciato richiesto
localmente (non riusare Ross1000 automaticamente).

- Codice struttura Ross1000 (CIR regionale, es. "024057-LOC-00037" — NON è
  il CIN nazionale, sono due codici diversi):
- Nome "prodotto" da riportare nell'XML (facoltativo, di default deriva dal
  nome della proprietà):

## 12. Dominio

- Dominio personalizzato da collegare (se già acquistato), oppure va bene
  il sottodominio gratuito `<nome-progetto>.vercel.app`?

## 13. Note aggiuntive

Qualsiasi cosa il modello Campo Marzio 47 non copre (es. prezzi da
mostrare, mappa, servizi extra a pagamento, lingue aggiuntive oltre
IT/EN...).

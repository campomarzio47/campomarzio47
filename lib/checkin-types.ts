// Le etichette mostrate all'utente vivono nel dizionario (content/dictionaries.ts,
// sezione checkin) così da poter essere tradotte. Qui restano solo i valori/codici
// che sono il dato effettivo inviato/validato dal server.
//
// Solo un sottoinsieme dei campi qui sotto finisce nell'XML Ross1000 (quelli
// previsti dalla specifica originale: vedi lib/ross1000.ts). Gli altri
// (email, indirizzo, codice fiscale, documento) servono solo per il
// riepilogo/PDF inviato all'host — non sono richiesti dallo schema XML e non
// vanno inseriti, come confermato dall'errore di validazione ricevuto.

export const documentTypeCodes = ["IDENT", "PASOR", "PATEN", "ALTRO"] as const;
export type DocumentTypeCode = (typeof documentTypeCodes)[number];

export const tipoTurismoCodes = [
  "Culturale",
  "Balneare",
  "Congressuale/Affari",
  "Fieristico",
  "Sportivo/Fitness",
  "Scolastico",
  "Religioso",
  "Sociale",
  "Parchi Tematici",
  "Termale/Trattamenti salute",
  "Enogastronomico",
  "Cicloturismo",
  "Escursionistico/Naturalistico",
  "Altro motivo",
  "Non specificato",
] as const;
export type TipoTurismo = (typeof tipoTurismoCodes)[number];

export const mezzoTrasportoCodes = [
  "Auto",
  "Aereo",
  "Aereo+Pullman",
  "Aereo+Navetta/Taxi/Auto",
  "Aereo+Treno",
  "Treno",
  "Pullman",
  "Caravan/Autocaravan",
  "Barca/Nave/Traghetto",
  "Moto",
  "Bicicletta",
  "A piedi",
  "Altro mezzo",
  "Non Specificato",
] as const;
export type MezzoTrasporto = (typeof mezzoTrasportoCodes)[number];

// Cittadinanza/stato/comune sono risolti tramite le tabelle ufficiali in
// lib/reference-data.ts (scaricate da alloggiatiweb.poliziadistato.it), quindi
// portano sempre un codice valido: nessun segnaposto da completare a mano.
export type PlaceRef = { code: string; label: string } | null;

// Campi previsti dall'XML Ross1000 (specifica originale) — richiesti per
// ogni ospite del gruppo, invariati.
export type Guest = {
  cognome: string;
  nome: string;
  sesso: "M" | "F";
  dataNascita: string; // yyyy-mm-dd
  cittadinanza: PlaceRef;
  statoResidenza: PlaceRef;
  comuneResidenza: PlaceRef; // richiesto solo se statoResidenza = Italia
  localitaResidenzaEstera: string; // usato solo se statoResidenza non e' Italia
  statoNascita: PlaceRef; // facoltativo
  comuneNascita: PlaceRef; // valorizzato solo se statoNascita = Italia
  tipoTurismo: TipoTurismo;
  mezzoTrasporto: MezzoTrasporto;
};

// Campi extra richiesti dall'host (email/PDF, non nell'XML): chiesti una
// sola volta, solo all'ospite principale (il primo del gruppo), per non
// appesantire il form per tutti gli altri ospiti.
export type PrimaryGuestExtra = {
  email: string;
  indirizzoResidenza: string;
  codiceFiscale: string; // solo se il primo ospite ha cittadinanza italiana
  tipoDocumento: DocumentTypeCode;
  numeroDocumento: string;
  statoRilascio: PlaceRef;
  comuneRilascio: PlaceRef; // richiesto solo se statoRilascio = Italia
};

export type CheckInData = {
  dataArrivo: string; // yyyy-mm-dd
  notti: number;
  guests: Guest[];
  primary: PrimaryGuestExtra;
};

export function toCompactDate(isoDate: string): string {
  return isoDate.replaceAll("-", "");
}

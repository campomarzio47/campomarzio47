// Le etichette mostrate all'utente vivono nel dizionario (content/dictionaries.ts,
// sezione checkin) così da poter essere tradotte. Qui restano solo i valori/codici
// che sono il dato effettivo inviato/validato dal server e scritto nell'XML Ross1000.

// Tipo documento: stesso elenco gia' usato in precedenza per Alloggiati Web.
export const documentTypeCodes = ["IDENT", "PASOR", "PATEN", "ALTRO"] as const;
export type DocumentTypeCode = (typeof documentTypeCodes)[number];

// Cittadinanza/stato/comune sono risolti tramite le tabelle ufficiali in
// lib/reference-data.ts (scaricate da alloggiatiweb.poliziadistato.it), quindi
// portano sempre un codice valido: nessun segnaposto da completare a mano.
export type PlaceRef = { code: string; label: string } | null;

export type Guest = {
  cognome: string;
  nome: string;
  sesso: "M" | "F";
  dataNascita: string; // yyyy-mm-dd
  email: string;
  cittadinanza: PlaceRef; // stato, sempre richiesto
  statoResidenza: PlaceRef; // stato, sempre richiesto
  comuneResidenza: PlaceRef; // richiesto solo se statoResidenza = Italia
  localitaResidenzaEstera: string; // usato solo se statoResidenza non e' Italia
  indirizzoResidenza: string; // via e numero civico (serve anche per la fattura)
  statoNascita: PlaceRef; // richiesto
  comuneNascita: PlaceRef; // richiesto solo se statoNascita = Italia
  tipoDocumento: DocumentTypeCode;
  numeroDocumento: string;
  statoRilascio: PlaceRef; // stato di rilascio del documento
  comuneRilascio: PlaceRef; // richiesto solo se statoRilascio = Italia
};

export type CheckInData = {
  dataArrivo: string; // yyyy-mm-dd
  notti: number;
  guests: Guest[];
};

export function toCompactDate(isoDate: string): string {
  return isoDate.replaceAll("-", "");
}

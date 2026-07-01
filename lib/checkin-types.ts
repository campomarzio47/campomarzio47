// Le etichette mostrate all'utente vivono nel dizionario (content/dictionaries.ts,
// checkin.documentTypes) così da poter essere tradotte. Qui restano solo i codici,
// che sono il valore effettivo inviato/validato dal server.
export const documentTypeCodes = ["IDENT", "PASOR", "PATEN", "ALTRO"] as const;

export type DocumentTypeCode = (typeof documentTypeCodes)[number];

export type Guest = {
  cognome: string;
  nome: string;
  sesso: "M" | "F";
  dataNascita: string; // yyyy-mm-dd
  comuneStatoNascita: string;
  provinciaNascita: string;
  cittadinanza: string;
  tipoDocumento: DocumentTypeCode;
  numeroDocumento: string;
  luogoRilascio: string;
  comuneStatoResidenza: string;
  provinciaResidenza: string;
};

export type CheckInData = {
  dataArrivo: string; // yyyy-mm-dd
  notti: number;
  guests: Guest[];
};

export function toItalianDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

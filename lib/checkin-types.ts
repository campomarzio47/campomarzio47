// Le etichette mostrate all'utente vivono nel dizionario (content/dictionaries.ts,
// sezione checkin) così da poter essere tradotte. Qui restano solo i valori/codici
// che sono il dato effettivo inviato/validato dal server e scritto nell'XML Ross1000.

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

export const titoloStudioCodes = [
  "Licenza elementare",
  "Diploma",
  "Laurea",
  "Altro titolo",
  "Non specificato",
] as const;
export type TitoloStudio = (typeof titoloStudioCodes)[number];

// Cittadinanza/stato/comune sono risolti tramite le tabelle ufficiali in
// lib/reference-data.ts (scaricate da alloggiatiweb.poliziadistato.it), quindi
// portano sempre un codice valido: nessun segnaposto da completare a mano.
export type PlaceRef = { code: string; label: string } | null;

export type Guest = {
  cognome: string;
  nome: string;
  sesso: "M" | "F";
  dataNascita: string; // yyyy-mm-dd
  cittadinanza: PlaceRef; // stato, sempre richiesto
  statoResidenza: PlaceRef; // stato, sempre richiesto
  comuneResidenza: PlaceRef; // richiesto solo se statoResidenza = Italia
  localitaResidenzaEstera: string; // usato solo se statoResidenza non e' Italia
  statoNascita: PlaceRef; // facoltativo
  comuneNascita: PlaceRef; // valorizzato solo se statoNascita = Italia
  tipoTurismo: TipoTurismo;
  mezzoTrasporto: MezzoTrasporto;
  titoloStudio: TitoloStudio | "";
  professione: string;
};

export type CheckInData = {
  dataArrivo: string; // yyyy-mm-dd
  notti: number;
  guests: Guest[];
};

export function toCompactDate(isoDate: string): string {
  return isoDate.replaceAll("-", "");
}

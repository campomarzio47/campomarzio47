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

// "IT" ha un codice Nazioni certo (100000100, dato dalla specifica). Per ogni altro
// stato non abbiamo la tabella ufficiale "Nazioni", quindi raccogliamo il nome in
// chiaro e nell'XML lasciamo un codice segnaposto da completare a mano (vedi lib/ross1000.ts).
export type StatoScelta = "IT" | "ALTRO";

export type Guest = {
  cognome: string;
  nome: string;
  sesso: "M" | "F";
  dataNascita: string; // yyyy-mm-dd
  cittadinanza: StatoScelta;
  cittadinanzaAltro: string; // nome stato, valorizzato solo se cittadinanza = ALTRO
  statoResidenza: StatoScelta;
  luogoResidenza: string; // comune (se IT, serve codice) oppure localita' libera (se estero)
  statoNascita: StatoScelta | ""; // facoltativo
  statoNascitaAltro: string;
  comuneNascita: string; // valorizzato solo se statoNascita = IT
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

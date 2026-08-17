import comuniData from "@/content/data/comuni.json";
import statiData from "@/content/data/stati.json";

// Tabelle ufficiali "Comuni" e "Stati" (Polizia di Stato, scaricate da
// alloggiatiweb.poliziadistato.it/PortaleAlloggiati/Tabelle.aspx). Usate per
// risolvere in automatico i codici richiesti dall'XML Ross1000/GIES, senza
// bisogno di completare nulla a mano.

export type PlaceOption = { code: string; label: string };

export const ITALIA_CODE = "100000100";

export const statiOptions: PlaceOption[] = (statiData as { code: string; name: string }[]).map(
  (s) => ({ code: s.code, label: s.name }),
);

export const comuniOptions: PlaceOption[] = (
  comuniData as { code: string; name: string; province: string }[]
).map((c) => ({ code: c.code, label: `${c.name} (${c.province})` }));

export const italiaOption: PlaceOption =
  statiOptions.find((s) => s.code === ITALIA_CODE) ?? { code: ITALIA_CODE, label: "ITALIA" };

// Sigla della provincia per codice comune. Serve al tracciato Alloggiati Web
// (campo "Provincia Nascita", 2 caratteri), che la richiede separata dal
// codice del comune quando l'ospite e' nato in Italia.
const provinceByComune = new Map(
  (comuniData as { code: string; province: string }[]).map((c) => [c.code, c.province]),
);

export function provinciaByComuneCode(code: string | undefined | null): string {
  if (!code) return "";
  return provinceByComune.get(code) ?? "";
}

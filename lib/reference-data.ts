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

"use client";

import type { PrimaryGuestExtra } from "@/lib/checkin-types";
import { useLocale } from "@/components/LocaleProvider";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import ChoiceGroup from "@/components/ChoiceGroup";
import { statiOptions, comuniOptions, ITALIA_CODE } from "@/lib/reference-data";

/** Documento d'identità dell'ospite principale: tipo, numero, dove è stato rilasciato. */
export default function DocumentFields({
  primary,
  onChange,
}: {
  primary: PrimaryGuestExtra;
  onChange: (primary: PrimaryGuestExtra) => void;
}) {
  const { dict } = useLocale();
  const t = dict.checkin;
  const rilascioInItalia = primary.statoRilascio?.code === ITALIA_CODE;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <ChoiceGroup
          legend={t.documentType}
          name="tipo-documento"
          value={primary.tipoDocumento}
          required
          onChange={(v) => onChange({ ...primary, tipoDocumento: v })}
          options={t.documentTypes.map((d) => ({ value: d.code, label: d.label }))}
        />
      </div>
      <label className="field-label sm:col-span-2" htmlFor="doc-numero">
        {t.documentNumber}
        <input
          id="doc-numero"
          required
          maxLength={20}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          value={primary.numeroDocumento}
          onChange={(e) => onChange({ ...primary, numeroDocumento: e.target.value.toUpperCase() })}
          className="field tabular tracking-[0.08em]"
        />
      </label>
      <label className="field-label" htmlFor="doc-stato">
        {t.issueState}
        <PlaceAutocomplete
          id="doc-stato"
          required
          value={primary.statoRilascio}
          onChange={(v) => onChange({ ...primary, statoRilascio: v, comuneRilascio: null })}
          options={statiOptions}
          placeholder={t.issueStatePlaceholder}
        />
      </label>
      {rilascioInItalia && (
        <label className="field-label animate-fade-up" htmlFor="doc-comune">
          {t.issuePlace}
          <PlaceAutocomplete
            id="doc-comune"
            required
            value={primary.comuneRilascio}
            onChange={(v) => onChange({ ...primary, comuneRilascio: v })}
            options={comuniOptions}
            placeholder={t.issuePlacePlaceholder}
          />
        </label>
      )}
    </div>
  );
}

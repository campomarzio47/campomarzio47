"use client";

import type { PrimaryGuestExtra, PlaceRef } from "@/lib/checkin-types";
import { useLocale } from "@/components/LocaleProvider";
import { statiOptions, comuniOptions, ITALIA_CODE } from "@/lib/reference-data";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";

const inputClasses =
  "w-full rounded-md border border-divider bg-off-white px-3 py-2 text-sm outline-none focus:border-bordeaux";
const labelClasses = "flex flex-col gap-1 text-xs text-mid";

export default function PrimaryGuestExtraFields({
  primary,
  onChange,
  primaryGuestIsItalian,
}: {
  primary: PrimaryGuestExtra;
  onChange: (primary: PrimaryGuestExtra) => void;
  primaryGuestIsItalian: boolean;
}) {
  const { dict } = useLocale();

  function set<K extends keyof PrimaryGuestExtra>(key: K, value: PrimaryGuestExtra[K]) {
    onChange({ ...primary, [key]: value });
  }

  const rilascioInItalia = primary.statoRilascio?.code === ITALIA_CODE;

  return (
    <div className="rounded-md border border-divider p-5">
      <h3 className="mb-1 font-display text-xl">{dict.checkin.primaryExtraTitle}</h3>
      <p className="mb-4 text-xs text-mid">{dict.checkin.primaryExtraSubtitle}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={`${labelClasses} sm:col-span-2`}>
          {dict.checkin.email}
          <input
            required
            type="email"
            placeholder={dict.checkin.emailPlaceholder}
            value={primary.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={`${labelClasses} sm:col-span-2`}>
          {dict.checkin.residenceAddress}
          <input
            required
            placeholder={dict.checkin.residenceAddressPlaceholder}
            value={primary.indirizzoResidenza}
            onChange={(e) => set("indirizzoResidenza", e.target.value)}
            className={inputClasses}
          />
        </label>

        {primaryGuestIsItalian && (
          <label className={`${labelClasses} sm:col-span-2`}>
            {dict.checkin.fiscalCode}
            <input
              required
              maxLength={16}
              placeholder={dict.checkin.fiscalCodePlaceholder}
              value={primary.codiceFiscale}
              onChange={(e) => set("codiceFiscale", e.target.value.toUpperCase())}
              className={inputClasses}
            />
          </label>
        )}

        <label className={labelClasses}>
          {dict.checkin.documentType}
          <select
            value={primary.tipoDocumento}
            onChange={(e) =>
              set("tipoDocumento", e.target.value as PrimaryGuestExtra["tipoDocumento"])
            }
            className={inputClasses}
          >
            {dict.checkin.documentTypes.map((d) => (
              <option key={d.code} value={d.code}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClasses}>
          {dict.checkin.documentNumber}
          <input
            required
            value={primary.numeroDocumento}
            onChange={(e) => set("numeroDocumento", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          {dict.checkin.issueState}
          <PlaceAutocomplete
            required
            value={primary.statoRilascio}
            onChange={(v: PlaceRef) => {
              set("statoRilascio", v);
              set("comuneRilascio", null);
            }}
            options={statiOptions}
            placeholder={dict.checkin.issueStatePlaceholder}
          />
        </label>
        {rilascioInItalia && (
          <label className={labelClasses}>
            {dict.checkin.issuePlace}
            <PlaceAutocomplete
              required
              value={primary.comuneRilascio}
              onChange={(v: PlaceRef) => set("comuneRilascio", v)}
              options={comuniOptions}
              placeholder={dict.checkin.issuePlacePlaceholder}
            />
          </label>
        )}
      </div>
    </div>
  );
}

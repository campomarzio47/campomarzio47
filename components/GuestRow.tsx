"use client";

import { Trash2 } from "lucide-react";
import type { Guest } from "@/lib/checkin-types";
import { useLocale } from "@/components/LocaleProvider";
import { statiOptions, comuniOptions, ITALIA_CODE } from "@/lib/reference-data";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";

const inputClasses =
  "w-full rounded-md border border-divider bg-off-white px-3 py-2 text-sm outline-none focus:border-bordeaux";
const labelClasses = "flex flex-col gap-1 text-xs text-mid";

export default function GuestRow({
  guest,
  index,
  onChange,
  onRemove,
  removable,
}: {
  guest: Guest;
  index: number;
  onChange: (guest: Guest) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  const { dict } = useLocale();

  function set<K extends keyof Guest>(key: K, value: Guest[K]) {
    onChange({ ...guest, [key]: value });
  }

  const residenzaInItalia = guest.statoResidenza?.code === ITALIA_CODE;
  const nascitaInItalia = guest.statoNascita?.code === ITALIA_CODE;
  const rilascioInItalia = guest.statoRilascio?.code === ITALIA_CODE;

  return (
    <div className="rounded-md border border-divider p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl">
          {dict.checkin.guest} {index + 1}
        </h3>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={dict.checkin.removeGuest}
            className="text-mid transition-colors hover:text-bordeaux"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClasses}>
          {dict.checkin.lastName}
          <input
            required
            value={guest.cognome}
            onChange={(e) => set("cognome", e.target.value)}
            className={inputClasses}
          />
        </label>
        <label className={labelClasses}>
          {dict.checkin.firstName}
          <input
            required
            value={guest.nome}
            onChange={(e) => set("nome", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          {dict.checkin.sex}
          <select
            value={guest.sesso}
            onChange={(e) => set("sesso", e.target.value as Guest["sesso"])}
            className={inputClasses}
          >
            <option value="M">{dict.checkin.male}</option>
            <option value="F">{dict.checkin.female}</option>
          </select>
        </label>
        <label className={labelClasses}>
          {dict.checkin.birthDate}
          <input
            required
            type="date"
            value={guest.dataNascita}
            onChange={(e) => set("dataNascita", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={`${labelClasses} sm:col-span-2`}>
          {dict.checkin.email}
          <input
            required
            type="email"
            placeholder={dict.checkin.emailPlaceholder}
            value={guest.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          {dict.checkin.citizenship}
          <PlaceAutocomplete
            required
            value={guest.cittadinanza}
            onChange={(v) => set("cittadinanza", v)}
            options={statiOptions}
            placeholder={dict.checkin.citizenshipPlaceholder}
          />
        </label>

        <label className={labelClasses}>
          {dict.checkin.residenceState}
          <PlaceAutocomplete
            required
            value={guest.statoResidenza}
            onChange={(v) => {
              set("statoResidenza", v);
              set("comuneResidenza", null);
              set("localitaResidenzaEstera", "");
            }}
            options={statiOptions}
            placeholder={dict.checkin.residenceStatePlaceholder}
          />
        </label>

        {residenzaInItalia ? (
          <label className={labelClasses}>
            {dict.checkin.residencePlace}
            <PlaceAutocomplete
              required
              value={guest.comuneResidenza}
              onChange={(v) => set("comuneResidenza", v)}
              options={comuniOptions}
              placeholder={dict.checkin.residencePlacePlaceholder}
            />
          </label>
        ) : (
          <label className={labelClasses}>
            {dict.checkin.residenceAbroadPlace}
            <input
              placeholder={dict.checkin.residenceAbroadPlacePlaceholder}
              value={guest.localitaResidenzaEstera}
              onChange={(e) => set("localitaResidenzaEstera", e.target.value)}
              className={inputClasses}
            />
          </label>
        )}

        <label className={`${labelClasses} sm:col-span-2`}>
          {dict.checkin.residenceAddress}
          <input
            required
            placeholder={dict.checkin.residenceAddressPlaceholder}
            value={guest.indirizzoResidenza}
            onChange={(e) => set("indirizzoResidenza", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          {dict.checkin.birthState}
          <PlaceAutocomplete
            required
            value={guest.statoNascita}
            onChange={(v) => {
              set("statoNascita", v);
              set("comuneNascita", null);
            }}
            options={statiOptions}
            placeholder={dict.checkin.birthStatePlaceholder}
          />
        </label>
        {nascitaInItalia && (
          <label className={labelClasses}>
            {dict.checkin.birthPlace}
            <PlaceAutocomplete
              required
              value={guest.comuneNascita}
              onChange={(v) => set("comuneNascita", v)}
              options={comuniOptions}
              placeholder={dict.checkin.birthPlacePlaceholder}
            />
          </label>
        )}

        <label className={labelClasses}>
          {dict.checkin.documentType}
          <select
            value={guest.tipoDocumento}
            onChange={(e) => set("tipoDocumento", e.target.value as Guest["tipoDocumento"])}
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
            value={guest.numeroDocumento}
            onChange={(e) => set("numeroDocumento", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          {dict.checkin.issueState}
          <PlaceAutocomplete
            required
            value={guest.statoRilascio}
            onChange={(v) => {
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
              value={guest.comuneRilascio}
              onChange={(v) => set("comuneRilascio", v)}
              options={comuniOptions}
              placeholder={dict.checkin.issuePlacePlaceholder}
            />
          </label>
        )}
      </div>
    </div>
  );
}

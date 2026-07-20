"use client";

import { Trash2 } from "lucide-react";
import type { Guest, PrimaryGuestExtra } from "@/lib/checkin-types";
import { useLocale } from "@/components/LocaleProvider";
import { statiOptions, comuniOptions, ITALIA_CODE } from "@/lib/reference-data";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import PrimaryGuestExtraFields from "@/components/PrimaryGuestExtraFields";

const inputClasses =
  "w-full rounded-md border border-divider bg-off-white px-3 py-2 text-sm outline-none focus:border-bordeaux";
const labelClasses = "flex flex-col gap-1 text-xs text-mid";

export default function GuestRow({
  guest,
  index,
  onChange,
  onRemove,
  removable,
  isPrimary = false,
  primary,
  onPrimaryChange,
}: {
  guest: Guest;
  index: number;
  onChange: (guest: Guest) => void;
  onRemove: () => void;
  removable: boolean;
  isPrimary?: boolean;
  primary?: PrimaryGuestExtra;
  onPrimaryChange?: (primary: PrimaryGuestExtra) => void;
}) {
  const { dict } = useLocale();

  function set<K extends keyof Guest>(key: K, value: Guest[K]) {
    onChange({ ...guest, [key]: value });
  }

  const residenzaInItalia = guest.statoResidenza?.code === ITALIA_CODE;
  const nascitaInItalia = guest.statoNascita?.code === ITALIA_CODE;
  const primaryGuestIsItalian = guest.cittadinanza?.code === ITALIA_CODE;

  return (
    <div className="rounded-md border border-divider p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl">
          {isPrimary ? dict.checkin.primaryGuestLabel : `${dict.checkin.guest} ${index + 1}`}
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

        <label className={labelClasses}>
          {dict.checkin.birthState}
          <PlaceAutocomplete
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
          {dict.checkin.tourismType}
          <select
            value={guest.tipoTurismo}
            onChange={(e) => set("tipoTurismo", e.target.value as Guest["tipoTurismo"])}
            className={inputClasses}
          >
            {dict.checkin.tourismTypeOptions.map((o) => (
              <option key={o.code} value={o.code}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClasses}>
          {dict.checkin.transportMeans}
          <select
            value={guest.mezzoTrasporto}
            onChange={(e) => set("mezzoTrasporto", e.target.value as Guest["mezzoTrasporto"])}
            className={inputClasses}
          >
            {dict.checkin.transportMeansOptions.map((o) => (
              <option key={o.code} value={o.code}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isPrimary && primary && onPrimaryChange && (
        <PrimaryGuestExtraFields
          primary={primary}
          onChange={onPrimaryChange}
          primaryGuestIsItalian={primaryGuestIsItalian}
        />
      )}
    </div>
  );
}

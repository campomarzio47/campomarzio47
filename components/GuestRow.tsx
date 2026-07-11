"use client";

import { Trash2 } from "lucide-react";
import type { Guest } from "@/lib/checkin-types";
import { useLocale } from "@/components/LocaleProvider";

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

        <label className={labelClasses}>
          {dict.checkin.citizenship}
          <select
            value={guest.cittadinanza}
            onChange={(e) => set("cittadinanza", e.target.value as Guest["cittadinanza"])}
            className={inputClasses}
          >
            <option value="IT">{dict.checkin.citizenshipItaly}</option>
            <option value="ALTRO">{dict.checkin.citizenshipOther}</option>
          </select>
        </label>
        {guest.cittadinanza === "ALTRO" && (
          <label className={labelClasses}>
            &nbsp;
            <input
              required
              placeholder={dict.checkin.citizenshipOtherPlaceholder}
              value={guest.cittadinanzaAltro}
              onChange={(e) => set("cittadinanzaAltro", e.target.value)}
              className={inputClasses}
            />
          </label>
        )}

        <label className={labelClasses}>
          {dict.checkin.residenceState}
          <select
            value={guest.statoResidenza}
            onChange={(e) => set("statoResidenza", e.target.value as Guest["statoResidenza"])}
            className={inputClasses}
          >
            <option value="IT">{dict.checkin.residenceStateItaly}</option>
            <option value="ALTRO">{dict.checkin.residenceStateOther}</option>
          </select>
        </label>
        <label className={labelClasses}>
          {dict.checkin.residencePlace}
          <input
            required={guest.statoResidenza === "IT"}
            placeholder={
              guest.statoResidenza === "IT"
                ? dict.checkin.residencePlaceItalyPlaceholder
                : dict.checkin.residencePlaceOtherPlaceholder
            }
            value={guest.luogoResidenza}
            onChange={(e) => set("luogoResidenza", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          {dict.checkin.birthState}
          <select
            value={guest.statoNascita}
            onChange={(e) =>
              set("statoNascita", e.target.value as Guest["statoNascita"])
            }
            className={inputClasses}
          >
            <option value="">{dict.checkin.birthStateNotSpecified}</option>
            <option value="IT">{dict.checkin.birthStateItaly}</option>
            <option value="ALTRO">{dict.checkin.birthStateOther}</option>
          </select>
        </label>
        {guest.statoNascita === "IT" && (
          <label className={labelClasses}>
            {dict.checkin.birthPlace}
            <input
              placeholder={dict.checkin.birthPlacePlaceholder}
              value={guest.comuneNascita}
              onChange={(e) => set("comuneNascita", e.target.value)}
              className={inputClasses}
            />
          </label>
        )}
        {guest.statoNascita === "ALTRO" && (
          <label className={labelClasses}>
            {dict.checkin.birthState}
            <input
              placeholder={dict.checkin.birthStateOtherPlaceholder}
              value={guest.statoNascitaAltro}
              onChange={(e) => set("statoNascitaAltro", e.target.value)}
              className={inputClasses}
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

        <label className={labelClasses}>
          {dict.checkin.educationLevel}
          <select
            value={guest.titoloStudio}
            onChange={(e) => set("titoloStudio", e.target.value as Guest["titoloStudio"])}
            className={inputClasses}
          >
            <option value="">{dict.checkin.educationLevelNotSpecified}</option>
            {dict.checkin.educationLevelOptions.map((o) => (
              <option key={o.code} value={o.code}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClasses}>
          {dict.checkin.profession}
          <input
            placeholder={dict.checkin.professionPlaceholder}
            value={guest.professione}
            onChange={(e) => set("professione", e.target.value)}
            className={inputClasses}
          />
        </label>
      </div>
    </div>
  );
}

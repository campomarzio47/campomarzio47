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
          {dict.checkin.birthPlace}
          <input
            required
            placeholder={dict.checkin.birthPlacePlaceholder}
            value={guest.comuneStatoNascita}
            onChange={(e) => set("comuneStatoNascita", e.target.value)}
            className={inputClasses}
          />
        </label>
        <label className={labelClasses}>
          {dict.checkin.birthProvince}
          <input
            required
            placeholder={dict.checkin.birthProvincePlaceholder}
            maxLength={2}
            value={guest.provinciaNascita}
            onChange={(e) => set("provinciaNascita", e.target.value.toUpperCase())}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          {dict.checkin.citizenship}
          <input
            required
            placeholder={dict.checkin.citizenshipPlaceholder}
            value={guest.cittadinanza}
            onChange={(e) => set("cittadinanza", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          {dict.checkin.documentType}
          <select
            value={guest.tipoDocumento}
            onChange={(e) =>
              set("tipoDocumento", e.target.value as Guest["tipoDocumento"])
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
            value={guest.numeroDocumento}
            onChange={(e) => set("numeroDocumento", e.target.value)}
            className={inputClasses}
          />
        </label>
        <label className={labelClasses}>
          {dict.checkin.documentPlace}
          <input
            required
            placeholder={dict.checkin.documentPlacePlaceholder}
            value={guest.luogoRilascio}
            onChange={(e) => set("luogoRilascio", e.target.value)}
            className={inputClasses}
          />
        </label>

        <label className={labelClasses}>
          {dict.checkin.residencePlace}
          <input
            required
            placeholder={dict.checkin.residencePlacePlaceholder}
            value={guest.comuneStatoResidenza}
            onChange={(e) => set("comuneStatoResidenza", e.target.value)}
            className={inputClasses}
          />
        </label>
        <label className={labelClasses}>
          {dict.checkin.residenceProvince}
          <input
            required
            placeholder={dict.checkin.residenceProvincePlaceholder}
            maxLength={2}
            value={guest.provinciaResidenza}
            onChange={(e) => set("provinciaResidenza", e.target.value.toUpperCase())}
            className={inputClasses}
          />
        </label>
      </div>
    </div>
  );
}

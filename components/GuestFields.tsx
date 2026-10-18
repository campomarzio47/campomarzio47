"use client";

import type { ReactNode } from "react";
import type { Guest, PrimaryGuestExtra } from "@/lib/checkin-types";
import { useLocale } from "@/components/LocaleProvider";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import ChoiceGroup from "@/components/ChoiceGroup";
import { statiOptions, comuniOptions, ITALIA_CODE } from "@/lib/reference-data";

/** Ospite in compilazione: il sesso parte vuoto e va scelto, mai preimpostato. */
export type GuestDraft = Omit<Guest, "sesso"> & { sesso: Guest["sesso"] | "" };

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-5 sm:grid-cols-2">
      <legend className="mb-5 w-full border-b border-divider pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-mid sm:col-span-2">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

/**
 * Dati anagrafici di un ospite, raggruppati come li si trova sul documento:
 * chi è, dove è nato, dove vive. Per l'ospite principale si aggiungono
 * contatti, indirizzo e codice fiscale (solo se cittadino italiano).
 */
export default function GuestFields({
  idPrefix,
  guest,
  onChange,
  primary,
  onPrimaryChange,
}: {
  idPrefix: string;
  guest: GuestDraft;
  onChange: (guest: GuestDraft) => void;
  primary?: PrimaryGuestExtra;
  onPrimaryChange?: (primary: PrimaryGuestExtra) => void;
}) {
  const { dict } = useLocale();
  const t = dict.checkin;

  function set<K extends keyof GuestDraft>(key: K, value: GuestDraft[K]) {
    onChange({ ...guest, [key]: value });
  }

  const residenzaInItalia = guest.statoResidenza?.code === ITALIA_CODE;
  const nascitaInItalia = guest.statoNascita?.code === ITALIA_CODE;
  const italian = guest.cittadinanza?.code === ITALIA_CODE;
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <div className="flex flex-col gap-10">
      <Group title={t.groups.identity}>
        <label className="field-label" htmlFor={id("cognome")}>
          {t.lastName}
          <input
            id={id("cognome")}
            required
            autoComplete={primary ? "family-name" : "off"}
            autoCapitalize="words"
            value={guest.cognome}
            onChange={(e) => set("cognome", e.target.value)}
            className="field"
          />
        </label>
        <label className="field-label" htmlFor={id("nome")}>
          {t.firstName}
          <input
            id={id("nome")}
            required
            autoComplete={primary ? "given-name" : "off"}
            autoCapitalize="words"
            value={guest.nome}
            onChange={(e) => set("nome", e.target.value)}
            className="field"
          />
        </label>
        <ChoiceGroup
          legend={t.sex}
          name={id("sesso")}
          value={guest.sesso}
          required
          onChange={(v) => set("sesso", v)}
          options={[
            { value: "F", label: t.female },
            { value: "M", label: t.male },
          ]}
        />
        <label className="field-label" htmlFor={id("nascita")}>
          {t.birthDate}
          <input
            id={id("nascita")}
            required
            type="date"
            max={today()}
            autoComplete={primary ? "bday" : "off"}
            value={guest.dataNascita}
            onChange={(e) => set("dataNascita", e.target.value)}
            className="field"
          />
        </label>
        <label className="field-label sm:col-span-2" htmlFor={id("cittadinanza")}>
          {t.citizenship}
          <PlaceAutocomplete
            id={id("cittadinanza")}
            required
            value={guest.cittadinanza}
            onChange={(v) => set("cittadinanza", v)}
            options={statiOptions}
            placeholder={t.citizenshipPlaceholder}
          />
        </label>
      </Group>

      <Group title={t.groups.birth}>
        <label className="field-label" htmlFor={id("stato-nascita")}>
          {t.birthState}
          <PlaceAutocomplete
            id={id("stato-nascita")}
            required
            value={guest.statoNascita}
            onChange={(v) => onChange({ ...guest, statoNascita: v, comuneNascita: null })}
            options={statiOptions}
            placeholder={t.birthStatePlaceholder}
          />
        </label>
        {nascitaInItalia && (
          <label className="field-label animate-fade-up" htmlFor={id("comune-nascita")}>
            {t.birthPlace}
            <PlaceAutocomplete
              id={id("comune-nascita")}
              required
              value={guest.comuneNascita}
              onChange={(v) => set("comuneNascita", v)}
              options={comuniOptions}
              placeholder={t.birthPlacePlaceholder}
            />
          </label>
        )}
      </Group>

      <Group title={t.groups.residence}>
        <label className="field-label" htmlFor={id("stato-residenza")}>
          {t.residenceState}
          <PlaceAutocomplete
            id={id("stato-residenza")}
            required
            value={guest.statoResidenza}
            onChange={(v) =>
              onChange({
                ...guest,
                statoResidenza: v,
                comuneResidenza: null,
                localitaResidenzaEstera: "",
              })
            }
            options={statiOptions}
            placeholder={t.residenceStatePlaceholder}
          />
        </label>
        {residenzaInItalia ? (
          <label className="field-label animate-fade-up" htmlFor={id("comune-residenza")}>
            {t.residencePlace}
            <PlaceAutocomplete
              id={id("comune-residenza")}
              required
              value={guest.comuneResidenza}
              onChange={(v) => set("comuneResidenza", v)}
              options={comuniOptions}
              placeholder={t.residencePlacePlaceholder}
            />
          </label>
        ) : (
          guest.statoResidenza && (
            <label className="field-label animate-fade-up" htmlFor={id("localita-estera")}>
              {t.residenceAbroadPlace}
              <input
                id={id("localita-estera")}
                autoComplete={primary ? "address-level2" : "off"}
                placeholder={t.residenceAbroadPlacePlaceholder}
                value={guest.localitaResidenzaEstera}
                onChange={(e) => set("localitaResidenzaEstera", e.target.value)}
                className="field"
              />
            </label>
          )
        )}

        {primary && onPrimaryChange && (
          <>
            <label className="field-label sm:col-span-2" htmlFor={id("indirizzo")}>
              {t.residenceAddress}
              <input
                id={id("indirizzo")}
                required
                autoComplete="street-address"
                placeholder={t.residenceAddressPlaceholder}
                value={primary.indirizzoResidenza}
                onChange={(e) => onPrimaryChange({ ...primary, indirizzoResidenza: e.target.value })}
                className="field"
              />
            </label>
            <label className="field-label sm:col-span-2" htmlFor={id("email")}>
              {t.email}
              <input
                id={id("email")}
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t.emailPlaceholder}
                value={primary.email}
                onChange={(e) => onPrimaryChange({ ...primary, email: e.target.value })}
                aria-describedby={id("email-hint")}
                className="field"
              />
              <span id={id("email-hint")} className="field-hint">
                {t.emailHint}
              </span>
            </label>
            {italian && (
              <label className="field-label animate-fade-up sm:col-span-2" htmlFor={id("cf")}>
                {t.fiscalCode}
                <input
                  id={id("cf")}
                  required
                  maxLength={16}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={t.fiscalCodePlaceholder}
                  value={primary.codiceFiscale}
                  onChange={(e) =>
                    onPrimaryChange({ ...primary, codiceFiscale: e.target.value.toUpperCase().replace(/\s/g, "") })
                  }
                  className="field tabular tracking-[0.08em]"
                />
              </label>
            )}
          </>
        )}
      </Group>
    </div>
  );
}

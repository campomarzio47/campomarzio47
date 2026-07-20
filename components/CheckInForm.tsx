"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import GuestRow from "@/components/GuestRow";
import PrimaryGuestExtraFields from "@/components/PrimaryGuestExtraFields";
import type { Guest, PrimaryGuestExtra } from "@/lib/checkin-types";
import { property } from "@/content/property";
import { useLocale } from "@/components/LocaleProvider";
import { ITALIA_CODE } from "@/lib/reference-data";

type Status = "idle" | "sending" | "sent" | "error";

// Nessun default "Italia" precompilato: molti ospiti sono stranieri e non
// deve sembrare la risposta gia' scelta per loro.
function emptyGuest(): Guest {
  return {
    cognome: "",
    nome: "",
    sesso: "M",
    dataNascita: "",
    cittadinanza: null,
    statoResidenza: null,
    comuneResidenza: null,
    localitaResidenzaEstera: "",
    statoNascita: null,
    comuneNascita: null,
    tipoTurismo: "Non specificato",
    mezzoTrasporto: "Non Specificato",
  };
}

function emptyPrimary(): PrimaryGuestExtra {
  return {
    email: "",
    indirizzoResidenza: "",
    codiceFiscale: "",
    tipoDocumento: "IDENT",
    numeroDocumento: "",
    statoRilascio: null,
    comuneRilascio: null,
  };
}

const FISCAL_CODE_PATTERN = /^[A-Z]{6}\d{2}[A-EHLMPR-T]\d{2}[A-Z]\d{3}[A-Z]$/;

function guestHasIncompletePlace(guest: Guest): boolean {
  if (!guest.cittadinanza || !guest.statoResidenza) return true;
  if (guest.statoResidenza.code === ITALIA_CODE && !guest.comuneResidenza) return true;
  if (guest.statoNascita?.code === ITALIA_CODE && !guest.comuneNascita) return true;
  return false;
}

function primaryHasIncompletePlace(primary: PrimaryGuestExtra): boolean {
  if (!primary.statoRilascio) return true;
  if (primary.statoRilascio.code === ITALIA_CODE && !primary.comuneRilascio) return true;
  return false;
}

const inputClasses =
  "w-full rounded-md border border-divider bg-off-white px-3 py-2 text-sm outline-none focus:border-bordeaux";
const labelClasses = "flex flex-col gap-1 text-xs text-mid";

export default function CheckInForm() {
  const { dict } = useLocale();
  const [dataArrivo, setDataArrivo] = useState("");
  const [notti, setNotti] = useState(1);
  const [guests, setGuests] = useState<Guest[]>([emptyGuest()]);
  const [primary, setPrimary] = useState<PrimaryGuestExtra>(emptyPrimary());
  const [consenso, setConsenso] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const maxGuests = property.facts.maxGuests;
  const primaryGuestIsItalian = guests[0]?.cittadinanza?.code === ITALIA_CODE;

  function updateGuest(index: number, guest: Guest) {
    setGuests((prev) => prev.map((g, i) => (i === index ? guest : g)));
  }

  function removeGuest(index: number) {
    setGuests((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (guests.some(guestHasIncompletePlace) || primaryHasIncompletePlace(primary)) {
      setStatus("error");
      setError(dict.checkin.errorIncompletePlace);
      return;
    }

    if (primaryGuestIsItalian && !FISCAL_CODE_PATTERN.test(primary.codiceFiscale)) {
      setStatus("error");
      setError(dict.checkin.fiscalCodeInvalid);
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataArrivo, notti, guests, primary, consenso }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? dict.checkin.errorGeneric);
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : dict.checkin.errorGeneric);
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-md border border-divider p-6">
        <p className="font-display text-xl">{dict.checkin.sentTitle}</p>
        <p className="mt-2 text-sm text-mid">{dict.checkin.sentBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClasses}>
          {dict.checkin.arrivalDate}
          <input
            required
            type="date"
            value={dataArrivo}
            onChange={(e) => setDataArrivo(e.target.value)}
            className={inputClasses}
          />
        </label>
        <label className={labelClasses}>
          {dict.checkin.nights}
          <input
            required
            type="number"
            min={1}
            max={60}
            value={notti}
            onChange={(e) => setNotti(Number(e.target.value))}
            className={inputClasses}
          />
        </label>
      </div>

      <div className="flex flex-col gap-4">
        {guests.map((guest, i) => (
          <GuestRow
            key={i}
            guest={guest}
            index={i}
            onChange={(g) => updateGuest(i, g)}
            onRemove={() => removeGuest(i)}
            removable={guests.length > 1}
          />
        ))}
      </div>

      <PrimaryGuestExtraFields
        primary={primary}
        onChange={setPrimary}
        primaryGuestIsItalian={primaryGuestIsItalian}
      />

      {guests.length < maxGuests && (
        <button
          type="button"
          onClick={() => setGuests((prev) => [...prev, emptyGuest()])}
          className="inline-flex items-center gap-2 self-start rounded-md border border-divider px-4 py-2 text-sm transition-colors hover:border-bordeaux hover:text-bordeaux"
        >
          <Plus size={16} />
          {dict.checkin.addGuest}
        </button>
      )}

      <label className="flex items-start gap-3 text-xs text-mid">
        <input
          required
          type="checkbox"
          checked={consenso}
          onChange={(e) => setConsenso(e.target.checked)}
          className="mt-0.5"
        />
        <span>{dict.checkin.consent}</span>
      </label>

      <button
        type="submit"
        disabled={status === "sending" || !consenso}
        className="inline-flex items-center justify-center rounded-md bg-bordeaux px-6 py-3 text-sm font-medium text-off-white transition-colors hover:bg-bordeaux-dark disabled:opacity-60"
      >
        {status === "sending" ? dict.checkin.sending : dict.checkin.submit}
      </button>

      {status === "error" && (
        <p className="text-sm text-bordeaux">{error ?? dict.checkin.errorGeneric}</p>
      )}
    </form>
  );
}

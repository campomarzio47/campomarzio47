"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import GuestFields, { type GuestDraft } from "@/components/GuestFields";
import DocumentFields from "@/components/DocumentFields";
import Stepper from "@/components/Stepper";
import PrivacyAck from "@/components/PrivacyAck";
import { Confirmation } from "@/components/BookingForm";
import { placeDisplayName } from "@/components/PlaceAutocomplete";
import type {
  Guest,
  MezzoTrasporto,
  PlaceRef,
  PrimaryGuestExtra,
  TipoTurismo,
} from "@/lib/checkin-types";
import { property } from "@/content/property";
import { useLocale } from "@/components/LocaleProvider";
import { fill, plural } from "@/content/dictionaries";
import { intlLocale } from "@/lib/locale";
import { ITALIA_CODE } from "@/lib/reference-data";

type Status = "idle" | "sending" | "sent" | "error";
type StepKey =
  | { kind: "stay" }
  | { kind: "primary" }
  | { kind: "document" }
  | { kind: "guest"; index: number }
  | { kind: "review" };

// Nessun default "Italia" precompilato: molti ospiti sono stranieri e non
// deve sembrare la risposta già scelta per loro. Per lo stesso motivo il
// sesso parte vuoto e va scelto.
function emptyGuest(): GuestDraft {
  return {
    cognome: "",
    nome: "",
    sesso: "",
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

function guestHasIncompletePlace(guest: GuestDraft): boolean {
  // Lo stato di nascita è obbligatorio per il tracciato Alloggiati Web,
  // che lo richiede per ogni tipo di alloggiato.
  if (!guest.cittadinanza || !guest.statoResidenza || !guest.statoNascita) return true;
  if (guest.statoResidenza.code === ITALIA_CODE && !guest.comuneResidenza) return true;
  if (guest.statoNascita.code === ITALIA_CODE && !guest.comuneNascita) return true;
  return false;
}

function primaryHasIncompletePlace(primary: PrimaryGuestExtra): boolean {
  if (!primary.statoRilascio) return true;
  if (primary.statoRilascio.code === ITALIA_CODE && !primary.comuneRilascio) return true;
  return false;
}

/**
 * Check-in online, un passo alla volta: soggiorno, chi prenota, documento,
 * gli altri ospiti (uno per passo), conferma. Su un telefono un unico
 * modulo con decine di campi spaventava e si perdeva il segno; a passi si
 * vede sempre quanto manca, e il riepilogo finale permette di correggere
 * prima di inviare.
 *
 * Ogni passo è un <form> a sé: la validazione del browser controlla i
 * campi obbligatori di quel passo prima di andare avanti. I dati restano
 * in memoria, mai nel browser (sono dati di documenti d'identità).
 *
 * Motivo del viaggio e mezzo di trasporto si chiedono una volta per tutto
 * il gruppo e si applicano a ogni ospite: il tracciato Ross1000 li vuole
 * per ospite, ma il viaggio è lo stesso.
 */
export default function CheckInForm() {
  const { dict, locale } = useLocale();
  const t = dict.checkin;
  const [dataArrivo, setDataArrivo] = useState("");
  const [notti, setNotti] = useState<number>(property.pricing.minNights || 1);
  const [tipoTurismo, setTipoTurismo] = useState<TipoTurismo>("Non specificato");
  const [mezzoTrasporto, setMezzoTrasporto] = useState<MezzoTrasporto>("Non Specificato");
  const [guests, setGuests] = useState<GuestDraft[]>([emptyGuest()]);
  const [primary, setPrimary] = useState<PrimaryGuestExtra>(emptyPrimary());
  const [privacyAck, setPrivacyAck] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const maxGuests = property.facts.maxGuests;
  const steps: StepKey[] = [
    { kind: "stay" },
    { kind: "primary" },
    { kind: "document" },
    ...guests.slice(1).map((_, i) => ({ kind: "guest" as const, index: i + 1 })),
    { kind: "review" },
  ];
  const current = steps[Math.min(step, steps.length - 1)];

  function stepTitle(key: StepKey): string {
    if (key.kind === "guest") return fill(t.steps.guest, { n: key.index + 1 });
    return t.steps[key.kind];
  }

  // Cambio passo: si torna in cima al modulo e il focus va sul titolo del
  // nuovo passo, così chi usa uno screen reader sente dove si trova.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const top = topRef.current;
    if (top) {
      const y = top.getBoundingClientRect().top + window.scrollY - 96;
      if (window.scrollY > y) window.scrollTo({ top: y, behavior: "smooth" });
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step, status]);

  function setGuestCount(count: number) {
    setGuests((prev) =>
      count > prev.length
        ? [...prev, ...Array.from({ length: count - prev.length }, emptyGuest)]
        : prev.slice(0, count),
    );
  }

  function updateGuest(index: number, guest: GuestDraft) {
    setGuests((prev) => prev.map((g, i) => (i === index ? guest : g)));
  }

  function goTo(next: number) {
    setError(null);
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function validateCurrent(): string | null {
    if (current.kind === "primary") {
      if (guestHasIncompletePlace(guests[0])) return t.errorIncompletePlace;
      if (guests[0].cittadinanza?.code === ITALIA_CODE && !FISCAL_CODE_PATTERN.test(primary.codiceFiscale)) {
        return t.fiscalCodeInvalid;
      }
    }
    if (current.kind === "document" && primaryHasIncompletePlace(primary)) return t.errorIncompletePlace;
    if (current.kind === "guest" && guestHasIncompletePlace(guests[current.index])) {
      return t.errorIncompletePlace;
    }
    return null;
  }

  async function handleStepSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = validateCurrent();
    if (problem) {
      setError(problem);
      return;
    }
    if (current.kind !== "review") {
      goTo(step + 1);
      return;
    }

    setStatus("sending");
    setError(null);
    const payloadGuests = guests.map((g) => ({ ...g, tipoTurismo, mezzoTrasporto })) as Guest[];
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataArrivo, notti, guests: payloadGuests, primary, privacyAck }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setStatus("error");
        // Il messaggio del server è in italiano e pensato per i log: qui
        // va una frase nella lingua dell'ospite.
        setError(res.status === 400 ? t.errorInvalid : t.errorGeneric);
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setError(t.errorGeneric);
    }
  }

  const longDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return "";
    return new Intl.DateTimeFormat(intlLocale[locale], {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(y, m - 1, d));
  };
  const shortDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return "";
    return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "long" }).format(new Date(y, m - 1, d));
  };
  const place = (p: PlaceRef) => (p ? placeDisplayName(p, locale) : "");

  if (status === "sent") {
    return (
      <Confirmation title={t.sentTitle} body={t.sentBody} back={t.sentBack} />
    );
  }

  const progress = (step + 1) / steps.length;
  const isLast = current.kind === "review";
  const sending = status === "sending";

  let body: ReactNode = null;
  if (current.kind === "stay") {
    body = (
      <div className="flex flex-col gap-8">
        <label className="field-label" htmlFor="checkin-arrival">
          {t.arrivalDate}
          <input
            id="checkin-arrival"
            required
            type="date"
            value={dataArrivo}
            onChange={(e) => setDataArrivo(e.target.value)}
            className="field max-w-xs"
          />
          {dataArrivo && <span className="field-hint first-letter:uppercase">{longDate(dataArrivo)}</span>}
        </label>
        <div className="flex flex-col gap-5 border-y border-divider py-6">
          <Stepper
            id="checkin-nights"
            label={t.nights}
            value={notti}
            min={1}
            max={60}
            onChange={setNotti}
          />
          <Stepper
            id="checkin-guests"
            label={t.guestsCount}
            value={guests.length}
            min={1}
            max={maxGuests}
            onChange={setGuestCount}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field-label" htmlFor="checkin-tourism">
            {t.tourismType}
            <select
              id="checkin-tourism"
              value={tipoTurismo}
              onChange={(e) => setTipoTurismo(e.target.value as TipoTurismo)}
              className="field"
            >
              {t.tourismTypeOptions.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label" htmlFor="checkin-transport">
            {t.transportMeans}
            <select
              id="checkin-transport"
              value={mezzoTrasporto}
              onChange={(e) => setMezzoTrasporto(e.target.value as MezzoTrasporto)}
              className="field"
            >
              {t.transportMeansOptions.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <p className="field-hint sm:col-span-2">{t.groupHint}</p>
        </div>
      </div>
    );
  } else if (current.kind === "primary") {
    body = (
      <GuestFields
        idPrefix="ospite-1"
        guest={guests[0]}
        onChange={(g) => updateGuest(0, g)}
        primary={primary}
        onPrimaryChange={setPrimary}
      />
    );
  } else if (current.kind === "document") {
    body = <DocumentFields primary={primary} onChange={setPrimary} />;
  } else if (current.kind === "guest") {
    body = (
      <GuestFields
        key={current.index}
        idPrefix={`ospite-${current.index + 1}`}
        guest={guests[current.index]}
        onChange={(g) => updateGuest(current.index, g)}
      />
    );
  } else {
    const docType = t.documentTypes.find((d) => d.code === primary.tipoDocumento)?.label ?? "";
    const sections: { title: string; step: number; lines: string[] }[] = [
      {
        title: t.steps.stay,
        step: 0,
        lines: [
          longDate(dataArrivo),
          `${plural(t.nightsCount, notti)} · ${plural(t.guestsTotal, guests.length)}`,
          // "Preferisco non specificare" non dice nulla: nel riepilogo si omette.
          [
            tipoTurismo !== "Non specificato" &&
              t.tourismTypeOptions.find((o) => o.code === tipoTurismo)?.label,
            mezzoTrasporto !== "Non Specificato" &&
              t.transportMeansOptions.find((o) => o.code === mezzoTrasporto)?.label,
          ]
            .filter(Boolean)
            .join(" · "),
        ].filter(Boolean),
      },
      ...guests.map((g, i) => ({
        title: i === 0 ? t.steps.primary : fill(t.steps.guest, { n: i + 1 }),
        step: i === 0 ? 1 : 2 + i,
        lines: [
          `${g.nome} ${g.cognome}`,
          `${fill(t.reviewBorn, { date: shortDate(g.dataNascita) })} · ${
            g.comuneNascita ? place(g.comuneNascita) : place(g.statoNascita)
          }`,
          `${t.citizenship}: ${place(g.cittadinanza)}`,
          `${t.groups.residence}: ${[
            g.comuneResidenza ? place(g.comuneResidenza) : g.localitaResidenzaEstera,
            place(g.statoResidenza),
          ]
            .filter(Boolean)
            .join(", ")}`,
          ...(i === 0
            ? [primary.indirizzoResidenza, primary.email, primary.codiceFiscale].filter(Boolean)
            : []),
        ],
      })),
      {
        title: t.steps.document,
        step: 2,
        lines: [
          fill(t.reviewDocument, { type: docType, number: primary.numeroDocumento }),
          [primary.comuneRilascio && place(primary.comuneRilascio), place(primary.statoRilascio)]
            .filter(Boolean)
            .join(", "),
        ],
      },
    ];
    // Nel riepilogo il documento segue subito chi prenota.
    const ordered = [sections[0], sections[1], sections[sections.length - 1], ...sections.slice(2, -1)];

    body = (
      <div className="flex flex-col gap-8">
        <ul className="flex flex-col divide-y divide-divider border-y border-divider">
          {ordered.map((section) => (
            <li key={section.title} className="flex items-start justify-between gap-6 py-5">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mid">
                  {section.title}
                </p>
                <div className="mt-2 flex flex-col gap-0.5 text-[0.9375rem] leading-relaxed">
                  {section.lines.map((line, i) => (
                    <span key={i} className={i === 0 ? "font-medium first-letter:uppercase" : "break-words text-mid"}>
                      {line}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => goTo(section.step)}
                className="min-h-11 flex-none text-sm font-semibold underline decoration-divider underline-offset-4 transition-colors hover:decoration-charcoal focus-visible:outline-2 focus-visible:outline-bordeaux"
              >
                {t.edit}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-4 rounded-[1.25rem] border border-divider bg-paper p-5 md:p-6">
          <p className="text-xs leading-relaxed text-mid">{t.privacyNotice}</p>
          <PrivacyAck id="checkin-privacy" checked={privacyAck} onChange={setPrivacyAck} />
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="grid gap-10 md:grid-cols-12 md:gap-8">
      <nav aria-label={dict.a11y.progress} className="hidden md:col-span-4 md:block">
        <ol className="sticky top-[calc(var(--header-height)+2rem)] flex flex-col">
          {steps.map((key, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={stepTitle(key)}>
                <button
                  type="button"
                  disabled={!done}
                  onClick={() => goTo(i)}
                  aria-current={active ? "step" : undefined}
                  className={`group flex min-h-12 w-full items-center gap-4 text-left transition-colors duration-300 disabled:cursor-default ${
                    active ? "text-charcoal" : done ? "text-charcoal hover:text-bordeaux" : "text-mid/60"
                  }`}
                >
                  <span
                    className={`tabular flex h-8 w-8 flex-none items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-300 ${
                      active
                        ? "border-charcoal bg-charcoal text-off-white"
                        : done
                          ? "border-charcoal"
                          : "border-divider"
                    }`}
                  >
                    {done ? <Check size={14} strokeWidth={2} aria-hidden="true" /> : i + 1}
                  </span>
                  <span className={`font-display text-xl ${active ? "italic" : ""}`}>{stepTitle(key)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="md:col-span-8">
        <div className="mb-8 md:hidden">
          <div className="flex items-baseline justify-between text-xs font-semibold uppercase tracking-[0.16em] text-mid">
            <span>{fill(t.stepOf, { n: step + 1, total: steps.length })}</span>
          </div>
          <div
            role="progressbar"
            aria-label={dict.a11y.progress}
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-valuenow={step + 1}
            className="mt-3 h-[2px] overflow-hidden bg-divider"
          >
            <div
              className="h-full origin-left bg-bordeaux transition-transform duration-700 ease-out"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
        </div>

        <div key={step} className={direction > 0 ? "animate-step-forward" : "animate-step-back"}>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-[2.4rem] leading-none tracking-[-0.015em] outline-none md:text-[3rem]"
          >
            {stepTitle(current)}
          </h2>
          <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-mid">
            {t.stepIntros[current.kind]}
          </p>

          <form onSubmit={handleStepSubmit} className="mt-10">
            {body}

            {error && (
              <p role="alert" className="mt-8 rounded-xl bg-bordeaux/8 px-4 py-3 text-sm font-medium text-bordeaux">
                {error}
              </p>
            )}

            <div className="sticky bottom-0 z-20 -mx-5 mt-10 flex items-center justify-between gap-4 border-t border-divider bg-off-white/95 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:backdrop-blur-none">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  className="link-arrow flex min-h-12 items-center gap-2 rounded-full pr-3 text-[0.9375rem] font-semibold focus-visible:outline-2 focus-visible:outline-bordeaux"
                >
                  <ArrowLeft size={17} strokeWidth={2} aria-hidden="true" />
                  {t.back}
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={sending || (isLast && !privacyAck)}
                className={`btn ${isLast ? "btn-primary" : "btn-dark"}`}
              >
                {isLast ? (sending ? t.sending : t.submit) : t.next}
                {!sending && <ArrowRight size={17} strokeWidth={2} aria-hidden="true" className="arrow" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

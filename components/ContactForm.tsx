"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import PrivacyAck from "@/components/PrivacyAck";
import Reveal from "@/components/Reveal";
import { property } from "@/content/property";
import { useLocale } from "@/components/LocaleProvider";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const { dict } = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const [privacyAck, setPrivacyAck] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    arrivo: "",
    partenza: "",
    messaggio: "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contatti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, privacyAck }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setForm({ nome: "", email: "", arrivo: "", partenza: "", messaggio: "" });
      setPrivacyAck(false);
    } catch {
      setStatus("error");
    }
  }

  const mailtoHref = `mailto:${property.host.email}?subject=${encodeURIComponent(
    "Richiesta informazioni — " + property.name,
  )}&body=${encodeURIComponent(
    `Nome: ${form.nome}\nArrivo: ${form.arrivo}\nPartenza: ${form.partenza}\n\n${form.messaggio}`,
  )}`;

  if (status === "sent") {
    return (
      <p role="status" className="animate-fade-up rounded-[1.25rem] border border-divider bg-paper p-8 font-display text-2xl leading-snug">
        {dict.contact.sent}
      </p>
    );
  }

  return (
    <Reveal delay={120}>
      <h2 className="font-display text-[1.85rem] leading-tight">{dict.contact.formTitle}</h2>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Etichette vere, non solo placeholder: un placeholder sparisce
              appena si digita e non dà un nome accessibile al campo, quindi
              uno screen reader annuncerebbe solo "casella di testo". */}
          <label className="field-label" htmlFor="contact-name">
            {dict.contact.namePlaceholder}
            <input
              id="contact-name"
              required
              autoComplete="name"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="field"
            />
          </label>
          <label className="field-label" htmlFor="contact-email">
            {dict.contact.emailPlaceholder}
            <input
              id="contact-email"
              required
              type="email"
              inputMode="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="field"
            />
          </label>
          <label className="field-label" htmlFor="contact-arrival">
            {dict.contact.arrivalLabel}
            <input
              id="contact-arrival"
              type="date"
              value={form.arrivo}
              onChange={(e) => setForm({ ...form, arrivo: e.target.value })}
              className="field"
            />
          </label>
          <label className="field-label" htmlFor="contact-departure">
            {dict.contact.departureLabel}
            <input
              id="contact-departure"
              type="date"
              min={form.arrivo || undefined}
              value={form.partenza}
              onChange={(e) => setForm({ ...form, partenza: e.target.value })}
              className="field"
            />
          </label>
        </div>
        <label className="field-label" htmlFor="contact-message">
          {dict.contact.messagePlaceholder}
          <textarea
            id="contact-message"
            required
            rows={5}
            value={form.messaggio}
            onChange={(e) => setForm({ ...form, messaggio: e.target.value })}
            className="field"
          />
        </label>

        <PrivacyAck id="contact-privacy" checked={privacyAck} onChange={setPrivacyAck} />

        <button
          type="submit"
          disabled={status === "sending" || !privacyAck}
          className="btn btn-primary self-start"
        >
          {status === "sending" ? dict.contact.sending : dict.contact.send}
          {status !== "sending" && <ArrowRight size={17} strokeWidth={2} aria-hidden="true" className="arrow" />}
        </button>

        {status === "error" && (
          <p role="alert" className="text-sm font-medium text-bordeaux">
            {dict.contact.errorPrefix}{" "}
            <a
              href={mailtoHref}
              className="rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-bordeaux"
            >
              {dict.contact.errorFallbackLink}
            </a>
            .
          </p>
        )}
      </form>
    </Reveal>
  );
}

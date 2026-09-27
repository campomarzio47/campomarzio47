"use client";

import { useState, type FormEvent } from "react";
import PrivacyAck from "@/components/PrivacyAck";
import { property } from "@/content/property";
import { useLocale } from "@/components/LocaleProvider";

type Status = "idle" | "sending" | "sent" | "error";

const inputClasses =
  "w-full rounded-md border border-divider bg-off-white px-3 py-2 text-sm outline-none placeholder:text-mid focus:border-bordeaux focus-visible:ring-2 focus-visible:ring-bordeaux";
const labelClasses = "flex flex-col gap-1 text-xs text-mid";

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
      <p role="status" className="rounded-md border border-divider p-6 text-sm">
        {dict.contact.sent}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Etichette vere, non solo placeholder: un placeholder sparisce
            appena si digita e non dà un nome accessibile al campo, quindi
            uno screen reader annuncerebbe solo "casella di testo". */}
        <label className={labelClasses} htmlFor="contact-name">
          {dict.contact.namePlaceholder}
          <input
            id="contact-name"
            required
            autoComplete="name"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className={inputClasses}
          />
        </label>
        <label className={labelClasses} htmlFor="contact-email">
          {dict.contact.emailPlaceholder}
          <input
            id="contact-email"
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClasses}
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClasses} htmlFor="contact-arrival">
          {dict.contact.arrivalLabel}
          <input
            id="contact-arrival"
            type="date"
            value={form.arrivo}
            onChange={(e) => setForm({ ...form, arrivo: e.target.value })}
            className={inputClasses}
          />
        </label>
        <label className={labelClasses} htmlFor="contact-departure">
          {dict.contact.departureLabel}
          <input
            id="contact-departure"
            type="date"
            value={form.partenza}
            onChange={(e) => setForm({ ...form, partenza: e.target.value })}
            className={inputClasses}
          />
        </label>
      </div>
      <label className={labelClasses} htmlFor="contact-message">
        {dict.contact.messagePlaceholder}
        <textarea
          id="contact-message"
          required
          rows={4}
          value={form.messaggio}
          onChange={(e) => setForm({ ...form, messaggio: e.target.value })}
          className={inputClasses}
        />
      </label>

      <PrivacyAck id="contact-privacy" checked={privacyAck} onChange={setPrivacyAck} />

      <button
        type="submit"
        disabled={status === "sending" || !privacyAck}
        className="inline-flex items-center justify-center rounded-md bg-bordeaux px-6 py-3 text-sm font-medium text-off-white transition-colors hover:bg-bordeaux-dark disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux focus-visible:ring-offset-2"
      >
        {status === "sending" ? dict.contact.sending : dict.contact.send}
      </button>

      {status === "error" && (
        <p role="alert" className="text-sm text-bordeaux">
          {dict.contact.errorPrefix}{" "}
          <a
            href={mailtoHref}
            className="rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux"
          >
            {dict.contact.errorFallbackLink}
          </a>
          .
        </p>
      )}
    </form>
  );
}

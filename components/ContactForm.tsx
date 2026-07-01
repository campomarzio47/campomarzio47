"use client";

import { useState, type FormEvent } from "react";
import { property } from "@/content/property";
import { useLocale } from "@/components/LocaleProvider";

type Status = "idle" | "sending" | "sent" | "error";

const inputClasses =
  "w-full rounded-md border border-divider bg-off-white px-3 py-2 text-sm outline-none focus:border-bordeaux";

export default function ContactForm() {
  const { dict } = useLocale();
  const [status, setStatus] = useState<Status>("idle");
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
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setForm({ nome: "", email: "", arrivo: "", partenza: "", messaggio: "" });
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
      <p className="rounded-md border border-divider p-6 text-sm">{dict.contact.sent}</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          required
          placeholder={dict.contact.namePlaceholder}
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          className={inputClasses}
        />
        <input
          required
          type="email"
          placeholder={dict.contact.emailPlaceholder}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputClasses}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-mid">
          {dict.contact.arrivalLabel}
          <input
            type="date"
            value={form.arrivo}
            onChange={(e) => setForm({ ...form, arrivo: e.target.value })}
            className={inputClasses}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-mid">
          {dict.contact.departureLabel}
          <input
            type="date"
            value={form.partenza}
            onChange={(e) => setForm({ ...form, partenza: e.target.value })}
            className={inputClasses}
          />
        </label>
      </div>
      <textarea
        required
        placeholder={dict.contact.messagePlaceholder}
        rows={4}
        value={form.messaggio}
        onChange={(e) => setForm({ ...form, messaggio: e.target.value })}
        className={inputClasses}
      />

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center justify-center rounded-md bg-bordeaux px-6 py-3 text-sm font-medium text-off-white transition-colors hover:bg-bordeaux-dark disabled:opacity-60"
      >
        {status === "sending" ? dict.contact.sending : dict.contact.send}
      </button>

      {status === "error" && (
        <p className="text-sm text-bordeaux">
          {dict.contact.errorPrefix}{" "}
          <a href={mailtoHref} className="underline underline-offset-4">
            {dict.contact.errorFallbackLink}
          </a>
          .
        </p>
      )}
    </form>
  );
}

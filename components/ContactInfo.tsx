"use client";

import { ArrowUpRight, Mail, Phone } from "lucide-react";
import Reveal from "@/components/Reveal";
import { property } from "@/content/property";
import { legal } from "@/content/legal";
import { useLocale } from "@/components/LocaleProvider";

/**
 * Il biglietto da visita dell'host: chiamare e scrivere sono due tocchi
 * grandi (è dal telefono che si cerca l'host, spesso già in viaggio),
 * l'indirizzo apre le indicazioni nell'app di mappe del telefono.
 */
export default function ContactInfo() {
  const { dict } = useLocale();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    property.surroundings.mapsQuery || property.address.full,
  )}`;
  const action =
    "group flex min-h-16 items-center justify-between gap-4 border-b border-divider py-4 transition-colors duration-300 hover:text-bordeaux focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux";

  return (
    <Reveal>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mid">{dict.contact.hostLabel}</p>
      <p className="mt-2 font-display text-[2.6rem] leading-none">{property.host.name}</p>
      <p className="mt-3 text-[0.9375rem] text-mid">
        {dict.contact.languagesLabel} {dict.contact.languages.join(", ")}
      </p>

      <div className="mt-8 border-t border-charcoal">
        <a href={`tel:${property.host.phone.replace(/\s/g, "")}`} className={action}>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-mid">
              {dict.contact.call}
            </span>
            <span className="tabular mt-1 block text-lg font-medium">{property.host.phone}</span>
          </span>
          <Phone size={20} strokeWidth={1.5} aria-hidden="true" className="flex-none" />
        </a>
        <a href={`mailto:${legal.business.email}`} className={action}>
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-mid">
              {dict.contact.write}
            </span>
            <span className="mt-1 block text-[0.9375rem] font-medium [overflow-wrap:anywhere]">{legal.business.email}</span>
          </span>
          <Mail size={20} strokeWidth={1.5} aria-hidden="true" className="flex-none" />
        </a>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={action}>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-mid">
              {dict.contact.whereLabel}
            </span>
            <span className="mt-1 block text-lg font-medium">{property.address.full}</span>
            <span className="mt-1 block text-sm text-mid">{dict.contact.directions}</span>
          </span>
          <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" className="flex-none" />
        </a>
      </div>
    </Reveal>
  );
}

"use client";

import { Phone, Mail, MapPin, Languages } from "lucide-react";
import { property } from "@/content/property";
import { legal } from "@/content/legal";
import { useLocale } from "@/components/LocaleProvider";

const linkClasses =
  "rounded-sm underline underline-offset-4 transition-colors hover:text-bordeaux focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux";

export default function ContactInfo() {
  const { dict } = useLocale();

  return (
    <ul className="flex flex-col gap-4 text-sm">
      <li className="flex items-start gap-3">
        <MapPin size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-bordeaux" />
        {property.address.full}
      </li>
      <li className="flex items-start gap-3">
        <Phone size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-bordeaux" />
        <a href={`tel:${property.host.phone.replace(/\s/g, "")}`} className={linkClasses}>
          {property.host.phone}
        </a>
      </li>
      <li className="flex items-start gap-3">
        <Mail size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-bordeaux" />
        <a href={`mailto:${legal.business.email}`} className={linkClasses}>
          {legal.business.email}
        </a>
      </li>
      <li className="flex items-start gap-3">
        <Languages size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-bordeaux" />
        {dict.contact.languages.join(", ")}
      </li>
    </ul>
  );
}

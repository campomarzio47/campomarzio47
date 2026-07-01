"use client";

import { Phone, Mail, MapPin, Languages } from "lucide-react";
import { property } from "@/content/property";
import { useLocale } from "@/components/LocaleProvider";

export default function ContactInfo() {
  const { dict } = useLocale();

  return (
    <ul className="flex flex-col gap-4 text-sm">
      <li className="flex items-start gap-3">
        <MapPin size={18} className="mt-0.5 shrink-0 text-bordeaux" />
        {property.address.full}
      </li>
      <li className="flex items-start gap-3">
        <Phone size={18} className="mt-0.5 shrink-0 text-bordeaux" />
        <a href={`tel:${property.host.phone.replace(/\s/g, "")}`}>{property.host.phone}</a>
      </li>
      <li className="flex items-start gap-3">
        <Mail size={18} className="mt-0.5 shrink-0 text-bordeaux" />
        <a href={`mailto:${property.host.email}`}>{property.host.email}</a>
      </li>
      <li className="flex items-start gap-3">
        <Languages size={18} className="mt-0.5 shrink-0 text-bordeaux" />
        {dict.contact.languages.join(", ")}
      </li>
    </ul>
  );
}

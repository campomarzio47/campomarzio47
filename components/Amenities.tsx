"use client";

import Reveal from "@/components/Reveal";
import { useLocale } from "@/components/LocaleProvider";

/**
 * Servizi della casa come un elenco tipografico — nome e dettaglio, righe
 * sottili — invece della griglia di icone: le icone generiche (wifi, auto,
 * termometro) sono identiche su mille siti e non dicono nulla di questa
 * casa; un dettaglio scritto bene sì ("davanti all'ingresso", "sul tavolo
 * del soggiorno").
 */
export default function Amenities() {
  const { dict } = useLocale();

  return (
    <div className="grid gap-12 md:grid-cols-12 md:gap-8">
      {dict.amenities.groups.map((group, g) => (
        <Reveal
          key={group.title}
          delay={g * 120}
          className={g === 0 ? "md:col-span-7" : "md:col-span-4 md:col-start-9"}
        >
          <h3 className="flex items-baseline justify-between border-b border-charcoal pb-3">
            <span className="font-display text-2xl italic">{group.title}</span>
            <span className="tabular text-xs font-semibold tracking-[0.18em] text-mid">
              {String(group.items.length).padStart(2, "0")}
            </span>
          </h3>
          <ul>
            {group.items.map((item) => (
              <li
                key={item.label}
                className="grid gap-1 border-b border-divider py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-6"
              >
                <span className="text-[1.0625rem] font-medium leading-snug">{item.label}</span>
                <span className="text-[0.9375rem] leading-snug text-mid">{item.detail}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { ImageIcon, Sparkles, CalendarDays } from "lucide-react";
import Hero from "@/components/Hero";
import { useLocale } from "@/components/LocaleProvider";

export default function Home() {
  const { dict } = useLocale();

  const teasers = [
    { href: "/disponibilita", icon: CalendarDays, ...dict.home.availability },
    { href: "/foto", icon: ImageIcon, ...dict.home.photos },
    { href: "/servizi", icon: Sparkles, ...dict.home.amenities },
  ];

  return (
    <>
      <Hero />
      <section className="border-t border-divider">
        <div className="mx-auto grid max-w-4xl gap-px bg-divider px-6 py-px sm:grid-cols-3 md:px-10">
          {teasers.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col gap-2 bg-off-white p-6 transition-colors hover:bg-divider/40"
            >
              <Icon size={20} strokeWidth={1.75} className="text-bordeaux" />
              <span className="font-display text-xl">{title}</span>
              <span className="text-sm text-mid">{description}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

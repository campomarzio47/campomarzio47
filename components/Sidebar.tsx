"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Image as ImageIcon,
  Sparkles,
  Star,
  CalendarDays,
  Mail,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Dictionary } from "@/content/dictionaries";

function navItems(dict: Dictionary) {
  return [
    { href: "/", label: dict.nav.home, icon: Home },
    { href: "/foto", label: dict.nav.photos, icon: ImageIcon },
    { href: "/servizi", label: dict.nav.amenities, icon: Sparkles },
    { href: "/recensioni", label: dict.nav.reviews, icon: Star },
    { href: "/disponibilita", label: dict.nav.availability, icon: CalendarDays },
    { href: "/contatti", label: dict.nav.contact, icon: Mail },
  ];
}

function Logo() {
  return (
    <Link href="/" className="font-display text-2xl tracking-wide">
      Campo Marzio <span className="text-bordeaux">47</span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { dict } = useLocale();
  return (
    <nav className="flex flex-col gap-1">
      {navItems(dict).map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-charcoal text-off-white"
                : "text-mid hover:bg-divider/60 hover:text-charcoal"
            }`}
          >
            <Icon size={17} strokeWidth={1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function CheckInButton({ onNavigate }: { onNavigate?: () => void }) {
  const { dict } = useLocale();
  return (
    <Link
      href="/check-in"
      onClick={onNavigate}
      className="flex items-center justify-center gap-2 rounded-md bg-bordeaux px-3 py-3 text-sm font-medium text-off-white transition-colors hover:bg-bordeaux-dark"
    >
      <LogIn size={17} strokeWidth={2} />
      {dict.nav.checkin}
    </Link>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between border-r border-divider bg-off-white px-5 py-8 md:flex">
        <div className="flex flex-col gap-8">
          <Logo />
          <NavLinks />
        </div>
        <CheckInButton />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-divider bg-off-white/90 px-5 py-4 backdrop-blur-sm md:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-charcoal"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-charcoal/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col justify-between bg-off-white px-5 py-8 shadow-xl">
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  aria-label="Chiudi menu"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-2 text-charcoal"
                >
                  <X size={22} />
                </button>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <CheckInButton onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

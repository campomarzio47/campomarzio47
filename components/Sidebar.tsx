"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Home, Mail, LogIn, CreditCard, Menu, X } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Dictionary } from "@/content/dictionaries";
import { property } from "@/content/property";

const MOBILE_MENU_ID = "menu-mobile";

function navItems(dict: Dictionary) {
  return [
    { href: "/", label: dict.nav.home, icon: Home },
    { href: "/prenota", label: dict.nav.book, icon: CreditCard },
    { href: "/check-in", label: dict.nav.checkin, icon: LogIn },
    { href: "/contatti", label: dict.nav.contact, icon: Mail },
  ];
}

function Logo() {
  const { name, nameAccent } = property;
  const base = nameAccent ? name.replace(nameAccent, "").trimEnd() : name;
  return (
    <Link
      href="/"
      className="rounded-sm font-display text-2xl tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux"
    >
      {nameAccent ? (
        <>
          {base} <span className="text-bordeaux">{nameAccent}</span>
        </>
      ) : (
        name
      )}
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { dict } = useLocale();
  return (
    <nav aria-label={dict.a11y.mainNavigation} className="flex flex-col gap-1">
      {navItems(dict).map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            // aria-current: il colore da solo non dice a uno screen
            // reader quale voce corrisponde alla pagina aperta.
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux ${
              active
                ? "bg-charcoal text-off-white"
                : "text-mid hover:bg-divider/60 hover:text-charcoal"
            }`}
          >
            <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { dict } = useLocale();
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Il drawer è una finestra modale a tutti gli effetti: si chiude con
  // Esc, il focus ci entra all'apertura e torna sul bottone che l'ha
  // aperto alla chiusura, e il Tab non ne esce.
  useEffect(() => {
    if (!open) return;

    const firstLink = drawerRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-8 border-r border-divider bg-off-white px-5 py-8 md:flex">
        <Logo />
        <NavLinks />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-divider bg-off-white/90 px-5 py-4 backdrop-blur-sm md:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            ref={toggleRef}
            aria-label={open ? dict.a11y.closeMenu : dict.a11y.openMenu}
            aria-expanded={open}
            aria-controls={MOBILE_MENU_ID}
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux"
          >
            {open ? (
              <X size={22} aria-hidden="true" />
            ) : (
              <Menu size={22} aria-hidden="true" />
            )}
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
          <div
            ref={drawerRef}
            id={MOBILE_MENU_ID}
            role="dialog"
            aria-modal="true"
            aria-label={dict.a11y.mainNavigation}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col gap-8 bg-off-white px-5 py-8 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button
                aria-label={dict.a11y.closeMenu}
                onClick={() => {
                  setOpen(false);
                  toggleRef.current?.focus();
                }}
                className="rounded-md p-2 text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

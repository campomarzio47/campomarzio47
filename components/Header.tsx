"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileMenu from "@/components/MobileMenu";
import { navItems } from "@/components/nav-items";
import { property } from "@/content/property";

const MENU_ID = "menu-mobile";

export function Wordmark({ className = "" }: { className?: string }) {
  const { name, nameAccent } = property;
  const base = nameAccent ? name.replace(nameAccent, "").trimEnd() : name;
  return (
    <span className={`whitespace-nowrap font-display tracking-tight ${className}`}>
      {nameAccent ? (
        <>
          {base} <em className="italic">{nameAccent}</em>
        </>
      ) : (
        name
      )}
    </span>
  );
}

/**
 * Intestazione unica per telefono e desktop (sostituisce la vecchia
 * sidebar, che su un sito di fotografie rubava 256 px di larghezza a ogni
 * pagina).
 *
 * - In home, sopra la foto, è trasparente con il testo chiaro; scendendo
 *   diventa carta semitrasparente.
 * - Si nasconde mentre si scorre verso il basso e ricompare appena si
 *   risale: sul telefono restituisce lo schermo al contenuto, senza mai
 *   costringere a tornare in cima per cambiare pagina.
 * - Sul telefono "Check-in" resta sempre a vista accanto a "Menu": è la
 *   ragione per cui la maggior parte delle persone apre il sito.
 */
export default function Header() {
  const pathname = usePathname();
  const { dict } = useLocale();
  const isHome = pathname === "/";
  const [overHero, setOverHero] = useState(isHome);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    function update() {
      frame = 0;
      const y = window.scrollY;
      // In home l'intestazione resta trasparente finché la foto occupa
      // ancora gran parte dello schermo.
      setOverHero(isHome && y < window.innerHeight * 0.55);
      if (y < 120) setHidden(false);
      else if (Math.abs(y - lastY) > 6) setHidden(y > lastY);
      lastY = y;
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isHome]);

  const light = overHero && !menuOpen;
  const items = navItems(dict);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-[transform,background-color,border-color,color] duration-500 ease-out ${
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
        } ${
          light
            ? "border-transparent bg-transparent text-off-white"
            : "border-divider/80 bg-off-white/88 text-charcoal backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-[var(--header-height)] max-w-7xl items-center justify-between gap-6 px-5 md:px-10">
          <Link
            href="/"
            className="-mx-1 flex min-h-11 items-center rounded-sm px-1 text-[1.25rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux md:text-[1.5rem]"
          >
            <Wordmark />
          </Link>

          <nav aria-label={dict.a11y.mainNavigation} className="hidden md:block">
            <ul className="flex items-center gap-8 text-[0.9375rem]">
              {items.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      // aria-current: il colore da solo non dice a uno
                      // screen reader quale voce corrisponde alla pagina.
                      aria-current={active ? "page" : undefined}
                      className="group relative flex min-h-11 items-center rounded-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux"
                    >
                      {label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-0 bottom-2 h-px origin-left bg-current transition-transform duration-500 ease-out ${
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1 md:gap-0">
            <LanguageSwitcher
              tone={light ? "light" : "dark"}
              className="hidden md:flex md:pl-4"
            />
            {pathname !== "/check-in" && (
              <Link
                href="/check-in"
                className="flex min-h-11 items-center whitespace-nowrap rounded-full px-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-bordeaux md:hidden"
              >
                Check-in
              </Link>
            )}
            <button
              ref={toggleRef}
              type="button"
              aria-label={dict.a11y.openMenu}
              aria-expanded={menuOpen}
              aria-controls={MENU_ID}
              onClick={() => setMenuOpen(true)}
              className="-mr-2 flex min-h-11 items-center gap-2.5 rounded-full px-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-bordeaux md:hidden"
            >
              {dict.nav.menu}
              <span aria-hidden="true" className="flex w-5 flex-col gap-[5px]">
                <span className="h-px w-full bg-current" />
                <span className="h-px w-3/5 self-end bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* La home fa scorrere la foto sotto l'intestazione; le altre pagine
          partono subito sotto. */}
      {!isHome && <div aria-hidden="true" className="h-[var(--header-height)]" />}

      <MobileMenu id={MENU_ID} open={menuOpen} onClose={closeMenu} />
    </>
  );
}

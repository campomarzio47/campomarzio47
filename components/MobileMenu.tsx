"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "@/components/LocaleProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Wordmark } from "@/components/Header";
import { navItems } from "@/components/nav-items";
import { useDialog } from "@/lib/hooks/useDialog";
import { usePresence, useHydrated } from "@/lib/hooks/usePresence";
import { property } from "@/content/property";
import { legal } from "@/content/legal";

/**
 * Menu a tutto schermo per il telefono: un sipario scuro che scende, le
 * voci in grande che salgono una dopo l'altra. È una finestra modale a
 * tutti gli effetti (role="dialog", Esc, focus intrappolato e restituito
 * al bottone "Menu"), montata con un portale perché l'intestazione usa
 * `transform` per nascondersi.
 */
export default function MobileMenu({
  id,
  open,
  onClose,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
}) {
  const { dict } = useLocale();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { mounted, closing } = usePresence(open, 400);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useDialog(open, onClose, panelRef, closeRef);

  if (!hydrated || !mounted) return null;

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label={dict.a11y.mainNavigation}
      className={`fixed inset-0 z-50 flex flex-col overflow-y-auto bg-charcoal text-off-white md:hidden ${
        closing ? "animate-curtain-out" : "animate-curtain"
      }`}
    >
      <div className="flex h-[var(--header-height)] flex-none items-center justify-between px-5">
        <Link href="/" onClick={onClose} className="flex min-h-11 items-center text-[1.3rem]">
          <Wordmark />
        </Link>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={dict.a11y.closeMenu}
          className="-mr-2 flex min-h-11 items-center gap-2.5 rounded-full px-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-off-white"
        >
          {dict.nav.close}
          <span aria-hidden="true" className="relative block h-5 w-5">
            <span className="absolute left-0 top-1/2 h-px w-full rotate-45 bg-current" />
            <span className="absolute left-0 top-1/2 h-px w-full -rotate-45 bg-current" />
          </span>
        </button>
      </div>

      <nav aria-label={dict.a11y.mainNavigation} className="flex-1 px-5 pt-10">
        <ul className="flex flex-col">
          {navItems(dict).map(({ href, label }, i) => {
            const active = pathname === href;
            return (
              <li
                key={href}
                className="animate-fade-up border-b border-off-white/10"
                style={{ "--delay": `${180 + i * 70}ms` } as CSSProperties}
              >
                <Link
                  href={href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className="group flex items-center justify-between py-4 font-display text-[2.35rem] leading-tight focus-visible:outline-2 focus-visible:outline-off-white"
                >
                  <span className={active ? "italic" : ""}>{label}</span>
                  {active ? (
                    <span aria-hidden="true" className="checker h-3 w-3" style={{ "--checker-size": "3px", "--checker-color": "var(--color-off-white)" } as CSSProperties} />
                  ) : (
                    <span aria-hidden="true" className="text-xl text-off-white/40 transition-transform duration-300 group-active:translate-x-1">
                      →
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className="animate-fade-up flex flex-col gap-6 px-5 pb-8 pt-10"
        style={{ "--delay": "480ms" } as CSSProperties}
      >
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-off-white/55">
            {dict.footer.languageHeading}
          </p>
          <LanguageSwitcher variant="full" tone="light" className="flex-wrap" />
        </div>
        <div className="flex flex-col gap-1 text-sm text-off-white/75">
          <a href={`tel:${property.host.phone.replace(/\s/g, "")}`} className="flex min-h-11 items-center">
            {property.host.phone}
          </a>
          <a href={`mailto:${legal.business.email}`} className="flex min-h-11 items-center break-all">
            {legal.business.email}
          </a>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="checker h-3 flex-none pb-[env(safe-area-inset-bottom)]"
        style={{ "--checker-color": "var(--color-bordeaux)" } as CSSProperties}
      />
    </div>,
    document.body,
  );
}

"use client";

import { useLocale } from "@/components/LocaleProvider";
import { locales, localeNames } from "@/lib/locale";

/**
 * Selettore di lingua.
 * - `compact`: sigle (IT · EN · DE), per l'intestazione su desktop.
 * - `full`: nomi per esteso, ciascuno nella propria lingua, per il menu su
 *   telefono e il piè di pagina — chi cerca "Deutsch" non cerca "Tedesco".
 */
export default function LanguageSwitcher({
  variant = "compact",
  tone = "dark",
  className = "",
}: {
  variant?: "compact" | "full";
  tone?: "dark" | "light";
  className?: string;
}) {
  const { locale, setLocale, dict } = useLocale();

  const idle = tone === "light" ? "text-off-white/65 hover:text-off-white" : "text-mid hover:text-charcoal";
  const active = tone === "light" ? "text-off-white" : "text-charcoal";

  return (
    <div
      role="group"
      aria-label={dict.languageSwitcher.label}
      className={`flex items-center ${variant === "full" ? "gap-2" : "gap-0.5"} ${className}`}
    >
      {locales.map((code) => {
        const isActive = code === locale;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            onClick={() => setLocale(code)}
            aria-pressed={isActive}
            aria-label={variant === "compact" ? localeNames[code] : undefined}
            className={
              variant === "full"
                ? `relative min-h-11 rounded-full border px-4 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux ${
                    isActive
                      ? tone === "light"
                        ? "border-off-white bg-off-white text-charcoal"
                        : "border-charcoal bg-charcoal text-off-white"
                      : tone === "light"
                        ? "border-off-white/25 text-off-white/80 hover:border-off-white/60"
                        : "border-divider text-charcoal hover:border-charcoal"
                  }`
                : `relative min-h-11 min-w-9 px-1.5 text-xs font-semibold tracking-[0.14em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux ${
                    isActive ? active : idle
                  }`
            }
          >
            {variant === "full" ? localeNames[code] : code.toUpperCase()}
            {variant === "compact" && (
              <span
                aria-hidden="true"
                className={`absolute inset-x-1.5 bottom-2.5 h-px origin-left bg-current transition-transform duration-500 ease-out ${
                  isActive ? "scale-x-100" : "scale-x-0"
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

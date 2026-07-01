"use client";

import { useLocale } from "@/components/LocaleProvider";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label="Lingua / Language"
      className={`flex overflow-hidden rounded-full border border-divider bg-off-white/95 text-xs font-medium shadow-sm backdrop-blur-sm ${className}`}
    >
      <button
        onClick={() => setLocale("it")}
        aria-pressed={locale === "it"}
        className={`px-3 py-1.5 transition-colors ${
          locale === "it" ? "bg-charcoal text-off-white" : "text-mid hover:text-charcoal"
        }`}
      >
        IT
      </button>
      <button
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`px-3 py-1.5 transition-colors ${
          locale === "en" ? "bg-charcoal text-off-white" : "text-mid hover:text-charcoal"
        }`}
      >
        EN
      </button>
    </div>
  );
}

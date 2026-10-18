// Ordine = ordine in cui compaiono nel selettore di lingua.
export const locales = ["it", "en", "de"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "it";
export const LOCALE_COOKIE = "locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return (locales as readonly string[]).includes(value ?? "");
}

/** Tag BCP 47 per `Intl` (prezzi, date nelle email): inglese britannico, settimana che inizia di lunedì. */
export const intlLocale: Record<Locale, string> = {
  it: "it-IT",
  en: "en-GB",
  de: "de-DE",
};

/** Nome di ogni lingua scritto nella lingua stessa, come lo cerca chi la parla. */
export const localeNames: Record<Locale, string> = {
  it: "Italiano",
  en: "English",
  de: "Deutsch",
};

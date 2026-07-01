export type Locale = "it" | "en";

export const defaultLocale: Locale = "it";
export const LOCALE_COOKIE = "locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "it" || value === "en";
}

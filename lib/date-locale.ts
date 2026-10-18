import { format } from "date-fns";
import { it, enGB, de, type Locale as DateFnsLocale } from "date-fns/locale";
import type { Locale } from "@/lib/locale";

/**
 * Locale date-fns per calendario e date formattate. Inglese britannico e
 * non americano: la settimana parte di lunedì come nel resto d'Europa, e
 * un calendario che la fa partire di domenica sposta le colonne rispetto a
 * quello che l'ospite si aspetta.
 */
export const dateFnsLocale: Record<Locale, DateFnsLocale> = { it, en: enGB, de };

/**
 * Formati brevi per lingua: date-fns traduce i nomi, non la punteggiatura.
 * Con un formato unico il tedesco usciva "Fr. 20 Nov." invece di
 * "Fr., 20. Nov.".
 */
const patterns: Record<Locale, { weekdayDayMonth: string; dayMonth: string }> = {
  it: { weekdayDayMonth: "EEE d MMM", dayMonth: "d MMM" },
  en: { weekdayDayMonth: "EEE d MMM", dayMonth: "d MMM" },
  de: { weekdayDayMonth: "EEE, d. MMM", dayMonth: "d. MMM" },
};

/** "gio 22 ott" · "Thu 22 Oct" · "Do., 22. Okt." */
export function formatWeekdayDayMonth(date: Date, locale: Locale): string {
  return format(date, patterns[locale].weekdayDayMonth, { locale: dateFnsLocale[locale] });
}

/** "22 ott" · "22 Oct" · "22. Okt." */
export function formatDayMonth(date: Date, locale: Locale): string {
  return format(date, patterns[locale].dayMonth, { locale: dateFnsLocale[locale] });
}

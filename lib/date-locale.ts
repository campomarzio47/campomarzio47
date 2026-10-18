import { it, enGB, de, type Locale as DateFnsLocale } from "date-fns/locale";
import type { Locale } from "@/lib/locale";

/**
 * Locale date-fns per calendario e date formattate. Inglese britannico e
 * non americano: la settimana parte di lunedì come nel resto d'Europa, e
 * un calendario che la fa partire di domenica sposta le colonne rispetto a
 * quello che l'ospite si aspetta.
 */
export const dateFnsLocale: Record<Locale, DateFnsLocale> = { it, en: enGB, de };

import { CalendarDay } from "../domain/values/CalendarDay.js";
import type { DateProvider } from "../domain/ports.js";

/**
 * L'horloge est une dépendance : elle change à chaque appel, il faut pouvoir
 * la figer. L'arithmétique des dates, elle, est pure : elle vit dans les
 * Value Objects. Pourquoi voudriez-vous que `isBefore` mente ?
 *
 * `en-CA` formate en "YYYY-MM-DD", et `timeZone` attend un identifiant IANA.
 */
export const systemDateProvider: DateProvider = {
  today: (timeZone = "Europe/Paris") =>
    CalendarDay.parse(
      new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date())
    ).value,
};

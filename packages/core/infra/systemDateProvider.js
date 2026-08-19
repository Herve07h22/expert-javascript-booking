import { CalendarDay } from "../domain/values/CalendarDay.js";

/**
 * L'horloge est une dépendance : elle change à chaque appel, il faut pouvoir la figer.
 * L'arithmétique des dates, elle, est pure : elle vit dans CalendarDay et Stay.
 *
 * `en-CA` formate en "YYYY-MM-DD", et `timeZone` attend un identifiant IANA
 * ("Europe/Paris"), pas un code pays.
 */
export const systemDateProvider = {
  today: (timeZone = "Europe/Paris") =>
    CalendarDay.parse(
      new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date())
    ).value,
};

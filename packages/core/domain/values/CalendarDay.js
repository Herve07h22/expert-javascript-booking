import { Result } from "./Result.js";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Un jour du calendrier : "le 2 juin 2024".
 *
 * Ce n'est PAS un instant. `new Date("2024-06-02")` est un point sur l'axe du
 * temps (minuit UTC), qui devient le 1er juin à Mexico et le 2 juin à Paris.
 * Une date d'arrivée n'a ni heure ni fuseau : elle vaut le 2 juin pour tout le
 * monde. C'est pourquoi le domaine ne manipule jamais d'objet `Date`.
 */
export class CalendarDay {
  #iso;

  constructor(iso) {
    this.#iso = iso;
    Object.freeze(this);
  }

  /** Seule porte d'entrée : "2024-06-02" -> Result<CalendarDay>. */
  static parse(value) {
    if (value instanceof CalendarDay) return Result.ok(value);
    if (typeof value !== "string" || !ISO_DAY.test(value)) {
      return Result.error(NotACalendarDay(value));
    }
    // Attrape les jours qui n'existent pas : le 31 février bascule au 2 mars.
    const asUtc = new Date(`${value}T00:00:00Z`);
    if (
      Number.isNaN(asUtc.valueOf()) ||
      asUtc.toISOString().slice(0, 10) !== value
    ) {
      return Result.error(NotACalendarDay(value));
    }
    return Result.ok(new CalendarDay(value));
  }

  /** Deux jours ISO-8601 se comparent lexicographiquement. Aucune conversion. */
  isBefore(other) {
    return this.#iso < other.#iso;
  }

  isAfter(other) {
    return other.isBefore(this);
  }

  equals(other) {
    return other instanceof CalendarDay && this.#iso === other.#iso;
  }

  toString() {
    return this.#iso;
  }

  toJSON() {
    return this.#iso;
  }
}

export function NotACalendarDay(value) {
  return new Error(
    `Not a calendar day (expected "YYYY-MM-DD") : ${String(value)}`
  );
}

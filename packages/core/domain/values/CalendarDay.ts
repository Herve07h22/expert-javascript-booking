import { Result } from "./Result.js";
import { NotACalendarDay } from "../errorCodes.js";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Un jour du calendrier : "le 2 juin 2024". Ce n'est PAS un instant.
 * Une date d'arrivée n'a ni heure ni fuseau : elle vaut le 2 juin pour tout
 * le monde. C'est pourquoi le domaine ne manipule jamais d'objet `Date`.
 */
export class CalendarDay {
  readonly #iso: string;

  private constructor(iso: string) {
    this.#iso = iso;
    Object.freeze(this);
  }

  /** Seule porte d'entrée. Elle accepte `unknown` : c'est une frontière. */
  static parse(value: unknown): Result<CalendarDay> {
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
  isBefore(other: CalendarDay): boolean {
    return this.#iso < other.#iso;
  }

  isAfter(other: CalendarDay): boolean {
    return other.isBefore(this);
  }

  equals(other: unknown): boolean {
    return other instanceof CalendarDay && this.#iso === other.#iso;
  }

  toString(): string {
    return this.#iso;
  }

  toJSON(): string {
    return this.#iso;
  }
}

import { Result } from "./Result.js";
import { CalendarDay } from "./CalendarDay.js";
import { StayMustLastAtLeastOneNight } from "../errorCodes.js";

/**
 * Un séjour : du jour d'arrivée (inclus) au jour de départ (exclu).
 * L'intervalle semi-ouvert [from, to) est ce qui autorise la rotation.
 */
export class Stay {
  readonly #from: CalendarDay;
  readonly #to: CalendarDay;

  private constructor(from: CalendarDay, to: CalendarDay) {
    this.#from = from;
    this.#to = to;
    Object.freeze(this);
  }

  static of(from: CalendarDay, to: CalendarDay): Result<Stay> {
    // L'invariant est dans le constructeur : il n'existe nulle part dans le
    // système de Stay qui dure zéro nuit.
    if (!from.isBefore(to)) {
      return Result.error(StayMustLastAtLeastOneNight(from, to));
    }
    return Result.ok(new Stay(from, to));
  }

  /** Trois erreurs possibles, et pas un seul `if` : c'est flatMap. */
  static parse(input: { from?: unknown; to?: unknown }): Result<Stay> {
    return CalendarDay.parse(input.from).flatMap((from) =>
      CalendarDay.parse(input.to).flatMap((to) => Stay.of(from, to))
    );
  }

  get from(): CalendarDay {
    return this.#from;
  }

  get to(): CalendarDay {
    return this.#to;
  }

  get nights(): number {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const toUtc = (day: CalendarDay) =>
      new Date(`${day.toString()}T00:00:00Z`).valueOf();
    return Math.round((toUtc(this.#to) - toUtc(this.#from)) / MS_PER_DAY);
  }

  /** Le séjour commence-t-il strictement après ce jour ? */
  startsAfter(day: CalendarDay): boolean {
    return day.isBefore(this.#from);
  }

  /** Deux séjours se recouvrent-ils ? Le jour de départ ne compte pas. */
  overlaps(other: Stay): boolean {
    return this.#from.isBefore(other.to) && other.from.isBefore(this.#to);
  }

  toJSON(): { from: string; to: string } {
    return { from: this.#from.toJSON(), to: this.#to.toJSON() };
  }
}

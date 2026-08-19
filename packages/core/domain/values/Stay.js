import { StayMustLastAtLeastOneNight } from "../errorCodes.js";
import { Result } from "./Result.js";
import { CalendarDay } from "./CalendarDay.js";

/**
 * Un séjour : du jour d'arrivée (inclus) au jour de départ (exclu).
 *
 * L'intervalle est semi-ouvert [from, to). C'est ce qui autorise la rotation :
 * un vacancier qui part le 4 ne bloque pas celui qui arrive le 4.
 */
export class Stay {
  #from;
  #to;

  constructor(from, to) {
    this.#from = from;
    this.#to = to;
    Object.freeze(this);
  }

  /** À partir de deux CalendarDay déjà construits. */
  static of(from, to) {
    if (!from.isBefore(to)) {
      return Result.error(StayMustLastAtLeastOneNight(from, to));
    }
    return Result.ok(new Stay(from, to));
  }

  /** À partir de deux chaînes ISO : { from: "2024-06-02", to: "2024-06-04" }. */
  static parse({ from, to }) {
    return CalendarDay.parse(from).flatMap((parsedFrom) =>
      CalendarDay.parse(to).flatMap((parsedTo) => Stay.of(parsedFrom, parsedTo))
    );
  }

  get from() {
    return this.#from;
  }

  get to() {
    return this.#to;
  }

  get nights() {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const toUtc = (day) => new Date(`${day}T00:00:00Z`).valueOf();
    return Math.round((toUtc(this.#to) - toUtc(this.#from)) / MS_PER_DAY);
  }

  /** Le séjour commence-t-il strictement après ce jour ? */
  startsAfter(day) {
    return day.isBefore(this.#from);
  }

  /** Deux séjours se recouvrent-ils ? Le jour de départ ne compte pas. */
  overlaps(other) {
    return this.#from.isBefore(other.to) && other.from.isBefore(this.#to);
  }

  toJSON() {
    return { from: this.#from.toJSON(), to: this.#to.toJSON() };
  }
}


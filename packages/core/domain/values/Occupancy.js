import { Result } from "./Result.js";

/**
 * Le nombre d'occupants d'un séjour.
 *
 * Ce sont des `guests` (les vacanciers), pas des `hosts` :
 * dans ce métier, un host est le propriétaire qui met son logement en location.
 */
export class Occupancy {
  #adults;
  #children;

  constructor(adults, children) {
    this.#adults = adults;
    this.#children = children;
    Object.freeze(this);
  }

  static of({ adults, children = 0 }) {
    if (!Number.isInteger(adults) || adults < 1) {
      return Result.error(NeedsAtLeastOneAdult(adults));
    }
    if (!Number.isInteger(children) || children < 0) {
      return Result.error(InvalidChildrenCount(children));
    }
    return Result.ok(new Occupancy(adults, children));
  }

  get adults() {
    return this.#adults;
  }

  get children() {
    return this.#children;
  }

  get total() {
    return this.#adults + this.#children;
  }

  toJSON() {
    return { adults: this.#adults, children: this.#children };
  }
}

export function NeedsAtLeastOneAdult(adults) {
  return new Error(`A booking needs at least one adult (got ${adults})`);
}

export function InvalidChildrenCount(children) {
  return new Error(`Invalid number of children (got ${children})`);
}

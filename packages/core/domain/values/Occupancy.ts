import { Result } from "./Result.js";
import { NeedsAtLeastOneAdult, InvalidChildrenCount } from "../errorCodes.js";

/**
 * Ce sont des `guests` (les vacanciers), pas des `hosts` : dans ce métier,
 * un host est le propriétaire qui met son logement en location.
 */
export class Occupancy {
  readonly #adults: number;
  readonly #children: number;

  private constructor(adults: number, children: number) {
    this.#adults = adults;
    this.#children = children;
    Object.freeze(this);
  }

  static of(input: { adults?: unknown; children?: unknown }): Result<Occupancy> {
    const { adults, children = 0 } = input;
    if (!Number.isInteger(adults) || (adults as number) < 1) {
      return Result.error(NeedsAtLeastOneAdult(adults));
    }
    if (!Number.isInteger(children) || (children as number) < 0) {
      return Result.error(InvalidChildrenCount(children));
    }
    return Result.ok(new Occupancy(adults as number, children as number));
  }

  get adults(): number {
    return this.#adults;
  }

  get children(): number {
    return this.#children;
  }

  get total(): number {
    return this.#adults + this.#children;
  }

  toJSON(): { adults: number; children: number } {
    return { adults: this.#adults, children: this.#children };
  }
}

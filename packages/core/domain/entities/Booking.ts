import type { Occupancy } from "../values/Occupancy.js";
import type { Stay } from "../values/Stay.js";
import type { AccommodationId, BookingId, TenantId } from "../ids.js";

export const bookingStatus = {
  confirmed: "confirmed",
  cancelled: "cancelled",
} as const;

export type BookingStatus = (typeof bookingStatus)[keyof typeof bookingStatus];

export interface BookingProps {
  id: BookingId;
  tenantId: TenantId;
  accommodationId: AccommodationId;
  guests: Occupancy;
  stay: Stay;
  status: BookingStatus;
}

/**
 * Une ENTITÉ : elle a une identité propre.
 *
 * Elle est gelée, et pourtant mutable au sens du chapitre 3 : ce qui change
 * au fil du temps, c'est la réservation dans le système, pas l'objet en
 * mémoire. `cancel()` retourne une instance portant le MÊME identifiant.
 */
export class Booking {
  readonly #props: BookingProps;

  constructor(props: BookingProps) {
    this.#props = props;
    Object.freeze(this);
  }

  static confirm(props: Omit<BookingProps, "status">): Booking {
    return new Booking({ ...props, status: bookingStatus.confirmed });
  }

  get id(): BookingId {
    return this.#props.id;
  }

  get tenantId(): TenantId {
    return this.#props.tenantId;
  }

  get accommodationId(): AccommodationId {
    return this.#props.accommodationId;
  }

  get guests(): Occupancy {
    return this.#props.guests;
  }

  get stay(): Stay {
    return this.#props.stay;
  }

  get status(): BookingStatus {
    return this.#props.status;
  }

  isActive(): boolean {
    return this.#props.status === bookingStatus.confirmed;
  }

  belongsTo(user: { id: string }): boolean {
    return this.#props.tenantId === user.id;
  }

  /** La seule transition possible est celle qui a un nom métier. */
  cancel(): Booking {
    return new Booking({ ...this.#props, status: bookingStatus.cancelled });
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.#props.id,
      tenantId: this.#props.tenantId,
      accommodationId: this.#props.accommodationId,
      guests: this.#props.guests.toJSON(),
      stay: this.#props.stay.toJSON(),
      status: this.#props.status,
    };
  }
}

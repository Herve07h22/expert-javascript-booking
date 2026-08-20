import type { Booking } from "./entities/Booking.js";

/**
 * Un événement est un FAIT : au passé, adressé à personne, irréfutable.
 * Sa charge utile reste plate : il est fait pour voyager.
 */
export interface DomainEvent<P = Record<string, unknown>> {
  id: string;
  type: string;
  payload: P;
}

export interface BookingEventPayload extends Record<string, unknown> {
  bookingId: string;
  tenantId: string;
  accommodationId: string;
  from: string;
  to: string;
}

export function BookingConfirmed(
  booking: Booking,
  eventId: string
): DomainEvent<BookingEventPayload & { guests: number }> {
  return {
    id: eventId,
    type: "BookingConfirmed",
    payload: {
      bookingId: booking.id,
      tenantId: booking.tenantId,
      accommodationId: booking.accommodationId,
      from: booking.stay.from.toString(),
      to: booking.stay.to.toString(),
      guests: booking.guests.total,
    },
  };
}

export function BookingCancelled(
  booking: Booking,
  eventId: string
): DomainEvent<BookingEventPayload> {
  return {
    id: eventId,
    type: "BookingCancelled",
    payload: {
      bookingId: booking.id,
      tenantId: booking.tenantId,
      accommodationId: booking.accommodationId,
      from: booking.stay.from.toString(),
      to: booking.stay.to.toString(),
    },
  };
}

/**
 * Un événement est un FAIT : il est au passé, il ne s'adresse à personne,
 * et il ne peut pas être refusé.
 *
 * Le test qui ne trompe pas : lisez le nom à l'expert métier. S'il comprend,
 * c'est un événement de domaine. `SendConfirmationEmail` n'en est pas un.
 *
 * La charge utile reste plate : un événement est fait pour voyager.
 */
export function BookingConfirmed(booking, eventId) {
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

export function BookingCancelled(booking, eventId) {
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

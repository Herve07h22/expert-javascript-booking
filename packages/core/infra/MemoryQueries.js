import { canBeCancelled } from "../domain/rules/canBeCancelled.js";

/**
 * Le service de lecture. Il a le droit d'être efficace, il nomme un écran,
 * et il ne retourne AUCUN objet du domaine : des chaînes et des nombres.
 */
export class MemoryQueries {
  constructor(bookings, accommodations) {
    this._bookings = bookings;
    this._accommodations = accommodations;
  }

  /** Tout ce qu'il faut à la page "mes réservations", et rien d'autre. */
  async bookingsOfTenant(tenantId, today) {
    const bookings = await this._bookings.listBookingsForTenantId(tenantId);
    const accommodations = await this._accommodations.all();
    // Une Map construite une fois : aucune requête dans une boucle.
    const byId = new Map(accommodations.map((a) => [a.id, a]));

    return bookings
      .map((booking) => {
        const accommodation = byId.get(booking.accommodationId);
        return {
          id: booking.id,
          status: booking.status,
          cancellable: canBeCancelled(booking, today),
          accommodationId: booking.accommodationId,
          name: accommodation.name,
          location: accommodation.location,
          imageUrl: accommodation.imageUrl,
          from: booking.stay.from.toString(),
          to: booking.stay.to.toString(),
          nights: booking.stay.nights,
          guests: booking.guests.total,
          price: accommodation.price * booking.stay.nights,
        };
      })
      .sort((a, b) => a.from.localeCompare(b.from));
  }
}

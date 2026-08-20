import { canBeCancelled } from "../domain/rules/canBeCancelled.js";
import type { CalendarDay } from "../domain/values/CalendarDay.js";
import type {
  AccommodationRepository,
  BookingRepository,
  BookingView,
  Queries,
  TenantId,
} from "../domain/ports.js";

/**
 * Le service de lecture : il a le droit d'être efficace, il nomme un écran,
 * et il ne retourne AUCUN objet du domaine.
 */
export class MemoryQueries implements Queries {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly accommodations: AccommodationRepository
  ) {}

  /** Tout ce qu'il faut à la page "mes réservations", et rien d'autre. */
  async bookingsOfTenant(
    tenantId: TenantId,
    today: CalendarDay
  ): Promise<BookingView[]> {
    const bookings = await this.bookings.listBookingsForTenantId(tenantId);
    const accommodations = await this.accommodations.all();
    // Une Map construite une fois : aucune requête dans une boucle.
    const byId = new Map(accommodations.map((a) => [a.id as string, a]));

    return bookings
      .map((booking) => {
        const accommodation = byId.get(booking.accommodationId);
        if (!accommodation) {
          throw new Error(`Unknown accommodation ${booking.accommodationId}`);
        }
        return {
          id: booking.id as string,
          status: booking.status,
          cancellable: canBeCancelled(booking, today),
          accommodationId: booking.accommodationId as string,
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

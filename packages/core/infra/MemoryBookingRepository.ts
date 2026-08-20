import { canHost } from "../domain/rules/canHost.js";
import type { Booking } from "../domain/entities/Booking.js";
import type { Occupancy } from "../domain/values/Occupancy.js";
import type { Stay } from "../domain/values/Stay.js";
import type {
  Accommodation,
  AccommodationRepository,
  BookingRepository,
} from "../domain/ports.js";

export class MemoryBookingRepository implements BookingRepository {
  private bookings: Booking[] = [];

  /** Un repository qui a besoin d'un autre le reçoit ; il ne va pas le chercher. */
  constructor(private readonly accommodations: AccommodationRepository) {}

  /** Un upsert : le repository enregistre des états, pas que des créations. */
  async save(booking: Booking): Promise<void> {
    const index = this.bookings.findIndex((b) => b.id === booking.id);
    if (index === -1) this.bookings.push(booking);
    else this.bookings[index] = booking;
  }

  async findById(id: string): Promise<Booking | null> {
    return this.bookings.find((booking) => booking.id === id) ?? null;
  }

  async listBookingsForAccommodationId(
    accommodationId: string
  ): Promise<Booking[]> {
    return this.bookings.filter((b) => b.accommodationId === accommodationId);
  }

  async listBookingsForTenantId(tenantId: string): Promise<Booking[]> {
    return this.bookings.filter((booking) => booking.tenantId === tenantId);
  }

  /**
   * La méthode dit ce qu'elle VEUT, pas comment l'obtenir : en SQL, ce sera
   * un `where` avec un index, pas quatre ans d'historique chargés en mémoire.
   */
  async findOverlapping(
    accommodationId: string,
    stay: Stay
  ): Promise<Booking[]> {
    return this.bookings.filter(
      (booking) =>
        booking.isActive() &&
        booking.accommodationId === accommodationId &&
        booking.stay.overlaps(stay)
    );
  }

  async getAvailableAccommodations(
    stay: Stay,
    occupancy?: Occupancy
  ): Promise<Accommodation[]> {
    const bookedIds = this.bookings
      .filter((booking) => booking.isActive() && booking.stay.overlaps(stay))
      .map((booking) => booking.accommodationId as string);

    const all = await this.accommodations.all();
    return all
      .filter((accommodation) => !bookedIds.includes(accommodation.id))
      .filter(
        (accommodation) => !occupancy || canHost(accommodation, occupancy)
      );
  }
}

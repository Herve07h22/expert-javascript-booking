import { canHost } from "../domain/rules/canHost.js";

export class MemoryBookingRepository {
  _bookings = [];

  /** Un repository qui a besoin d'un autre le reçoit ; il ne va pas le chercher. */
  constructor(accommodations) {
    this._accommodations = accommodations;
  }

  /** Un upsert : le repository enregistre des états, pas seulement des créations. */
  async save(booking) {
    const index = this._bookings.findIndex((b) => b.id === booking.id);
    if (index === -1) this._bookings.push(booking);
    else this._bookings[index] = booking;
  }

  async findById(id) {
    return this._bookings.find((booking) => booking.id === id) ?? null;
  }

  async listBookingsForAccommodationId(accommodationId) {
    return this._bookings.filter(
      (booking) => booking.accommodationId === accommodationId
    );
  }

  async listBookingsForTenantId(tenantId) {
    return this._bookings.filter((booking) => booking.tenantId === tenantId);
  }

  async findOverlapping(accommodationId, stay) {
    return this._bookings.filter(
      (booking) =>
        booking.isActive() &&
        booking.accommodationId === accommodationId &&
        booking.stay.overlaps(stay)
    );
  }

  async getAvailableAccommodations(stay, occupancy) {
    const bookedAccommodationsIds = this._bookings
      .filter((booking) => booking.isActive() && booking.stay.overlaps(stay))
      .map((booking) => booking.accommodationId);

    const all = await this._accommodations.all();
    return all
      .filter(
        (accommodation) => !bookedAccommodationsIds.includes(accommodation.id)
      )
      .filter(
        (accommodation) => !occupancy || canHost(accommodation, occupancy)
      );
  }
}

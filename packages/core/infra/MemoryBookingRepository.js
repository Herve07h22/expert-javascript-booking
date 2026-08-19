import { fakeAccommodations } from "./fakeAccommodations.js";

export class MemoryBookingRepository {
  _bookings = [];
  _accommodations = fakeAccommodations;

  async save(booking) {
    this._bookings.push(booking);
  }

  async listBookingsForAccommodationId(accommodationId) {
    return this._bookings.filter(
      (booking) => booking.accommodationId === accommodationId
    );
  }

  async listBookingsForTenantId(tenantId) {
    return this._bookings.filter((booking) => booking.tenantId === tenantId);
  }

  /** @param stay {import("../domain/values/Stay.js").Stay} la période recherchée */
  async getAvailableAccommodations(stay) {
    const bookedAccommodationsIds = this._bookings
      .filter((booking) => booking.stay.overlaps(stay))
      .map((booking) => booking.accommodationId);

    return this._accommodations.filter(
      (accommodation) => !bookedAccommodationsIds.includes(accommodation.id)
    );
  }
}

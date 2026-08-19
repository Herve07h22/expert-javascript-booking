import { canHost } from "../domain/rules/canHost.js";

export class MemoryBookingRepository {
  _bookings = [];

  /** Un repository qui a besoin d'un autre le reçoit ; il ne va pas le chercher. */
  constructor(accommodations) {
    this._accommodations = accommodations;
  }

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

  /**
   * Les réservations de ce logement qui recouvrent la période.
   * La méthode dit ce qu'elle veut, pas comment l'obtenir : en SQL, ce sera
   * un `where` avec un index, pas un chargement de quatre ans d'historique.
   */
  async findOverlapping(accommodationId, stay) {
    return this._bookings.filter(
      (booking) =>
        booking.accommodationId === accommodationId &&
        booking.stay.overlaps(stay)
    );
  }

  /**
   * @param stay {import("../domain/values/Stay.js").Stay} la période recherchée
   * @param occupancy {import("../domain/values/Occupancy.js").Occupancy} facultatif
   */
  async getAvailableAccommodations(stay, occupancy) {
    const bookedAccommodationsIds = this._bookings
      .filter((booking) => booking.stay.overlaps(stay))
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

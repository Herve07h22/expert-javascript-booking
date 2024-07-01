import { toDate, isOverlapped } from "../domain/app/dates";

export class MemoryBookingRepository {
  _bookings = [];
  _accomodations = [{ id: "accomodation-1" }, { id: "accomodation-2" }];
  async save(booking) {
    this._bookings.push(booking);
  }
  async listBookingsForAccomodationId(accomodationId) {
    return this._bookings.filter(
      (booking) => booking.accomodationId === accomodationId
    );
  }
  async listBookingsForTenantId(tenantId) {
    return this._bookings.filter((booking) => booking.tenantId === tenantId);
  }
  async getAvailableAccomodations({ from, to }) {
    const bookedAccomodationsIds = this._bookings
      .filter((booking) =>
        isOverlapped(booking.interval, { from: toDate(from), to: toDate(to) })
      )
      .map((booking) => booking.accomodationId);

    return this._accomodations.filter(
      (accomodation) =>
        !bookedAccomodationsIds.some((id) => id === accomodation.id)
    );
  }
}

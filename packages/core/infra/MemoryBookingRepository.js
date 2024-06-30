import { fakeAccomodations } from "./fakeAccomodations";

export class MemoryBookingRepository {
  _bookings = [];
  _accomodations = fakeAccomodations;

  async getAccomodations() {
    return this._accomodations;
  }

  async save(booking) {
    this._bookings.push(booking);
  }

  async listBookingsForAccomodationId(accomodationId) {
    return this._bookings.filter(
      (booking) => booking.accomodationId === accomodationId
    );
  }
}

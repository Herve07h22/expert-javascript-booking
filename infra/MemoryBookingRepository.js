export class MemoryBookingRepository {
  _bookings = [];
  async save(booking) {
    this._bookings.push(booking);
  }
  async listBookingsForAccomodationId(accomodationId) {
    return this._bookings.filter(
      (booking) => booking.accomodationId === accomodationId
    );
  }
}

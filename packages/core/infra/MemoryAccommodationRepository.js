import { fakeAccommodations } from "./fakeAccommodations.js";

export class MemoryAccommodationRepository {
  _accommodations = fakeAccommodations;

  async findById(id) {
    return (
      this._accommodations.find((accommodation) => accommodation.id === id) ??
      null
    );
  }

  async all() {
    return this._accommodations;
  }
}

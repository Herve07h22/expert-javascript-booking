import { accommodationToDomain } from "./SQLBookingRepository.js";

export class SQLAccommodationRepository {
  constructor(db) {
    this._db = db;
  }

  async findById(id) {
    const { rows } = await this._db.query(
      `select * from accommodations where id = $1`,
      [id]
    );
    return rows[0] ? accommodationToDomain(rows[0]) : null;
  }

  async all() {
    const { rows } = await this._db.query(
      `select * from accommodations order by id`
    );
    return rows.map(accommodationToDomain);
  }
}

import { accommodationToDomain } from "./SQLBookingRepository.js";
import type { Accommodation, AccommodationRepository } from "@booking/core";
import type { Queryable } from "./Queryable.js";

export class SQLAccommodationRepository implements AccommodationRepository {
  constructor(private readonly db: Queryable) {}

  async findById(id: string): Promise<Accommodation | null> {
    const { rows } = await this.db.query(
      `select * from accommodations where id = $1`,
      [id]
    );
    return rows[0] ? accommodationToDomain(rows[0]) : null;
  }

  async all(): Promise<Accommodation[]> {
    const { rows } = await this.db.query(
      `select * from accommodations order by id`
    );
    return rows.map(accommodationToDomain);
  }
}

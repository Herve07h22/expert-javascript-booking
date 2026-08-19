import {
  Booking,
  Stay,
  Occupancy,
  AccommodationNotAvailable,
} from "@booking/core";

const EXCLUSION_VIOLATION = "23P01";

/** Le snake_case s'arrête ici. Chaque monde garde ses conventions. */
function toDomain(row) {
  const stay = Stay.parse({ from: row.starts_on, to: row.ends_on });
  const guests = Occupancy.of({
    adults: row.adults,
    children: row.children,
  });

  if (stay.isError() || guests.isError()) {
    // Une ligne illisible dans NOTRE base n'est pas une erreur métier :
    // c'est un bug, une migration ratée, une corruption. On s'arrête.
    throw new Error(
      `Corrupted booking ${row.id}: ${stay.error ?? guests.error}`
    );
  }

  return new Booking({
    id: row.id,
    tenantId: row.tenant_id,
    accommodationId: row.accommodation_id,
    guests: guests.value,
    stay: stay.value,
    status: row.status,
  });
}

function toRow(booking) {
  return [
    booking.id,
    booking.tenantId,
    booking.accommodationId,
    booking.guests.adults,
    booking.guests.children,
    booking.stay.from.toString(),
    booking.stay.to.toString(),
    booking.status,
  ];
}

export class SQLBookingRepository {
  /** Le repository REÇOIT sa connexion : on peut lui passer une transaction. */
  constructor(db) {
    this._db = db;
  }

  async save(booking) {
    try {
      await this._db.query(
        `insert into bookings
           (id, tenant_id, accommodation_id, adults, children, starts_on, ends_on, status)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         on conflict (id) do update set status = excluded.status`,
        toRow(booking)
      );
    } catch (error) {
      // La frontière traduit les données ET les erreurs.
      if (error.code === EXCLUSION_VIOLATION) {
        throw AccommodationNotAvailable(booking.accommodationId);
      }
      throw error; // tout le reste remonte intact
    }
  }

  async findById(id) {
    const { rows } = await this._db.query(
      `select * from bookings where id = $1`,
      [id]
    );
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async listBookingsForAccommodationId(accommodationId) {
    const { rows } = await this._db.query(
      `select * from bookings where accommodation_id = $1 order by starts_on`,
      [accommodationId]
    );
    return rows.map(toDomain);
  }

  async listBookingsForTenantId(tenantId) {
    const { rows } = await this._db.query(
      `select * from bookings where tenant_id = $1 order by starts_on`,
      [tenantId]
    );
    return rows.map(toDomain);
  }

  /** `&&` sur deux daterange : c'est Stay.overlaps, dit en SQL. */
  async findOverlapping(accommodationId, stay) {
    const { rows } = await this._db.query(
      `select * from bookings
        where accommodation_id = $1
          and status = 'confirmed'
          and daterange(starts_on, ends_on, '[)')
           && daterange($2::date, $3::date, '[)')`,
      [accommodationId, stay.from.toString(), stay.to.toString()]
    );
    return rows.map(toDomain);
  }

  async getAvailableAccommodations(stay, occupancy) {
    const { rows } = await this._db.query(
      `select a.* from accommodations a
        where ($3::int is null or a.capacity >= $3::int)
          and not exists (
            select 1 from bookings b
             where b.accommodation_id = a.id
               and b.status = 'confirmed'
               and daterange(b.starts_on, b.ends_on, '[)')
                && daterange($1::date, $2::date, '[)')
          )
        order by a.id`,
      [stay.from.toString(), stay.to.toString(), occupancy?.total ?? null]
    );
    return rows.map(accommodationToDomain);
  }
}

export function accommodationToDomain(row) {
  return {
    id: row.id,
    hostId: row.host_id,
    name: row.name,
    location: row.location,
    capacity: row.capacity,
    price: row.price_cents / 100, // les centimes restent en base
    imageUrl: row.image_url,
  };
}

import {
  Booking,
  Stay,
  Occupancy,
  AccommodationId,
  BookingId,
  TenantId,
  UserId,
  AccommodationNotAvailable,
} from "@booking/core";
import type {
  Accommodation,
  BookingRepository,
  BookingStatus,
} from "@booking/core";
import type { Queryable, Row } from "./Queryable.js";

const EXCLUSION_VIOLATION = "23P01";

/** Le snake_case s'arrête ici. Chaque monde garde ses conventions. */
function toDomain(row: Row): Booking {
  const stay = Stay.parse({ from: row.starts_on, to: row.ends_on });
  const guests = Occupancy.of({
    adults: row.adults,
    children: row.children,
  });

  if (stay.isError() || guests.isError()) {
    // Une ligne illisible dans NOTRE base n'est pas une erreur métier :
    // c'est un bug, une migration ratée, une corruption. On s'arrête.
    throw new Error(
      `Corrupted booking ${String(row.id)}: ${String(
        stay.isError() ? stay.error.message : guests.error.message
      )}`
    );
  }

  return new Booking({
    id: BookingId(String(row.id)),
    tenantId: TenantId(String(row.tenant_id)),
    accommodationId: AccommodationId(String(row.accommodation_id)),
    guests: guests.value,
    stay: stay.value,
    status: row.status as BookingStatus,
  });
}

export function accommodationToDomain(row: Row): Accommodation {
  return {
    id: AccommodationId(String(row.id)),
    hostId: UserId(String(row.host_id)),
    name: String(row.name),
    location: String(row.location),
    capacity: Number(row.capacity),
    price: Number(row.price_cents) / 100, // les centimes restent en base
    imageUrl: row.image_url ? String(row.image_url) : undefined,
  };
}

export class SQLBookingRepository implements BookingRepository {
  /** Le repository REÇOIT sa connexion : on peut lui passer une transaction. */
  constructor(private readonly db: Queryable) {}

  async save(booking: Booking): Promise<void> {
    try {
      await this.db.query(
        `insert into bookings
           (id, tenant_id, accommodation_id, adults, children, starts_on, ends_on, status)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         on conflict (id) do update set status = excluded.status`,
        [
          booking.id,
          booking.tenantId,
          booking.accommodationId,
          booking.guests.adults,
          booking.guests.children,
          booking.stay.from.toString(),
          booking.stay.to.toString(),
          booking.status,
        ]
      );
    } catch (error) {
      // La frontière traduit les données ET les erreurs.
      if ((error as { code?: string }).code === EXCLUSION_VIOLATION) {
        throw AccommodationNotAvailable(booking.accommodationId);
      }
      throw error; // tout le reste remonte intact
    }
  }

  async findById(id: string): Promise<Booking | null> {
    const { rows } = await this.db.query(
      `select * from bookings where id = $1`,
      [id]
    );
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async listBookingsForAccommodationId(
    accommodationId: string
  ): Promise<Booking[]> {
    const { rows } = await this.db.query(
      `select * from bookings where accommodation_id = $1 order by starts_on`,
      [accommodationId]
    );
    return rows.map(toDomain);
  }

  async listBookingsForTenantId(tenantId: string): Promise<Booking[]> {
    const { rows } = await this.db.query(
      `select * from bookings where tenant_id = $1 order by starts_on`,
      [tenantId]
    );
    return rows.map(toDomain);
  }

  /** `&&` sur deux daterange : c'est Stay.overlaps, dit en SQL. */
  async findOverlapping(
    accommodationId: string,
    stay: Stay
  ): Promise<Booking[]> {
    const { rows } = await this.db.query(
      `select * from bookings
        where accommodation_id = $1
          and status = 'confirmed'
          and daterange(starts_on, ends_on, '[)')
           && daterange($2::date, $3::date, '[)')`,
      [accommodationId, stay.from.toString(), stay.to.toString()]
    );
    return rows.map(toDomain);
  }

  async getAvailableAccommodations(
    stay: Stay,
    occupancy?: Occupancy
  ): Promise<Accommodation[]> {
    const { rows } = await this.db.query(
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

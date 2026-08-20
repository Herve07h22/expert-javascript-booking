import type { BookingView, Queries, TenantId, CalendarDay } from "@booking/core";
import type { Queryable } from "./Queryable.js";

/**
 * Le service de lecture prend le chemin court : une seule requête, une
 * jointure, aucune entité reconstruite. Le problème N+1 n'existe plus,
 * et la Map construite à la main s'appelle maintenant `join`.
 */
export class SQLQueries implements Queries {
  constructor(private readonly db: Queryable) {}

  async bookingsOfTenant(
    tenantId: TenantId,
    today: CalendarDay
  ): Promise<BookingView[]> {
    const { rows } = await this.db.query(
      `select b.id, b.status, b.starts_on, b.ends_on,
              b.adults + b.children as guests,
              (b.ends_on - b.starts_on) as nights,
              a.id as accommodation_id, a.name, a.location, a.image_url,
              a.price_cents * (b.ends_on - b.starts_on) as price_cents
         from bookings b
         join accommodations a on a.id = b.accommodation_id
        where b.tenant_id = $1
        order by b.starts_on`,
      [tenantId]
    );

    const todayIso = today.toString();
    return rows.map((row) => ({
      id: String(row.id),
      status: String(row.status),
      // Même règle que canBeCancelled : deux jours ISO se comparent
      // lexicographiquement. Le test de contrat tient les deux versions.
      cancellable: row.status === "confirmed" && todayIso < String(row.starts_on),
      accommodationId: String(row.accommodation_id),
      name: String(row.name),
      location: String(row.location),
      imageUrl: row.image_url ? String(row.image_url) : undefined,
      from: String(row.starts_on),
      to: String(row.ends_on),
      nights: Number(row.nights),
      guests: Number(row.guests),
      price: Number(row.price_cents) / 100,
    }));
  }
}

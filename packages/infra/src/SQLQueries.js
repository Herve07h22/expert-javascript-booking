/**
 * Le service de lecture prend le chemin court : une seule requête, une
 * jointure, aucune entité reconstruite. Le problème N+1 n'existe plus.
 */
export class SQLQueries {
  constructor(db) {
    this._db = db;
  }

  async bookingsOfTenant(tenantId, today) {
    const { rows } = await this._db.query(
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
      id: row.id,
      status: row.status,
      // Même règle que canBeCancelled : deux jours ISO se comparent
      // lexicographiquement. Le test de contrat tient les deux versions.
      cancellable: row.status === "confirmed" && todayIso < row.starts_on,
      accommodationId: row.accommodation_id,
      name: row.name,
      location: row.location,
      imageUrl: row.image_url,
      from: row.starts_on,
      to: row.ends_on,
      nights: Number(row.nights),
      guests: Number(row.guests),
      price: row.price_cents / 100,
    }));
  }
}

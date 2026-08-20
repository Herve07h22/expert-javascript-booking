import pg from "pg";
import { configurePgTypes } from "../src/pgTypes.js";
import { migrate as runMigrations } from "../src/migrate.js";

/**
 * Un faux PostgreSQL partagerait les bugs de votre compréhension de
 * PostgreSQL. La question qui nous occupe — comment daterange traite-t-il
 * des bornes égales ? — n'a qu'une seule autorité.
 */
export function testDatabase() {
  configurePgTypes();
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });

  return {
    pool,

    async migrate() {
      await pool.query(`drop schema public cascade; create schema public;`);
      // Le même migrateur qu'en production : c'est LUI que les tests doivent
      // exercer, pas une variante écrite pour l'occasion.
      await runMigrations(process.env.TEST_DATABASE_URL as string);
    },

    /** Brutal, lisible, et instantané sur des tables vides. */
    async reset() {
      await pool.query(
        `truncate bookings, sessions, accommodations, users restart identity cascade`
      );
      await seed(pool);
    },

    close: () => pool.end(),
  };
}

async function seed(pool: pg.Pool) {
  const users = [
    ["tenant-1", "faketenant@mail.com"],
    ["tenant-2", "otherguest@mail.com"],
    ["host-1", "claire@mail.com"],
    ["host-2", "yanis@mail.com"],
    ["host-3", "marek@mail.com"],
  ];
  for (const [id, email] of users) {
    await pool.query(
      `insert into users (id, email, hashed_password) values ($1, $2, $3)`,
      [id, email, "hashed:secret"]
    );
  }

  const accommodations = [
    ["accommodation-1", "host-1", "Villa 6 pièces avec piscine", "Saint-Rémy-de-Provence", 8, 23000],
    ["accommodation-2", "host-1", "Mas provençal rénové", "Gordes", 6, 18000],
    ["accommodation-3", "host-2", "Studio vue mer", "Cassis", 2, 9500],
    ["accommodation-4", "host-2", "Chalet en bord de piste", "Le Grand-Bornand", 10, 32000],
    ["accommodation-5", "host-3", "Gîte au calme", "Sciotot", 4, 11000],
    ["accommodation-6", "host-3", "Loft d'architecte", "Bordeaux", 3, 14000],
  ];
  for (const [id, hostId, name, location, capacity, priceCents] of accommodations) {
    await pool.query(
      `insert into accommodations (id, host_id, name, location, capacity, price_cents, image_url)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [id, hostId, name, location, capacity, priceCents, `https://picsum.photos/seed/${id}/400/300`]
    );
  }
}

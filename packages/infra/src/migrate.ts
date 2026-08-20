import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, "..", "migrations");

/**
 * Le schéma n'est pas un document : c'est du code source, versionné, revu,
 * appliqué de la même façon partout.
 *
 * Trois règles :
 * - on n'édite JAMAIS une migration déjà appliquée, on en ajoute une nouvelle ;
 * - on ne modifie jamais la production à la main ;
 * - une migration doit pouvoir tourner PENDANT que l'application tourne,
 *   donc rester compatible avec la version précédente du code
 *   (étendre, déployer, puis contracter).
 */
export async function migrate(databaseUrl: string): Promise<string[]> {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const applied: string[] = [];

  try {
    await pool.query(
      `create table if not exists schema_migrations (
         name       text primary key,
         applied_at timestamptz not null default now()
       )`
    );

    const { rows } = await pool.query<{ name: string }>(
      `select name from schema_migrations`
    );
    const done = new Set(rows.map((row) => row.name));

    for (const file of readdirSync(migrationsDir).sort()) {
      if (!file.endsWith(".sql") || done.has(file)) continue;

      const client = await pool.connect();
      try {
        // Une migration est atomique : tout, ou rien.
        await client.query("begin");
        await client.query(readFileSync(join(migrationsDir, file), "utf8"));
        await client.query(
          `insert into schema_migrations (name) values ($1)`,
          [file]
        );
        await client.query("commit");
        applied.push(file);
      } catch (error) {
        await client.query("rollback");
        throw new Error(`Migration ${file} failed: ${String(error)}`);
      } finally {
        client.release();
      }
    }
    return applied;
  } finally {
    await pool.end();
  }
}

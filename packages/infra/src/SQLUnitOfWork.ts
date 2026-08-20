import { Rollback } from "@booking/core";
import type { Context, Dependencies, UnitOfWork } from "@booking/core";
import type { Queryable } from "./Queryable.js";

const RETRYABLE = new Set([
  "40001", // serialization_failure
  "40P01", // deadlock_detected
]);

interface Pool {
  connect(): Promise<Queryable & { release(): void }>;
}

export class SQLUnitOfWork implements UnitOfWork {
  constructor(
    private readonly pool: Pool,
    private readonly build: (db: Queryable) => Dependencies,
    private readonly attempts = 3
  ) {}

  /**
   * Rejouer impose une condition à tout ce qu'on écrit dans une commande :
   * elle ne doit RIEN faire d'irréversible. On ne rejoue pas un mail.
   */
  async run(
    work: (dependencies: Dependencies) => Promise<Context>,
    attempt = 1
  ): Promise<Context> {
    try {
      return await this.runOnce(work);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code && RETRYABLE.has(code) && attempt < this.attempts) {
        await new Promise((resolve) => setTimeout(resolve, 10 * attempt));
        return this.run(work, attempt + 1);
      }
      throw error;
    }
  }

  private async runOnce(
    work: (dependencies: Dependencies) => Promise<Context>
  ): Promise<Context> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      // Les commandes reçoivent des repositories branchés sur CETTE transaction.
      const result = await work(this.build(client));
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      if (error instanceof Rollback) return error.context; // erreur métier
      throw error; // panne
    } finally {
      // Une connexion non rendue au pool est perdue pour tout le monde.
      client.release();
    }
  }
}

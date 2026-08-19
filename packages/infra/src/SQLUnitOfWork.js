import { Rollback } from "./Rollback.js";

const RETRYABLE = new Set([
  "40001", // serialization_failure
  "40P01", // deadlock_detected
]);

export class SQLUnitOfWork {
  /**
   * @param pool le pool de connexions
   * @param buildRepositories (client) => dependencies liées à CE client
   */
  constructor(pool, buildRepositories, attempts = 3) {
    this._pool = pool;
    this._build = buildRepositories;
    this._attempts = attempts;
  }

  async run(work, attempt = 1) {
    try {
      return await this.runOnce(work);
    } catch (error) {
      if (RETRYABLE.has(error.code) && attempt < this._attempts) {
        await new Promise((resolve) => setTimeout(resolve, 10 * attempt));
        return this.run(work, attempt + 1);
      }
      throw error;
    }
  }

  async runOnce(work) {
    const client = await this._pool.connect();
    try {
      await client.query("begin");
      // Les commandes reçoivent des repositories branchés sur CETTE transaction.
      const result = await work(this._build(client));
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

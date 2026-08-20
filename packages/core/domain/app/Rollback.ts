import type { Context } from "./Context.js";

/**
 * Une exception de transport, invisible depuis le domaine.
 * On ne demande pas poliment à PostgreSQL d'annuler : on laisse remonter.
 */
export class Rollback extends Error {
  readonly context: Context;

  constructor(context: Context) {
    super("rollback");
    this.name = "Rollback";
    this.context = context;
  }
}

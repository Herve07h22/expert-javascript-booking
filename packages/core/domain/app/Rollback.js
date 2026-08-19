/**
 * Une exception de transport, jamais visible depuis le domaine.
 * On ne demande pas poliment à PostgreSQL d'annuler : on laisse remonter.
 */
export class Rollback extends Error {
  constructor(context) {
    super("rollback");
    this.context = context;
  }
}

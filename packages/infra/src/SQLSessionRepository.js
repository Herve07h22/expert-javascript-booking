import { randomUUID } from "node:crypto";

/**
 * Un jeton de production : imprévisible, opaque, périssable.
 * Jamais un compteur, jamais l'id de l'utilisateur, jamais son email.
 */
export class SQLSessionRepository {
  constructor(db, ttlDays = 7) {
    this._db = db;
    this._ttlDays = ttlDays;
  }

  async create(user) {
    const token = randomUUID(); // 122 bits d'aléa
    await this._db.query(
      `insert into sessions (token, user_id, expires_at)
       values ($1, $2, now() + ($3 || ' days')::interval)`,
      [token, user.id, String(this._ttlDays)]
    );
    return token;
  }

  async findUserId(token) {
    const { rows } = await this._db.query(
      `select user_id from sessions where token = $1 and expires_at > now()`,
      [token]
    );
    return rows[0]?.user_id ?? null;
  }

  async destroy(token) {
    await this._db.query(`delete from sessions where token = $1`, [token]);
  }
}

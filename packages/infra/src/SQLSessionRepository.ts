import { randomUUID } from "node:crypto";
import { SessionToken, UserId } from "@booking/core";
import type { SessionRepository, User } from "@booking/core";
import type { Queryable } from "./Queryable.js";

/**
 * Un jeton de production : imprévisible, opaque, périssable.
 * Jamais un compteur, jamais l'id de l'utilisateur, jamais son email.
 */
export class SQLSessionRepository implements SessionRepository {
  constructor(
    private readonly db: Queryable,
    private readonly ttlDays = 7
  ) {}

  async create(user: User): Promise<SessionToken> {
    const token = randomUUID(); // 122 bits d'aléa
    await this.db.query(
      `insert into sessions (token, user_id, expires_at)
       values ($1, $2, now() + ($3 || ' days')::interval)`,
      [token, user.id, String(this.ttlDays)]
    );
    return SessionToken(token);
  }

  async findUserId(token: unknown): Promise<UserId | null> {
    const { rows } = await this.db.query(
      `select user_id from sessions where token = $1 and expires_at > now()`,
      [String(token)]
    );
    return rows[0] ? UserId(String(rows[0].user_id)) : null;
  }

  async destroy(token: unknown): Promise<void> {
    await this.db.query(`delete from sessions where token = $1`, [
      String(token),
    ]);
  }
}

import { UserId } from "@booking/core";
import type { User, UserRepository } from "@booking/core";
import type { Queryable, Row } from "./Queryable.js";

function toDomain(row: Row): User {
  return {
    id: UserId(String(row.id)),
    email: String(row.email),
    hashedPassword: String(row.hashed_password),
  };
}

export class SQLUserRepository implements UserRepository {
  constructor(private readonly db: Queryable) {}

  /** Une adresse email n'est pas sensible à la casse. */
  async findByEmail(email: unknown): Promise<User | null> {
    const { rows } = await this.db.query(
      `select * from users where lower(email) = lower($1)`,
      [String(email)]
    );
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const { rows } = await this.db.query(`select * from users where id = $1`, [
      id,
    ]);
    return rows[0] ? toDomain(rows[0]) : null;
  }
}

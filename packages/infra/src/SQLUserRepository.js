function toDomain(row) {
  return {
    id: row.id,
    email: row.email,
    hashedPassword: row.hashed_password,
  };
}

export class SQLUserRepository {
  constructor(db) {
    this._db = db;
  }

  /** Une adresse email n'est pas sensible à la casse. */
  async findByEmail(email) {
    const { rows } = await this._db.query(
      `select * from users where lower(email) = lower($1)`,
      [String(email)]
    );
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findById(id) {
    const { rows } = await this._db.query(`select * from users where id = $1`, [
      id,
    ]);
    return rows[0] ? toDomain(rows[0]) : null;
  }
}

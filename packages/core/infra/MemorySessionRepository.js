/**
 * Un jeton de production doit être imprévisible, opaque et périssable.
 * Celui-ci n'est aucun des trois : il doit être LISIBLE dans les tests.
 * La production doit être sûre, le test doit être lisible.
 */
export class MemorySessionRepository {
  _sessions = new Map();
  _counter = 0;

  async create(user) {
    const token = `session-${++this._counter}`;
    this._sessions.set(token, user.id);
    return token;
  }

  async findUserId(token) {
    return this._sessions.get(token) ?? null;
  }

  async destroy(token) {
    this._sessions.delete(token);
  }
}

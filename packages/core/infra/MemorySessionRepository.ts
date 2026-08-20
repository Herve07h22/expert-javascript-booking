import { SessionToken, UserId } from "../domain/ids.js";
import type { SessionRepository, User } from "../domain/ports.js";

/**
 * Un jeton de production doit être imprévisible, opaque et périssable.
 * Celui-ci n'est aucun des trois : il doit être LISIBLE dans les tests.
 * La production doit être sûre, le test doit être lisible.
 */
export class MemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, UserId>();
  private counter = 0;

  async create(user: User): Promise<SessionToken> {
    const token = SessionToken(`session-${++this.counter}`);
    this.sessions.set(token, user.id);
    return token;
  }

  async findUserId(token: unknown): Promise<UserId | null> {
    return this.sessions.get(String(token)) ?? null;
  }

  async destroy(token: unknown): Promise<void> {
    this.sessions.delete(String(token));
  }
}

import { UserId } from "../domain/ids.js";
import type { User, UserRepository } from "../domain/ports.js";

const user = (id: string, email: string): User => ({
  id: UserId(id),
  email,
  hashedPassword: "hashed:secret",
});

export class MemoryUserRepository implements UserRepository {
  private readonly users: User[] = [
    user("tenant-1", "faketenant@mail.com"),
    user("tenant-2", "otherguest@mail.com"),
    // Le propriétaire est un utilisateur de la plateforme, pas une mention
    // sur une fiche : il signe un contrat et touchera une commission.
    user("host-1", "claire@mail.com"),
    user("host-2", "yanis@mail.com"),
    user("host-3", "marek@mail.com"),
  ];

  /** Une adresse email n'est pas sensible à la casse : c'est une règle métier. */
  async findByEmail(email: unknown): Promise<User | null> {
    const wanted = String(email).toLowerCase();
    return this.users.find((u) => u.email.toLowerCase() === wanted) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }
}
